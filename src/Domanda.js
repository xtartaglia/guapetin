import { Bodies, Composite } from 'matter-js'
import groundstuck from './groundstuck.png'
import nuvola from './nuvola.png'

export default function Domanda (props) {
  const { screenHeight, groundHeight, x, q } = props
  const domanda = Composite.create()

  const altezzaA = (screenHeight-groundHeight*0.8)/4.5*0.4
  const altezzaB = (screenHeight-groundHeight*0.8)/4.5*0.6
  const altezzaC = (screenHeight-groundHeight*0.8)/9
  const larghezza = 200
  var box;

  for (let i=0;i<9;i++) {

    if (i%2===0 && i !==8 && i !== 0) {
        box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight*0.8)/9+(screenHeight-groundHeight*0.8)/18,larghezza-10,altezzaA, {isStatic:true, label:'box'+i, chamfer: {radius:altezzaA/2},render:{overflow:'hidden',sprite:{texture:nuvola,xScale:1.2,yScale:altezzaA/100*1.6}}})
    }

    else if (i === 0) {
        box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight*0.8)/9+(screenHeight-groundHeight*0.8)/18,larghezza-10,altezzaC, {isStatic:true, label:'box'+i, chamfer: {radius:altezzaC/2},render:{overflow:'hidden',sprite:{texture:nuvola,xScale:1.2,yScale:altezzaC/100*1.6}}})
    }

    else if (i === 8) {
        box = Bodies.rectangle(x+500,screenHeight-screenHeight/12.5,larghezza,altezzaC, {isStatic:true, chamfer: {radius: 15}, label:'box'+i, render:{overflow:'hidden',sprite:{texture:groundstuck,xScale:1,yScale:altezzaC/150}}})
    }

    else {
        box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight*0.8)/9+(screenHeight-groundHeight*0.8)/18,larghezza,altezzaB, {isStatic:true, isSensor:true, label:'box'+i, render:{visible:false}})

        if (!q["r"+(i-1)/2].giusto) {
            box.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0,
              };
        }

        else {
            console.log("giusto!")
        }
    }
    Composite.add(domanda, box)
  }

  return domanda
}