import { useEffect, useRef } from 'react'
import { Engine, Bodies, World, Composite, Body } from 'matter-js'
import { fabric } from 'fabric';

export default function Domanda (props) {
  const { screenHeight, groundHeight, x, q, player } = props
  const domanda = Composite.create()

  const altezzaA = (screenHeight-groundHeight)/4.5*0.4
  const altezzaB = (screenHeight-groundHeight)/4.5*0.6
  const altezzaC = (screenHeight-groundHeight)/9
  const larghezza = 200

  for (let i=0;i<9;i++) {

    if (i%2===0 && i !==8 && i !== 0) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,larghezza,altezzaA, {isStatic:true, render:{fillStyle:'red'}})
    }

    else if (i === 0) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,larghezza,altezzaC, {isStatic:true, render:{fillStyle:'red'}})
    }

    else if (i === 8) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,larghezza,altezzaC, {isStatic:true, render:{fillStyle:'red'}})
    }

    else {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,larghezza,altezzaB, {isStatic:true, isSensor:true, render:{visible:false}})

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