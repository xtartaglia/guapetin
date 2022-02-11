import Matter, { Body, Composite, Bodies } from 'matter-js'
import { useEffect, useRef, useState } from 'react'
import Domanda from './Domanda'
import doggo from './doggo.png'
import audio from './i-ruv-you-1.mp3'
import domande from './domande.json'
import { fabric } from 'fabric'

function createImage(string, w, h) {

  var canvas = new fabric.Canvas()

  canvas.width = w
  canvas.height = h
  

  var text = new fabric.Textbox(string,{
      width:w,
      fontSize:15,
      textAlign:'center',
      fontFamily: 'Ubuntu',
      fill: '#fff',
      stroke: '#000',
      strokeWidth: 4,
      paintFirst: 'stroke', // stroke behind fill
  })

  canvas.add(text)
  canvas.centerObject(text)

  return canvas.toDataURL("image/png");
}

function getAnswers(q,screenHeight,screenWidth,playerPos,groundHeight) {
  let r = Object.keys(q)
  let rgraph = Composite.create()
  console.log(r)

  for (let i=0;i<r.length-1;i++) {
    var sprite = createImage(domande["domanda0"]["r"+i].r.toUpperCase(),200,(screenHeight-groundHeight)/4.5*0.6)
    console.log(sprite)
    var ans = Bodies.rectangle(playerPos+screenWidth/4,(2*i+1)*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,200,(screenHeight-groundHeight)/4.5*0.6,{isStatic:true, isSensor:true, render:{sprite:{texture:sprite}}})
    ans.collisionFilter = {
      'group': -1,
      'category': 2,
      'mask': 0,
    }
    Composite.add(rgraph, [ans])
  }

  return rgraph;
}


export default function App(props) {
  const scena = useRef()
  let resize = false
  let gameOver = false
  let j = 1;
  let clean = false
  var punteggio = 0


  useEffect(()=>{
    var Engine = Matter.Engine,
        World = Matter.World,
        Render = Matter.Render,
        Bodies = Matter.Bodies,
        Runner = Matter.Runner,
        Events = Matter.Events

    var engine = Engine.create({
    })

    var domanda;
    var domanda2;

    var render = Render.create({
      element:scena.current,
      engine: engine,
      options: {
        width:window.innerWidth,
        height:window.innerHeight,
        wireframes: false,
        background:'transparent'
      }
    })

    var player = Bodies.rectangle(window.innerWidth/4, window.innerHeight/2, 50, 37, {chamfer: {radius: 15}, render:{sprite:{texture:doggo}}})
    Body.setMass(player, 20)

    var camera = Bodies.rectangle(player.position.x+render.options.width/4, player.position.y,1,1, {isSensor:true, isStatic:true, render:{visible:false}})
    camera.collisionFilter = {
      'group': -1,
      'category': 2,
      'mask': 0,
    };

    function handleClick() {
      if (engine.gravity.y == 0) {
        engine.gravity.y = 0.05
        domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:render.options.width/2+300, q:domande["domanda0"]})
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"  

        var qr = Composite.create()
        var sprite = createImage(domande["domanda0"].d.toUpperCase(),300,100)
        console.log(sprite)
        var q = Bodies.rectangle(player.position.x,player.position.y-render.options.height/4,300,100, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
        Composite.add(qr, [q])
        Composite.add(engine.world, [qr])
        setTimeout(()=>{
          Composite.add(qr,[getAnswers(domande["domanda0"],render.options.height,render.options.width,player.position.x,render.options.height/50)])
        },1000)

      }
      console.log("click")
      if (!gameOver) {
        var sound = document.querySelector(".audio")
        sound.playbackRate = 1.5
        sound.play()
        Body.applyForce(player,{x:player.position.x, y:player.position.y},{x:0, y:-0.1})
      }
    }

    document.addEventListener("click", handleClick)
    window.addEventListener("resize", ()=>{
      resize = true;
      render.bounds.max.x = window.innerWidth;
      render.bounds.max.y = window.innerHeight;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      console.log("yo")
      console.log("hey bitch")
      Composite.remove(engine.world, [ground])
      ground = Bodies.rectangle(render.options.width/2, window.innerHeight-window.innerHeight/100, window.innerWidth, window.innerHeight/50, { isStatic: true, render:{fillStyle: 'red'} });
      Composite.add(engine.world, [ground])
    })

    engine.gravity.y = 0

    var ground = Bodies.rectangle(render.options.width/2, window.innerHeight-window.innerHeight/100, render.options.width, window.innerHeight/50, { isStatic: true, render:{fillStyle: 'red'} });
    Composite.add(engine.world, [ground, camera, player]);

    function handleChange(vecchio) {
      var distanza;
      if (render.options.height>=render.options.width) {
        distanza = render.options.height
      }

      else {
        distanza = render.options.width
      }
      var nuovo = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+distanza*3/4, q:domande["domanda"+j]})
      Composite.add(engine.world, [nuovo])
        setTimeout(()=>{
          Composite.remove(engine.world, [vecchio])
          clean = false
        },10000)
    }
    

    Events.on(engine, "afterUpdate", ()=>{
      if (typeof domanda !== "undefined" && !gameOver) {
        Composite.translate(domanda, {x:-5, y:0})
      }
    })

    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      console.log(pairs[0].bodyB)

      if (!pairs[0].bodyA.isSensor && !pairs[0].bodyB.isSensor) {
        gameOver=true
        document.body.style.animationPlayState = "paused"
        console.log("game over")
      }

      else {
        punteggio++
        console.log(punteggio)
      }

      // change object colours to show those in an active collision (e.g. resting contact)
      for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i];
          pair.bodyA.render.fillStyle = '#333';
          pair.bodyB.render.fillStyle = '#333';
      }
  });

    Runner.run(engine);
    Render.run(render);
  }, [scena])

  return (
    <div ref={scena} className="canvas" >
      <audio className="audio" src={audio} preload="auto"></audio>
    </div>
  )
}