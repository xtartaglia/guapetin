import Matter, { Body, Composite, Bodies } from 'matter-js'
import { useEffect, useRef, useState } from 'react'
import Domanda from './Domanda'
import doggo from './doggo.png'
import win from './i-ruv-you-1.mp3'
import jump from './jump.mp3'
import domande from './domande.json'
import { fabric } from 'fabric'
import './index.css'
import earth from './ground.png'
import gO from './game over.mp3'

function createImage(string, w, h, type) {

  var canvas = new fabric.Canvas()

  if (type === 0) {
    canvas.width = w
    canvas.height = h
    var stroke='black'
    var size = 30
  }

  else {
    canvas.width = w/2
    canvas.height = h
    var stroke='none'
    var size = 10
  }

  var limit = canvas.height;

var text = new fabric.Textbox(string);
// set initial values
text.set({
    width: canvas.width,
    textAlign: 'center',
    fontFamily:'Arial',
    fontWeight: 'bold',
    fontSize: 30,
    fill:'white',
    stroke:stroke
});
  while (text.width > canvas.width) {
    text.set(text.width -= 10);
}
while (text.height >  limit) {
    text.set({fontSize: text.fontSize-1});
}

  canvas.add(text)
  canvas.centerObject(text)

  return canvas.toDataURL("image/png");
}

function getAnswers(q,screenHeight,screenWidth,playerPos,groundHeight, scale) {
  let r = Object.keys(q)
  let rgraph = Composite.create()

  if (screenWidth<screenHeight) {
    var pos = playerPos+screenWidth/8*3
    var type = 1
  }

  else {
    var pos = playerPos+screenWidth/4
    var type = 0
  }

  for (let i=0;i<r.length-1;i++) {
    var sprite = createImage(q["r"+i].r,200*scale,(screenHeight-groundHeight)/4.5*0.6, type)
    var ans = Bodies.rectangle(pos,(2*i+1)*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,200*scale,(screenHeight-groundHeight)/4.5*0.6,{isStatic:true, isSensor:true, render:{sprite:{texture:sprite}}})
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


  const [scale, setScale] = useState(window.innerHeight/746)
  const [scaleX, setScaleX] = useState(1/window.devicePixelRatio)

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
    var qr;
    var type;

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

    if (window.innerWidth<window.innerHeight) {
      type = 1
    }

    else {
      type = 0
    }


    var player = Bodies.rectangle(window.innerWidth/4, window.innerHeight/2, 50*scale, 37*scale, {chamfer: {radius: 15}, render:{sprite:{texture:doggo, xScale:scale,yScale:scale}}})
    Body.setMass(player, 20)

    var punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
          punti.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0,
          }
        Composite.add(engine.world,[punti])

    function handleClick() {
      if (gameOver) {
        restart()
      }

      if (engine.gravity.y == 0) {
        engine.gravity.y = 0.1*scale
        domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+500*scaleX, q:domande["domanda0"], scale:scale})
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"  

        qr = Composite.create()
        var sprite = createImage(domande["domanda0"].d.toUpperCase(),render.options.width/4*3,render.options.height/8,0)
        var q = Bodies.rectangle(player.position.x,render.options.height/8,300,100, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
        q.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0
        }
        Composite.add(qr, [q])
        Composite.add(engine.world, [qr])
        var risp = getAnswers(domande["domanda0"],render.options.height,render.options.width,player.position.x,render.options.height/50,scale)
        setTimeout(()=>{
          Composite.add(qr,[risp])
        },1000)

        var update = setInterval(()=>{
          if (typeof domanda !== "undefined" && !gameOver) {
            Composite.translate(domanda,{x:-2,y:0})
          }
    
          else if (gameOver) {
            clearInterval(update)
          }

          var lastChild = Composite.allBodies(domanda)[Composite.allBodies(domanda).length-1]

          if (lastChild.position.x-player.position.x < render.options.width/4) {
            Composite.remove(qr, [q])
            Composite.translate(risp,{x:-2,y:0})

            if (Composite.allBodies(risp)[Composite.allBodies(risp).length-1].position.x-player.position.x < 100) {
              Composite.remove(qr, [risp])
            }

            

            if (lastChild.position.x<-100) {
              Composite.remove(engine.world, [domanda])
              domanda = domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+1000*scaleX, q:domande["domanda"+j], scale:scale})
              Composite.add(engine.world, [domanda])
              sprite = createImage(domande["domanda"+j].d.toUpperCase(),render.options.width/4,render.options.height/4,0)
              q = Bodies.rectangle(player.position.x,render.options.height/8,300,100, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
              q.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0,
              }
              Composite.add(qr, [q])

              risp = getAnswers(domande["domanda"+j],render.options.height,render.options.width,player.position.x,render.options.height/50,scale)
              setTimeout(()=>{
              Composite.add(qr,[risp])
              },1000)

              j++
            }
          }

          if (j===10) {
            gameOver=true
            clearInterval(update)
          }
    
        },1000/60)

      }

      if (!gameOver) {
        var sound = document.querySelector(".jump")
        sound.playbackRate = 2
        sound.play()
        Body.applyForce(player,{x:player.position.x, y:player.position.y},{x:0, y:-0.1*scale})
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
  
      Composite.remove(engine.world, [ground])
      ground = Bodies.rectangle(render.options.width/2, window.innerHeight-window.innerHeight/100, window.innerWidth, window.innerHeight/50, { isStatic: true, render:{sprite:{texture:earth, xScale:1,yScale:window.innerHeight/50/100}} });
      Composite.add(engine.world, [ground])
    })

    engine.gravity.y = 0

    var ground = Bodies.rectangle(render.options.width/2, window.innerHeight-window.innerHeight/100, render.options.width, window.innerHeight/50, { isStatic: true, render:{sprite:{texture:earth,xScale:1,yScale:window.innerHeight/50/100}} });
    Composite.add(engine.world, [ground, player]);

    function restart() {
      try {
        Composite.remove(engine.world,[domanda,qr,punti])
      } catch (error) {
        console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }
      engine.gravity.y = 0
      Body.setPosition(player,{x:render.options.width/4,y:render.options.height/2})
      Body.setAngle(player,0)
      Body.setVelocity(player,{x:0,y:0})
      Body.setAngularVelocity(player,0)
      punteggio = 0
      j = 1

      punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
          punti.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0,
          }
        Composite.add(engine.world,[punti])

      console.log(punteggio)
      gameOver=false
    }

    Events.on(engine, 'collisionEnd', function(event) {
      var pairs = event.pairs;

      var sensorA = pairs[0].bodyA.isSensor
      var sensorB = pairs[0].bodyB.isSensor

      //Somehow I have to do this, otherwise the object is gone.

      setTimeout(()=>{
        if ((sensorA || sensorB) && !gameOver) {

          punteggio++
          var win = document.querySelector(".win")
          win.play()
            Composite.remove(engine.world,punti)
            punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
            punti.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
            }
          Composite.add(engine.world,[punti])
  
        }
      },100)
    })

    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      console.log(pairs[0].bodyB)

      if (!pairs[0].bodyA.isSensor && !pairs[0].bodyB.isSensor) {
        gameOver=true
        document.body.style.animationPlayState = "paused"
        console.log("game over")
        document.querySelector(".gO").play()
      }
  });

    Runner.run(engine);
    Render.run(render);
  }, [scena])

  return (
    <div ref={scena} className="canvas" >
      <audio className="win" src={win} preload="auto"></audio>
      <audio className="jump" src={jump} preload="auto"></audio>
      <audio className="gO" src={gO} preload="auto"></audio>
    </div>
  )
}