import Matter, { Body, Composite, Bodies } from 'matter-js'
import { useEffect, useRef, useState } from 'react'
import Domanda from './Domanda'
import doggo from './doggo.png'
import win from './i-ruv-you-1.mp3'
import jump from './jump.mp3'
import domande from './domande.json'
import { fabric } from 'fabric'
import './App.css'
import './fullscreen.css'
import earth from './ground.png'
import gO from './game over.mp3'
import doggoLove from './doggo_love.png'
import doggoSad from './doggo_sad.png'
import doggoDead from './doggo_dead.png'
import wrong from './wrong.wav'
import swal from 'sweetalert2'

function createImage(string, w, h, type) {

  var canvas = new fabric.Canvas()
  var size;
  var fontFamily = 'Arial'
  var fill

  if (type === 0) {
    canvas.width = w
    canvas.height = h
    size = 30
    fill='white'
  }

  else if (type === 1) {
    canvas.width = w
    canvas.height = h
    size = 20
    fill='white'
  }

  else if (type === 2) {
    canvas.width = w
    canvas.height = h
    size = 1000
    fill='white'
  }

  var words = string.split(' ')
  var sizes = []

  for (var i=0;i<words.length;i++) {
    var graphText = new fabric.Text(words[i], {
      fontSize:size,
      fontFamily:fontFamily,
      fontWeight: 'bold',
      fill:fill
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

  

  var limit = canvas.height;

var text = new fabric.Textbox(string);
// set initial values
text.set({
    width: canvas.width,
    textAlign: 'center',
    fontFamily:fontFamily,
    fontWeight: 'bold',
    fontSize: size,
    fill:'white'
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
  var pos
  var type

  if (screenWidth<screenHeight) {
    pos = playerPos+screenWidth/3
    type = 1
  }

  else {
    pos = playerPos+screenWidth/3
    type = 0
  }

  for (let i=0;i<r.length-1;i++) {
    var sprite = createImage(q["r"+i].r,200,(screenHeight-groundHeight)/4.5*0.6, type)
    if (i===0) {
      
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

function shuffle(obj,excl) {
  var shuffledObj = {}
  var objArray = Object.keys(obj)
  var rArray = []
  
  for (var i = 0;i<Object.keys(obj).length;i++) {
  
  	if (i === excl) {
    	shuffledObj[Object.keys(obj)[i]] = obj[objArray[i]]
      
      objArray.splice(i,1)
    }
    
    else {
    	var random = Math.floor(Math.random()*objArray.length)

   	shuffledObj[Object.keys(obj)[i]] = obj[objArray[random]]
    
    
    rArray.push(obj[objArray[random]])
    objArray.splice(random,1)
    }
  }
 

  return shuffledObj;
}

function shuffleDomande(obj) {
	for (var i=0; i<Object.keys(obj).length;i++) {
  	obj[Object.keys(obj)[i]] = shuffle(obj[Object.keys(obj)[i]],0)
  }
  for (i=0; i<Object.keys(obj).length;i++) {
  	obj = shuffle(obj)
  }

  return obj
}


export default function App(props) {
  const scena = useRef()
  let resize = false
  let gameOver = true
  let j = 1
  let won = false
  var punteggio = 0
  var l = 0
  var checkedWon = false
  var conto
  var noClick = true
  var justStarted = true
  var alreadyTouched = false
  var mov = -2
  var fullscreen = false
  var player
  var ground
  var punti
  var started = false


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
        width:window.screen.width,
        height:window.screen.height,
        wireframes: false,
        background:'transparent'
      }
    })

    console.log("before fullscreen"+render.options.height)

    swal.fire({
      title:"Guapetín",
      html:"Il gioco è semplice. Rispondi alle domande passando attraverso lo spazio corrispondente alla risposta giusta senza far cadere Guapetín.<br>Attento alle nuvole, sono tossiche 😱",
      icon:"info",
      confirmButtonText: 'Daje annamoooooo',
      confirmButtonColor: '#5ca353',
      color: 'white',
      background: '#373737'
    })
    .then(()=> {
      document.body.requestFullscreen()
    })

    function fullscreenChange(event) {
      if (document.fullscreenElement) {
        render.options.height = window.screen.height
        render.options.width = window.screen.width
        console.log("HEY BITCH FULLSCREEEEEN"+render.options.height+window.outerHeight)
        setScale(window.screen.height/746)
        fullscreen = true
        if (!started)
        {
          start()
          started = true
        }
      }

      else {
        mov = 0
        engine.gravity.y = 0
        swal.fire({
          title:"Ci vuoi lasciare?",
          html:"Sei sicuro di voler abbandonare la partita?",
          icon:"warning",
          showCancelButton: true,
          confirmButtonText: 'Tornare al gioco',
          confirmButtonColor: '#5ca353',
          cancelButtonText: 'Abbandonare la partita',
          color: 'white',
          background: '#373737'
        })
        .then((result)=> {
          if (result.value===true) {
            document.body.requestFullscreen()
            mov = -2
            engine.gravity.y = 0.1*scale
          }

          else {
            window.top.close()
          }
        })
      }
    }
  
    document.addEventListener('fullscreenchange',fullscreenChange)

    if (render.options.width<render.options.height) {
      type = 1
    }

    else {
      type = 0
    }

    

    function handleClick() {
      if (justStarted && !gameOver && fullscreen) {
        justStarted = false
        domande = shuffleDomande(domande)
        engine.gravity.y = 0.1*scale
        domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+1000*scaleX, q:domande["domanda0"], scale:scale})
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"  

        qr = Composite.create()
        var sprite = createImage(domande["domanda0"].d,render.options.width/2,(render.options.height/50*49)/4.5*0.3,type)
        var q = Bodies.rectangle(player.position.x,(render.options.height/50*49)/4.5*0.3,(render.options.height/50*49)/4.5*0.3,render.options.width/2, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
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
          console.log(render.options.height)
          if (typeof domanda !== "undefined" && !gameOver && !alreadyTouched) {
            Composite.translate(domanda,{x:mov,y:0})
          }
    
          else if (gameOver) {
            clearInterval(update)
          }

          var lastChild = Composite.allBodies(domanda)[Composite.allBodies(domanda).length-1]


          if (lastChild.position.x-100<player.position.x+37*scale/2 && !checkedWon) {
            
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

          if (lastChild.position.x-player.position.x < render.options.width/3) {
            Composite.remove(qr, [q])
            Composite.translate(risp,{x:mov,y:0})

            if (Composite.allBodies(risp)[Composite.allBodies(risp).length-1].position.x-player.position.x < 100) {
              Composite.remove(qr, [risp])
            }

            if (lastChild.position.x<-100) {
              Composite.remove(engine.world, [domanda])
              checkedWon = false
              if (j===Object.keys(domande).length) {
                gameOver=true
                started = false
                clearInterval(update)
                engine.gravity.y = 0
                document.body.style.animationPlayState = "paused"
                try {

                  for (var v = 0;v<document.styleSheets[2].cssRules.length;v++) {
                    var newRule = document.styleSheets[2].cssRules[v].cssText.replace("running","paused")
                    document.styleSheets[2].deleteRule(v)
                    document.styleSheets[2].insertRule(newRule,v)
                  }
                  
                }
              
                catch(error) {
                  console.log(error)
                }
                setTimeout(()=>{
                  swal.fire({
                    title:"La partita è finita",
                    html:"Il tuo punteggio è: "+punteggio+"<br>Chiudi questo messaggio per iniziare una nuova partita",
                    icon:"info",
                    showCancelButton: true,
                    confirmButtonText: 'Daje annamoooooo',
                    confirmButtonColor: '#5ca353',
                    cancelButtonText: '¡No gracias señora!',
                    color: 'white',
                    background: '#373737'
                  })
                  .then((result)=> {
                    
                    if (result.value === true) {
                      start()
                    }
                    else {
                      window.top.close()
                    }
                  })
                },2000)
              }
              domanda = Domanda({screenHeight:render.options.height,groundHeight:render.options.height/50, x:player.position.x+1000*scaleX, q:domande["domanda"+j], scale:scale})
              Composite.add(engine.world, [domanda])
              sprite = createImage(domande["domanda"+j].d,render.options.width/2,(render.options.height/50*49)/4.5*0.3,type)
              q = Bodies.rectangle(player.position.x,(render.options.height/50*49)/4.5*0.3,render.options.width/2,(render.options.height/50*49)/4.5*0.3, {isSensor:true, isStatic:true, render:{sprite:{texture:sprite}}})
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
        sound.volume = 0.5
        sound.play()
        Body.applyForce(player,{x:player.position.x, y:player.position.y},{x:0, y:-0.1*scale})
      }
    }

    document.addEventListener("click", handleClick)


    document.addEventListener( 'visibilitychange' , function() {
      if (document.hidden) {
          
          engine.gravity.y = 0
          mov = 0
      } else {
          
          mov = -2
          engine.gravity.y = 0.01*scale
      }
  }, false );

    function start() {
      engine.gravity.y = 0
      try {
        Composite.remove(engine.world,[ground,player,punti])
      }
      catch(error) {
        
      }
      player = Bodies.rectangle(render.options.width/3, render.options.height/2, 50*scale, 37*scale, {chamfer: {radius: 15}, render:{sprite:{texture:doggo, xScale:scale,yScale:scale}}})
      Body.setMass(player, 20)
      console.log(render.options.height+" "+window.screen.height+" "+window.innerHeight)
      ground = Bodies.rectangle(render.options.width/2, render.options.height-render.options.height/100, render.options.width, render.options.height/50, { isStatic: true, render:{sprite:{texture:earth,xScale:1,yScale:render.options.height/50/100}} });

      punti = Bodies.rectangle(player.position.x,render.options.height*0.8,1,1,{isStatic:true,isSensor:true, render:{sprite:{texture:createImage(punteggio.toString(),30,30,type)}}})
          punti.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0,
          }

      Composite.add(engine.world, [ground, player, punti]);

      domande = shuffleDomande(domande)

      j = 1
      if (l === 0) {
        var go = setInterval(()=>{

          try {
            Composite.remove(engine.world,[conto])
          } catch (error) {
            console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
          }

          conto = Bodies.rectangle(render.options.width/2,render.options.height/2,render.options.width/4,render.options.height/4,{label:'conto',isStatic:true,isSensor:true, render:{sprite:{texture:createImage((3-l).toString(),render.options.width/4,render.options.height/4,2)}}})
          punti.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0,
          }
          Composite.add(engine.world, [conto])

          

          if (l === 3)
          {

            try {

              for (var v = 0;v<document.styleSheets[2].cssRules.length;v++) {
                var newRule = document.styleSheets[2].cssRules[v].cssText.replace("paused","running")
                document.styleSheets[2].deleteRule(v)
                document.styleSheets[2].insertRule(newRule,v)
              }
              
            }
          
            catch(error) {
              console.log(error)
            }
          punteggio = 0
          
          gameOver=false
          noClick = true
          l = 0
          won = false
          justStarted = true
          
          handleClick()
            clearInterval(go)
            setTimeout(()=>{
              Composite.remove(engine.world,[conto])
            },1000)
          }
          
          else {
            l++
          }
        },1000)
      }

      else {
        
      }
      try {
        Composite.remove(engine.world,[domanda,qr,punti,conto])
      } catch (error) {
        console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }
    }

    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      

      if (!pairs[0].bodyA.isSensor && !pairs[0].bodyB.isSensor && !gameOver && !alreadyTouched) {
        
        alreadyTouched = true
        document.body.style.animationPlayState="paused"
        try {

          for (var v = 0;v<document.styleSheets[2].cssRules.length;v++) {
            var newRule = document.styleSheets[2].cssRules[v].cssText.replace("running","paused")
            document.styleSheets[2].deleteRule(v)
            document.styleSheets[2].insertRule(newRule,v)
          }
          
        }
      
        catch(error) {
          console.log(error)
        }
        
        var gOSound = document.querySelector(".gO")
        gOSound.volume = 0.5
        gOSound.play()
        player.render.sprite.texture = doggoDead
        gameOver=true
        started = false

        setTimeout(()=>{

          swal.fire({
            title:"NOOOOOOO! Hai fatto male a guapetín :(",
            html:"Il tuo punteggio è: "+punteggio+"<br>Chiudi questo messaggio per iniziare una nuova partita",
            icon:"error",
            showCancelButton: true,
            confirmButtonText: 'Daje annamoooooo',
            confirmButtonColor: '#5ca353',
            cancelButtonText: '¡No gracias señora!',
            color:'white',
            background: '#373737'
          })
          .then((result)=> {
            
            if (result.value === true) {
              start()
            }
            else {
              window.top.close()
            }
          })

          alreadyTouched = false
          player.render.sprite.texture = doggo
        },1000)

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
        win.volume = 0.5
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