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

const rightAnswer = new Event('rightanswer')
var rispostaGiusta;
var volume = 1

function decodeThatShit(str) {
  str = decodeURI(str)

  str = str.replace("%3F", "?")
  str = str.replace("%2F", "/")
  str = str.replace("%2C", ",")
  str = str.replace("%3A", ":")
  str = str.replace("%26", "&")

  return str
}

function ordinare(data) {
  var newDomanda = {}
  var qst;

  for (var i = 0; i < data.results.length; i++) {

    console.log(qst)
    newDomanda["domanda" + i] = {
      d: decodeThatShit(data.results[i].question)
    }

    newDomanda["domanda" + i].r0 = {
      r: decodeThatShit(data.results[i].correct_answer),
      giusto: true
    }

    for (var j = 0; j < data.results[i].incorrect_answers.length; j++) {
      newDomanda["domanda" + i]["r" + (j + 1)] = {
        r: decodeThatShit(data.results[i].incorrect_answers[j]),
        giusto: false
      }


      console.log(data.results.length)
    }

  }

  return newDomanda
}

const getQuestions = async () => {
  try {
    var response = await fetch('https://opentdb.com/api.php?amount=10&category=22&encode=url3986');
    var data = await response.json();
    var questions = ordinare(data)
    console.log(questions)
    questions = shuffleDomande(questions)
    console.log(questions)


  } catch (e) {
    console.log(e.message);
  }

  return questions
}

function createImage(string, w, h, type, color, specW) {

  var canvas = new fabric.Canvas()
  var size;
  var fontFamily = 'Arial'
  var fill
  fill = 'white'

  canvas.width = w
  canvas.height = h

  if (type === 0) {
    size = 30
  }

  else if (type === 1) {
    size = 20
  }

  else if (type === 2) {
    size = 1000
  }

  var words = string.split(' ')
  var sizes = []

  for (var i = 0; i < words.length; i++) {
    var graphText = new fabric.Text(words[i], {
      fontSize: size,
      fontFamily: fontFamily,
      fontWeight: 'bold',
      fill: fill
    })

    while (graphText.width > canvas.width) {
      graphText.set({ fontSize: graphText.fontSize - 1 })
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

    textAlign: 'center',
    fontFamily: fontFamily,
    fontWeight: 'bold',
    fontSize: size,
    fill: 'white'
  });

  if (typeof specW === 'undefined') {
    //text.set({width : canvas.width})
    console.log("SEEEEEEEEEEEEEEET")
  }
  if (typeof color !== 'undefined') {
    text.backgroundColor = color
  }
  while (text.width > canvas.width) {
    text.set({ width : text.width - 10});
  }
  while (text.height > limit) {
    text.set({ fontSize: text.fontSize - 1 });
  }

  
  canvas.centerObject(text)
  canvas.add(text)

  return canvas.toDataURL("image/png");
}

function getAnswers(q, screenHeight, screenWidth, playerPos, groundHeight, scale) {
  let r = Object.keys(q)
  let rgraph = Composite.create()
  var pos
  var type

  if (screenWidth < screenHeight) {
    pos = playerPos + screenWidth / 3
    type = 1
  }

  else {
    pos = playerPos + screenWidth / 3
    type = 0
  }

  for (let i = 0; i < r.length - 1; i++) {
    var sprite = createImage(q["r" + i].r, 200, (screenHeight - groundHeight) / 4.5 * 0.6, type)
    if (q["r" + i].giusto) {
      rispostaGiusta = {
        r: q["r" + i].r,
        pos: (2 * i + 1) * (screenHeight - groundHeight) / (2 * r.length - 1) + (screenHeight - groundHeight) / (2 * r.length - 1) / 2
      }
    }
    var ans = Bodies.rectangle(pos, (2 * i + 1) * (screenHeight - groundHeight) / (2 * r.length - 1) + (screenHeight - groundHeight) / (2 * r.length - 1) / 2, 200, (screenHeight - groundHeight) / 4.5 * 0.6, { isStatic: true, isSensor: true, render: { sprite: { texture: sprite } } })
    ans.collisionFilter = {
      'group': -1,
      'category': 2,
      'mask': 0,
    }
    Composite.add(rgraph, [ans])
  }

  return rgraph;
}

function shuffle(obj, excl) {
  var shuffledObj = {}
  var objArray = Object.keys(obj)
  var rArray = []

  for (var i = 0; i < Object.keys(obj).length; i++) {

    if (i === excl) {
      shuffledObj[Object.keys(obj)[i]] = obj[objArray[i]]

      objArray.splice(i, 1)
    }

    else {
      var random = Math.floor(Math.random() * objArray.length)

      shuffledObj[Object.keys(obj)[i]] = obj[objArray[random]]


      rArray.push(obj[objArray[random]])
      objArray.splice(random, 1)
    }
  }


  return shuffledObj;
}

function shuffleDomande(obj) {
  for (var i = 0; i < Object.keys(obj).length; i++) {
    obj[Object.keys(obj)[i]] = shuffle(obj[Object.keys(obj)[i]], 0)
  }
  for (i = 0; i < Object.keys(obj).length; i++) {
    obj = shuffle(obj)
  }

  return obj
}


export default function App(props) {
  const scena = useRef()
  let resize = false
  let gameOver = true
  let j = 0
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
  var voluntary = false


  const [scale, setScale] = useState(window.innerHeight / 746)
  const [scaleX, setScaleX] = useState(1 / window.devicePixelRatio)

  useEffect(() => {
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
    var speed

    var render = Render.create({
      element: scena.current,
      engine: engine,
      options: {
        width: window.screen.width,
        height: window.screen.height + window.screenTop,
        wireframes: false,
        background: 'transparent'
      }
    })

    ground = Bodies.rectangle(window.screen.width / 2, window.screen.height - window.screen.height / 25, window.screen.width * 1.5, window.screen.height / 12.5, { isStatic: true, render: { sprite: { texture: earth, xScale: window.screen.width * 1.5 / 2400, yScale: window.screen.height / 12.5 / 150 } } });
    Composite.add(engine.world, [ground])

    console.log("before fullscreen" + window.screen.height)

    swal.fire({
      title: "Guapetín",
      html: "Il gioco è semplice. Rispondi alle domande passando attraverso lo spazio corrispondente alla risposta giusta senza far cadere Guapetín.<br>Attento alle nuvole, sono tossiche 😱<br><br><input type=checkbox id='audio' name='audio'><label for='audio'>Togliere l'audio?</label><br><input type=checkbox id='guepet' name='audio'><label for='guepet'>Sei un guapetón?</label>",
      icon: "info",
      confirmButtonText: 'Daje annamoooooo',
      confirmButtonColor: '#5ca353',
      color: 'white',
      background: '#373737',
      preConfirm: function () {
        return new Promise((resolve, reject) => {
          // get your inputs using their placeholder or maybe add IDs to them
          resolve({
            isMuted: document.getElementById("audio").checked,
            guepet: document.getElementById("guepet").checked
          });

          // maybe also reject() on some condition
        });
      }
    })
      .then((data) => {
        if (data.value.isMuted) {
          console.log(data.value.isMuted)
          volume = 0
          console.log("youpi")
        }
        else {
          console.log("malaise")
          console.log(data)
        }

        if (!data.value.guepet) {
          (async () => {
            domande = await getQuestions()
            console.log(domande)
            document.body.requestFullscreen()
          })()
        }
        else {
          document.body.requestFullscreen()
        }
      })

    function fullscreenChange(event) {
      if (document.fullscreenElement) {

        window.screen.orientation.lock('portrait')

        if (window.screen.width < window.screen.height) {
          type = 1
          speed = 1
        }

        else {
          type = 0
          speed = 1
        }
        console.log("HEY BITCH FULLSCREEEEEN" + window.screen.height + window.outerHeight)
        setScale(window.screen.height / 850)
        fullscreen = true
        if (!started) {
          console.log("I AM NOT STARTED!!")
          start()
          started = true
        }
      }

      else {
        mov = 0
        engine.gravity.y = 0
        if (!voluntary) {
          swal.fire({
            title: "Ci vuoi lasciare?",
            html: "Sei sicuro di voler abbandonare la partita?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: 'Tornare al gioco',
            confirmButtonColor: '#5ca353',
            cancelButtonText: 'Abbandonare la partita',
            color: 'white',
            background: '#373737'
          })
            .then((result) => {
              if (result.value === true) {
                document.body.requestFullscreen()
                mov = -2
                engine.gravity.y = 0.1 * scale
              }

              else {
                document.exitFullscreen()
                swal.fire({
                  title: "Se vedemo zi'",
                  html: "Spero il gioco ti sia piaciuto",
                  showCancelButton: false,
                  showConfirmButton: false,
                  color: 'white',
                  background: '#373737'
                })
                gameOver = true;
                try {
                  Composite.remove(engine.world, [qr, domanda, punti, conto, player])
                }
                catch (error) {

                }
              }
            })
        }
      }
    }

    document.addEventListener('fullscreenchange', fullscreenChange)
    document.addEventListener('resize', fullscreenChange)



    function handleClick() {
      if (justStarted && !gameOver && fullscreen) {
        justStarted = false

        engine.gravity.y = 0.1 * scale
        domanda = Domanda({ screenHeight: window.screen.height, groundHeight: window.screen.height / 12.5, x: player.position.x + 1000 * scaleX, q: domande["domanda0"], scale: scale })
        Composite.add(engine.world, [domanda])
        document.body.style.animationPlayState = "running"

        qr = Composite.create()
        var sprite = createImage(domande["domanda0"].d, window.screen.width / 2, (window.screen.height / 50 * 49) / 4.5 * 0.3, type)
        var q = Bodies.rectangle(window.screen.width / 2, (window.screen.height / 50 * 49) / 4.5 * 0.3, window.screen.width * 0.75, (window.screen.height / 50 * 49) / 4.5 * 0.3, { isSensor: true, isStatic: true, render: { sprite: { texture: sprite } } })
        q.collisionFilter = {
          'group': -1,
          'category': 2,
          'mask': 0
        }
        Composite.add(qr, [q])
        Composite.add(engine.world, [qr])
        var risp = getAnswers(domande["domanda0"], window.screen.height, window.screen.width, player.position.x, window.screen.height / 12.5, scale)
        setTimeout(() => {
          Composite.add(qr, [risp])
        }, 1000)

        var update = setInterval(() => {

          if (typeof punti != "undefined") {
            Body.setPosition(punti, { x: player.position.x, y: player.position.y - 60 })
          }

          if (typeof domanda !== "undefined" && !gameOver && !alreadyTouched) {
            Composite.translate(domanda, { x: mov * speed, y: 0 })
            Body.translate(ground, { x: mov * speed, y: 0 })
          }

          else if (gameOver) {
            clearInterval(update)
            Composite.remove(engine.world, punti)
          }

          if (ground.position.x < window.screen.width / 4) {
            Body.setPosition(ground, { x: window.screen.width / 2, y: ground.position.y })
          }

          var lastChild = Composite.allBodies(domanda)[Composite.allBodies(domanda).length - 1]


          if (lastChild.position.x - 100 < player.position.x + 37 * scale / 2 && !checkedWon) {
            
            try {
              if (player.position.y < rispostaGiusta.pos + (window.screen.height - window.screen.height / 12.5) / (2 * Object.keys(domande["domanda" + j]).length - 1) && player.position.y > rispostaGiusta.pos - (window.screen.height - window.screen.height / 12.5) / (2 * Object.keys(domande["domanda" + j]).length - 1)) {
                won = true
                won = true
                console.log("YOU DID WIN!!" + won)
                var win = document.querySelector(".win")
                win.volume = 0.5 * volume
                win.play()
                player.render.sprite.texture = doggoLove
                setTimeout(() => {
                  player.render.sprite.texture = doggo
                  won = undefined
                }, 2000)
  
                punteggio++
                Composite.remove(engine.world, punti)
                punti = Bodies.rectangle(player.position.x, window.screen.height * 0.8, 1, 1, { isStatic: true, isSensor: true, render: { sprite: { texture: createImage(punteggio.toString(), 30, 30, type) } } })
                punti.collisionFilter = {
                  'group': -1,
                  'category': 2,
                  'mask': 0,
                }
                Composite.add(engine.world, [punti])
  
              }
            }
            catch(e) {
              console.error(e)
            }

            checkedWon = true
            if (!won) {
              console.log("YOU DID NOT WIN" + won)
              player.render.sprite.texture = doggoSad
              document.dispatchEvent(rightAnswer)
              var sad = document.querySelector(".wrong")
              sad.volume = 1 * volume
              console.log(volume)
              sad.play()
              setTimeout(() => {
                player.render.sprite.texture = doggo
                won = false
              }, 2000)
            }
          }

          if (lastChild.position.x - player.position.x < window.screen.width / 3) {
            Composite.remove(qr, [q])
            Composite.translate(risp, { x: mov * speed, y: 0 })

            if (Composite.allBodies(risp)[Composite.allBodies(risp).length - 1].position.x - player.position.x < 100) {
              Composite.remove(qr, [risp])
            }

            if (lastChild.position.x < -100) {
              Composite.remove(engine.world, [domanda])
              checkedWon = false
              console.log(j + "/" + Object.keys(domande).length)
              if (j === Object.keys(domande).length) {
                gameOver = true
                started = false
                clearInterval(update)
                engine.gravity.y = 0
                document.body.style.animationPlayState = "paused"
                try {

                  for (var v = 0; v < document.styleSheets[2].cssRules.length; v++) {
                    var newRule = document.styleSheets[2].cssRules[v].cssText.replace("running", "paused")
                    document.styleSheets[2].deleteRule(v)
                    document.styleSheets[2].insertRule(newRule, v)
                  }

                }

                catch (error) {
                  console.log(error)
                }
                setTimeout(() => {
                  swal.fire({
                    title: "La partita è finita",
                    html: "Il tuo punteggio è: " + punteggio + "<br>Vuoi fare un'altra partita?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: 'Daje annamoooooo',
                    confirmButtonColor: '#5ca353',
                    cancelButtonText: '¡No gracias señora!',
                    color: 'white',
                    background: '#373737'
                  })
                    .then((result) => {

                      if (result.value === true) {


                        (async () => {
                          domande = await getQuestions()
                          start()
                        })()


                      }

                      else {
                        voluntary = true
                        document.exitFullscreen()
                        swal.fire({
                          title: "Se vedemo zi'",
                          html: "Spero il gioco ti sia piaciuto",
                          showCancelButton: false,
                          showConfirmButton: false,
                          color: 'white',
                          background: '#373737'
                        })
                        gameOver = true;
                        try {
                          Composite.remove(engine.world, [qr, domanda, punti, conto, player])
                        }
                        catch (error) {

                        }
                      }
                    })
                }, 2000)
              }
              console.log("DA LASTCHILD POSITION X < -100, j = " + j)
              domanda = Domanda({ screenHeight: window.screen.height, groundHeight: window.screen.height / 12.5, x: player.position.x + 1000 * scaleX, q: domande["domanda" + j], scale: scale })
              Composite.add(engine.world, [domanda])
              sprite = createImage(domande["domanda" + j].d, window.screen.width * 0.75, (window.screen.height / 50 * 49) / 4.5 * 0.3, type)
              q = Bodies.rectangle(window.screen.width / 2, (window.screen.height / 50 * 49) / 4.5 * 0.3, window.screen.width * 0.75, (window.screen.height / 50 * 49) / 4.5 * 0.3, { isSensor: true, isStatic: true, render: { sprite: { texture: sprite } } })
              q.collisionFilter = {
                'group': -1,
                'category': 2,
                'mask': 0
              }
              Composite.add(qr, [q])

              risp = getAnswers(domande["domanda" + j], window.screen.height, window.screen.width, player.position.x, window.screen.height / 12.5, scale)
              setTimeout(() => {
                Composite.add(qr, [risp])
              }, 1000)

              j++
            }
          }

        }, 1000 / 60)

      }

      if (!gameOver) {
        var sound = document.querySelector(".jump")
        sound.playbackRate = 2
        sound.volume = 0.5 * volume
        sound.play()
        Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0, y: -0.1 * scale })
      }
    }

    document.addEventListener("click", handleClick)

    document.addEventListener('rightanswer', (e) => {
      console.log('rightanswer' + e)
      var img = createImage(rispostaGiusta.r, 200, (window.screen.height - window.screen.height / 12.5) / 4.5 * 0.6, type, 'rgba(1, 255, 0, 0.32)', "lol")
      var right = Bodies.rectangle(Composite.allBodies(domanda)[Composite.allBodies(domanda).length - 1].position.x, rispostaGiusta.pos, 200, (window.screen.height - window.screen.height / 12.5) / 4.5 * 0.6, { isStatic: true, isSensor: true, render: { sprite: { texture: img } } })
      Composite.add(domanda, right)
    })


    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {

        engine.gravity.y = 0
        mov = 0
      } else {

        mov = -2
        engine.gravity.y = 0.01 * scale
      }
    }, false);

    function start() {
      engine.gravity.y = 0
      try {
        Composite.remove(engine.world, [player, punti])
      }
      catch (error) {

      }

      player = Bodies.rectangle(window.screen.width / 3, window.screen.height / 2, 50 * scale, 37 * scale, { chamfer: { radius: 15 }, render: { sprite: { texture: doggo, xScale: scale, yScale: scale } } })
      Body.setMass(player, 20)
      console.log(window.screen.height + " " + window.screen.height + " " + window.innerHeight)



      Composite.add(engine.world, [player]);

      domande = shuffleDomande(domande)

      j = 1
      if (l === 0) {
        var go = setInterval(() => {

          try {
            Composite.remove(engine.world, [conto])
          } catch (error) {
            console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
          }

          conto = Bodies.rectangle(window.screen.width / 2, window.screen.height / 2, window.screen.width / 4, window.screen.height / 4, { label: 'conto', isStatic: true, isSensor: true, render: { sprite: { texture: createImage((3 - l).toString(), window.screen.width / 4, window.screen.height / 4, 2) } } })
          conto.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
          }

          Composite.add(engine.world, conto)

          if (l === 3) {

            try {

              for (var v = 0; v < document.styleSheets[2].cssRules.length; v++) {
                var newRule = document.styleSheets[2].cssRules[v].cssText.replace("paused", "running")
                document.styleSheets[2].deleteRule(v)
                document.styleSheets[2].insertRule(newRule, v)
              }

            }

            catch (error) {
              console.log(error)
            }
            punteggio = 0

            punti = Bodies.rectangle(player.position.x, player.position.y - 60, 1, 1, { isStatic: true, isSensor: true, render: { sprite: { texture: createImage(punteggio.toString(), 30, 30, type) } } })
            punti.collisionFilter = {
              'group': -1,
              'category': 2,
              'mask': 0,
            }

            Composite.add(engine.world, [punti])

            gameOver = false
            noClick = true
            l = 0
            won = false
            justStarted = true
            checkedWon = false

            handleClick()
            clearInterval(go)
            setTimeout(() => {
              Composite.remove(engine.world, [conto])
            }, 1000)
          }

          else {
            l++
          }
        }, 1000)
      }

      else {

      }
      try {
        Composite.remove(engine.world, [domanda, qr, punti, conto])
      } catch (error) {
        console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }
    }

    Events.on(engine, 'collisionStart', function (event) {
      var pairs = event.pairs;



      if (!pairs[0].bodyA.isSensor && !pairs[0].bodyB.isSensor && !gameOver && !alreadyTouched) {

        alreadyTouched = true
        document.body.style.animationPlayState = "paused"
        try {

          for (var v = 0; v < document.styleSheets[2].cssRules.length; v++) {
            var newRule = document.styleSheets[2].cssRules[v].cssText.replace("running", "paused")
            document.styleSheets[2].deleteRule(v)
            document.styleSheets[2].insertRule(newRule, v)
          }

        }

        catch (error) {
          console.log(error)
        }

        var gOSound = document.querySelector(".gO")
        gOSound.volume = 0.5 * volume
        gOSound.play()
        player.render.sprite.texture = doggoDead
        gameOver = true
        started = false

        setTimeout(() => {

          swal.fire({
            title: "NOOOOOOO! Hai fatto male a guapetín :(",
            html: "Il tuo punteggio è: " + punteggio + "<br>Chiudi questo messaggio per iniziare una nuova partita",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: 'Daje annamoooooo',
            confirmButtonColor: '#5ca353',
            cancelButtonText: '¡No gracias señora!',
            color: 'white',
            background: '#373737'
          })
            .then((result) => {

              if (result.value === true) {
                (async () => {
                  domande = await getQuestions()
                  start()
                })()
              }

              else {
                voluntary = true
                document.exitFullscreen()
                swal.fire({
                  title: "Se vedemo zi'",
                  html: "Spero il gioco ti sia piaciuto",
                  showCancelButton: false,
                  showConfirmButton: false,
                  color: 'white',
                  background: '#373737'
                })
                gameOver = true;
                try {
                  Composite.remove(engine.world, [qr, domanda, punti, conto, player])
                }
                catch (error) {

                }
              }
            })

          alreadyTouched = false
          player.render.sprite.texture = doggo
        }, 1000)

        if (won) {
          punteggio = punteggio - 1
          Composite.remove(engine.world, punti)
          punti = Bodies.rectangle(player.position.x, window.screen.height * 0.8, 1, 1, { isStatic: true, isSensor: true, render: { sprite: { texture: createImage(punteggio.toString(), 30, 30, type) } } })
          punti.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
          }
          Composite.add(engine.world, [punti])
        }
      }
    });

    Runner.run(engine);
    Render.run(render);
  }, [scena])

  return (
    <div ref={scena} className="canvas" height="100vh" width="100vh" >
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