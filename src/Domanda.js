import { useEffect, useRef } from 'react'
import { Engine, Bodies, World, Composite, Body } from 'matter-js'

function createCanvas(width, height, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (set2dTransform) {
      canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return canvas;
  }

function createImage(string, w, h) {

    let drawing = createCanvas(w, h);


    let ctx = drawing.getContext("2d");
    ctx.strokeStyle = "white";
    ctx.font = "8pt";
    ctx.shadowColor = "black"
    ctx.shadowOffsetX = '1'
    ctx.textAlign = "center";
    ctx.strokeText(string, w/2, h/2);

    return drawing.toDataURL("image/png");
}

export default function Domanda (props) {
  const { screenHeight, groundHeight, x, q } = props
  const domanda = Composite.create()

  var question = Bodies.rectangle(x, (screenHeight-groundHeight)/2, 300, 100, {isStatic:true, isSensor:true, render:{sprite:{texture:createImage(q.d.toUpperCase(),300,100)}}})

  Composite.add(domanda, question)
  for (let i=0;i<9;i++) {

    if (i%2===0 && i !==8 && i !== 0) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,100,(screenHeight-groundHeight)/4.5*0.4, {isStatic:true, render:{fillStyle:'red'}})
    }

    else if (i === 0) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,100,(screenHeight-groundHeight)/9, {isStatic:true, render:{fillStyle:'red'}})
    }

    else if (i === 8) {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,100,(screenHeight-groundHeight)/9, {isStatic:true, render:{fillStyle:'red'}})
    }

    else {
        var box = Bodies.rectangle(x+500,i*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,100,(screenHeight-groundHeight)/4.5*0.6, {isStatic:true, isSensor:true, render:{sprite:{texture:createImage(q["r"+(i-1)/2].r.toUpperCase(),100,50)}}})
    }
    Composite.add(domanda, box)
  }

  return domanda
}