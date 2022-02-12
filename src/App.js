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
import doggoLove from './doggo_love.png'
import doggoSad from './doggo_sad.png'
import doggoDead from './doggo_dead.png'
import wrong from './wrong.wav'

function createImage(string, w, h, type) {

  var canvas = new fabric.Canvas()
  var stroke;
  var size;
  var fontFamily = 'Arial'
  var fill

  if (type === 0) {
    canvas.width = w
    canvas.height = h
    stroke='black'
    size = 30
    fill='white'
  }

  else if (type === 1) {
    canvas.width = w
    canvas.height = h
    stroke='white'
    size = 20
    fill='white'
  }

  else if (type === 2) {
    canvas.width = w
    canvas.height = h
    stroke = 'white'
    size = 1000
    fill='white'
  }

  else if (type === 3) {
    canvas.width = w
    canvas.height = h
    stroke = 'orange'
    fill= 'orange'

    size = 1000
  }

  var words = string.split(' ')
  var sizes = []

  for (var i=0;i<words.length;i++) {
    var graphText = new fabric.Text(words[i], {
      fontSize:size,
      fontFamily:fontFamily,
      fontWeight: 'bold',
      fill:fill,
      stroke:stroke
    })
    
    while (graphText.width>canvas.width) {
      graphText.set({fontSize: graphText.fontSize-1})
    }
    //Math.min doesn't work if more values are equal
    if (!sizes.includes(graphText.fontSize)) {
      sizes.push(graphText.fontSize)
    }
  }

  size = Math.min.apply(null, sizes)

  console.log(size)

  var limit = canvas.height;

var text = new fabric.Textbox(string);
// set initial values
text.set({
    width: canvas.width,
    textAlign: 'center',
    fontFamily:fontFamily,
    fontWeight: 'bold',
    fontSize: size,
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
  console.log(canvas.toDataURL("image/png"))

  return canvas.toDataURL("image/png");
}

function getAnswers(q,screenHeight,screenWidth,playerPos,groundHeight, scale) {
  let r = Object.keys(q)
  let rgraph = Composite.create()
  var pos
  var type

  if (screenWidth<screenHeight) {
    pos = playerPos+screenWidth/8*3
    type = 1
  }

  else {
    pos = playerPos+screenWidth/4
    type = 0
  }

  for (let i=0;i<r.length-1;i++) {
    var sprite = createImage(q["r"+i].r,200,(screenHeight-groundHeight)/4.5*0.6, type)
    if (i===0) {
      console.log("w: "+200+" h: "+(screenHeight-groundHeight)/4.5*0.6)
    }
    var ans = Bodies.rectangle(pos,(2*i+1)*(screenHeight-groundHeight)/9+(screenHeight-groundHeight)/18,200,(screenHeight-groundHeight)/4.5*0.6,{isStatic:true, isSensor:true, render:{sprite:{texture:sprite}}})
    ans.collisionFilter = {
      'group': -1,
      'category': 2,
      'mask': 0,
    }
    Composite.add(rgraph, [ans])
  }

  return rgraph;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function mescolareDomande(domande) {
  for (var i=0;i<Object.keys(domande).length;i++) {
    
  }
}


export default function App(props) {
  const scena = useRef()
  let resize = false
  let gameOver = false
  let j = 1
  let won = false
  var punteggio = 0
  var l = 0
  var checkedWon = false
  var conto
  var noClick = true
  var justStarted = true


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

    function handleClick() {

      if (justStarted && !gameOver) {
        justStarted = false
        engine.gravity.y = 0.1*scale
        domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+1000*scaleX, q:domande["domanda0"], scale:scale})
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"  

        qr = Composite.create()
        var sprite = createImage(domande["domanda0"].d,render.options.width/2,(window.innerHeight/50*49)/4.5*0.3,type)
        var q = Bodies.rectangle(player.position.x,(window.innerHeight/50*49)/4.5*0.3,(window.innerHeight/50*49)/4.5*0.3,render.options.width/2, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
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
            Composite.remove(engine.world, [qr, domanda])
            Body.setPosition(player,{x:render.options.width/4,y:render.options.height/2})
            Body.setAngle(player,0)
            Body.setVelocity(player,{x:0,y:0})
            Body.setAngularVelocity(player,0)
            engine.gravity.y = 0
          }

          var lastChild = Composite.allBodies(domanda)[Composite.allBodies(domanda).length-1]

          if (lastChild.position.x<player.position.x-10 && !checkedWon) {
            checkedWon = true
            if (!won) {
              player.render.sprite.texture = doggoSad
              var sad = document.querySelector(".wrong")
              sad.play()
            setTimeout(()=>{
              player.render.sprite.texture = doggo
              won = false
            },2000)
            }
          }

          if (lastChild.position.x-player.position.x < render.options.width/4) {
            Composite.remove(qr, [q])
            Composite.translate(risp,{x:-2,y:0})

            if (Composite.allBodies(risp)[Composite.allBodies(risp).length-1].position.x-player.position.x < 100) {
              Composite.remove(qr, [risp])
            }

            if (lastChild.position.x<-100) {
              Composite.remove(engine.world, [domanda])
              checkedWon = false
              if (j===10) {
                gameOver=true
                document.body.style.animationPlayState = "paused"
                setTimeout(()=>{
                  alert("La partita è finita.\nIl tuo punteggio è: "+punteggio+"\nClicca su qualsiasi punto dello schermo dopo aver chiuso questo messaggio per iniziare una nuova partita.")
                },2000)
                clearInterval(update)
              }
              domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+1000*scaleX, q:domande["domanda"+j], scale:scale})
              Composite.add(engine.world, [domanda])
              sprite = createImage(domande["domanda"+j].d,render.options.width/2,(window.innerHeight/50*49)/4.5*0.3,type)
              q = Bodies.rectangle(player.position.x,(window.innerHeight/50*49)/4.5*0.3,render.options.width/2,(window.innerHeight/50*49)/4.5*0.3, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
              q.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0
              }
              Composite.add(qr, [q])

              risp = getAnswers(domande["domanda"+j],render.options.height,render.options.width,player.position.x,render.options.height/50,scale)
              setTimeout(()=>{
              Composite.add(qr,[risp])
              },1000)

              j++
            }
          }
    
        },1000/60)

      }

      if (!gameOver) {
        var sound = document.querySelector(".jump")
        sound.playbackRate = 2
        sound.play()
        Body.applyForce(player,{x:player.position.x, y:player.position.y},{x:0, y:-0.1*scale})
      }

      if (gameOver && noClick) {
        noClick = false
        if (l === 0) {
          var go = setInterval(()=>{

            try {
              Composite.remove(engine.world,[conto])
            } catch (error) {
              console.error(error);
              // expected output: ReferenceError: nonExistentFunction is not defined
              // Note - error messages will vary depending on browser
            }

            conto = Bodies.rectangle(render.options.width/2,render.options.height/2,render.options.width/4,render.options.height/4,{label:'conto',isStatic:true,isSensor:true, render:{sprite:{texture:createImage((5-l).toString(),render.options.width/4,render.options.height/4,2)}}})
            punti.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
            }
            Composite.add(engine.world, [conto])

            console.log(Composite.allBodies(engine.world))

            if (l === 5)
            {
              restart()
              clearInterval(go)
            }
            
            else {
              l++
            }
          },1000)
        }

        else {
          console.log("L IS NOT ZERO: "+l)
        }
      }

      else {
        console.log("gameOver: "+gameOver+" noClick: "+noClick)
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
    Composite.add(engine.world, [ground, player, punti]);

    function restart() {
      try {
        Composite.remove(engine.world,[domanda,qr,punti,conto])
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
      noClick = true
      l = 0
      won = false
      justStarted = true
      console.log("HERE IS L: "+l)
      handleClick()
    }

    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      console.log(pairs[0].bodyB)

      if (!pairs[0].bodyA.isSensor && !pairs[0].bodyB.isSensor && !gameOver) {
        gameOver=true
        document.body.style.animationPlayState = "paused"
        console.log("game over")
        document.querySelector(".gO").play()
        player.render.sprite.texture = doggoDead

        setTimeout(()=>{
          alert("NOOOOOOO! Hai fatto male a guapetín :(\nIl tuo punteggio è: "+punteggio+"\nClicca su qualsiasi punto dello schermo dopo aver chiuso questo messaggio per iniziare una nuova partita.")
          player.render.sprite.texture = doggo
        },2000)

        if (won) {
          punteggio=punteggio-1
            Composite.remove(engine.world,punti)
            punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
            punti.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
            }
          Composite.add(engine.world,[punti])
        }
      }

      else {
        if (!gameOver) {
          won = true
        var win = document.querySelector(".win")
        win.play()
        player.render.sprite.texture = doggoLove
            setTimeout(()=>{
              player.render.sprite.texture = doggo
              won = false
            },2000)

            punteggio++
            Composite.remove(engine.world,punti)
            punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
            punti.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
            }
          Composite.add(engine.world,[punti])
        }
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
      <audio className="wrong" src={wrong} preload="auto"></audio>
      <img src={doggoLove} preload="auto" hidden={true}></img>
      <img src={doggoSad} preload="auto" hidden={true}></img>
      <img src={doggoDead} preload="auto" hidden={true}></img>
    </div>
  )
}