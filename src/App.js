import Matter, { Body, Composite } from 'matter-js'
import { useEffect, useRef, useState } from 'react'
import Domanda from './Domanda'
import doggo from './doggo.png'
import audio from './i-ruv-you-1.mp3'
import domande from './domande.json'
import love from './lovecomp.png'


export default function App(props) {
  const scena = useRef()
  let resize = false
  let gameOver = false

  useEffect(()=>{
    var Engine = Matter.Engine,
        World = Matter.World,
        Render = Matter.Render,
        Bodies = Matter.Bodies,
        Runner = Matter.Runner,
        Events = Matter.Events

    var engine = Engine.create({
    })

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

    var player = Bodies.rectangle(100, window.innerHeight/2, 50, 37, {chamfer: {radius: 15}, render:{sprite:{texture:doggo}}})
    Body.setMass(player, 20)

    var camera = Bodies.rectangle(player.position.x, player.position.y,1,1, {isSensor:true, isStatic:true, render:{visible:false}})
    camera.collisionFilter = {
      'group': -1,
      'category': 2,
      'mask': 0,
    };

    function handleClick() {
      if (engine.gravity.y == 0) {
        engine.gravity.y = 0.05
        var domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:render.options.width/2+300, q:domande["domanda0"]})
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"
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
    

    Events.on(engine, "afterUpdate", ()=>{
      if (!gameOver) {
        Body.applyForce(player, {x:player.position.x, y:player.position.y}, {x:0.001, y:0})
        Body.setPosition(camera, {x:player.position.x,y:render.options.height/2})
        Body.setPosition(ground, {x:player.position.x,y:ground.position.y})
        Render.lookAt(render, camera,  {
        x: window.innerWidth/2,
        y: window.innerHeight/2
      });
      }

      else {
        //Engine.clear(engine)
        //console.log("game over")
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