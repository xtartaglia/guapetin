import { useEffect, useRef } from 'react'
import { Engine, Bodies, World, Composite, Body } from 'matter-js'
import { fabric } from 'fabric';


function createCanvas(width, height, set2dTransform = true, id) {
    const ratio = Math.ceil(window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.id = id;
    if (set2dTransform) {
      canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return canvas;
}

function createImage(string, w, h) {

    var canvas = new fabric.Canvas()

    canvas.width = w
    canvas.height = h
    

    var text = new fabric.Textbox(string,{
        width:w,
        fontSize:15,
        textAlign:'center',
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 4,
        paintFirst: 'stroke', // stroke behind fill
    })

    canvas.add(text)
    canvas.centerObject(text)

    return canvas.toDataURL("image/jpeg",1.0);
}

export default function Domanda (props) {
  const { screenHeight, groundHeight, x, q } = props
  const domanda = Composite.create()

  const altezzaA = (screenHeight-groundHeight)/4.5*0.4
  const altezzaB = (screenHeight-groundHeight)/4.5*0.6
  const altezzaC = (screenHeight-groundHeight)/9
  const larghezza = 200


  var question = Bodies.rectangle(x, (screenHeight-groundHeight)/2, 300, 100, {isStatic:true, isSensor:true, render:{sprite:{texture:createImage(q.d.toUpperCase(),400,100)}}})
  question.collisionFilter = {
    'group': -1,
    'category': 2,
    'mask': 0
}

  Composite.add(domanda, question)
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
        var sprite = createImage(q["r"+(i-1)/2].r.toUpperCase(),larghezza,altezzaB)
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,larghezza,altezzaB, {isStatic:true, isSensor:true})
        box.render.sprite.texture = sprite;

        if (!q["r"+(i-1)/2].giusto) {
            box.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0,
              };
        }
    }
    Composite.add(domanda, box)
  }

  return domanda
}