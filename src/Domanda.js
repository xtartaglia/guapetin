import { Bodies, Composite } from 'matter-js'
import groundstuck from './groundstuck.png'
import nuvola from './nuvola.png'

export default function Domanda (props) {
  const { screenHeight, groundHeight, x, q } = props
  const domanda = Composite.create()

  const altezzaA = (screenHeight-groundHeight)/4.5*0.4
  const altezzaB = (screenHeight-groundHeight)/4.5*0.6
  const altezzaC = (screenHeight-groundHeight)/9
  const altezzaD = (screenHeight-groundHeight)/4.5
  const larghezza = 200
  var r = Object.keys(q)
  var box;

  for (let i=0;i<(2*r.length-1);i++) {

    if (i%2===0 && i !==(2*r.length-2) && i !== 0) {
        box = Bodies.rectangle(x,i*(screenHeight-groundHeight)/(2*r.length-1)+(screenHeight-groundHeight)/(2*r.length-1)/2,larghezza-10,altezzaA, {isStatic:true, label:'box'+i, chamfer: {radius:altezzaA/2},render:{overflow:'hidden',sprite:{texture:nuvola,xScale:1.2,yScale:altezzaA/100*1.6}}})
    }

    else if (i === 0) {
        box = Bodies.rectangle(x,i*(screenHeight-groundHeight)/(2*r.length-1)+(screenHeight-groundHeight)/(2*r.length-1)/2,larghezza-10,altezzaC, {isStatic:true, label:'box'+i, chamfer: {radius:altezzaC/2},render:{overflow:'hidden',sprite:{texture:nuvola,xScale:1.2,yScale:altezzaC/100*1.6}}})
    }

    else if (i === (2*r.length-2)) {
        box = Bodies.rectangle(x,screenHeight-screenHeight/(2*r.length-1)/2,larghezza,altezzaD, {isStatic:true, chamfer: {radius: 15}, label:'box'+i, render:{overflow:'hidden',sprite:{texture:groundstuck,xScale:1,yScale:altezzaD/150}}})
    }

    else {
        box = Bodies.rectangle(x,i*i*(screenHeight-groundHeight)/(2*r.length-1)+(screenHeight-groundHeight)/(2*r.length-1)/2,larghezza,altezzaB, {isStatic:true, isSensor:true, label:'box'+i, render:{visible:false}})
        if (!q["r"+(i-1)/2].giusto) {
            box.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0,
              };
        }

        else {
        }
    }
    Composite.add(domanda, box)
  }

  return domanda
}