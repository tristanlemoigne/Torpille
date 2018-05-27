"use strict"

function screenSize(camera, renderer) {
    const vFOV = camera.fov * Math.PI / 180, // convert vertical fov to radians
        height = 2 * Math.tan(vFOV / 2) * (camera.position.z), // visible height
        size = renderer.getSize(),
        aspect = size.width / size.height,
        width = height * aspect; // visible width
    return {
        width,
        height
    }
}

function init() {
    // SCENE
    scene = new THREE.Scene()
    
    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    document.body.appendChild( renderer.domElement)
    // LOADERS

    let fbxLoader = new THREE.FBXLoader()

    function loadModel(path, id) {
        return new Promise((resolve, reject) => {
            fbxLoader.load(path, (model) => {
                ASSETS[id] = model
                resolve()
            })
        })
    }

    function loadTexture(path, id) {
        return new Promise((resolve, reject) => {
            const texture = new THREE.TextureLoader().load(path, () => {
                ASSETS[id] = texture
                resolve()
            })
        })
    }

    Promise.all([
        loadModel("assets/img/spaceship.fbx", "spaceship"),
        loadModel("assets/img/asteroide.fbx", "asteroid"),
        loadTexture("assets/img/uvspaceship.png", "uvspaceship"),
        loadTexture("assets/img/uvasteroide1.png", "uvasteroide1"),
        loadTexture("assets/img/uvasteroide2.png", "uvasteroide2"),
        loadTexture("assets/img/uvasteroide3.png", "uvasteroide3"),
        loadTexture("assets/img/particle.png", "particle"),
    ]).then(() => {
        let translation = 100

        setTimeout(()=>{
            PLAY.style.display = "block"   
            
            let translationInterval = setInterval(()=>{
                if(translation === 0){
                    clearInterval(translationInterval)
                    document.getElementsByClassName("loading")[0].style.display = "none"
                }

                PLAY.style.left = translation + "%"
                translation --
            }, 5)
        }, 700)
    })
}

function createScene() {
    
    // CAMERA
    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000)
    camera.position.set(0, 3, 15)
    scene.add(camera)

    // SPACESHIP

    spaceship = ASSETS.spaceship    
    const materialSpaceship = new THREE.MeshLambertMaterial()
    const textureSpaceship = ASSETS.uvspaceship

    spaceship.children[0].material = materialSpaceship
    spaceship.children[0].material.map = textureSpaceship
    spaceship.scale.set(0.01, 0.01, 0.01)
    scene.add(spaceship)

    let hitboxSpaceship = new THREE.Box3().setFromObject(spaceship);
    spaceship.hitbox = hitboxSpaceship

    let hitBoxSpacehipHelper = new THREE.Box3Helper( hitboxSpaceship, 0xffff00 );
    // scene.add(hitBoxSpacehipHelper)

    // LIGHTS

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    let spotLight = new THREE.SpotLight(0x00f6ff)
    spotLight.position.set(0, 20, 0)
    spotLight.angle = Math.PI/8
    spotLight.target = spaceship
    scene.add(spotLight)

    let spotLightHelper = new THREE.SpotLightHelper( spotLight )

    pointLight = new THREE.PointLight(0xffffff, 0.6)
    pointLight.position.set(0, 0, 0)
    pointLight.distance = 1000
    scene.add(pointLight)

    // AXES

    let axesHelper = new THREE.AxesHelper(5)
    // scene.add(axesHelper)

    WIDTH_3D = screenSize(camera, renderer).width
    HEIGHT_3D = screenSize(camera, renderer).height
}


function startGame(event){ 
    event.preventDefault()

    launch()
    createScene()
    generateAsteroids()
    generateStars()
    playMusic()
    animate()

    // EVENTS
    window.addEventListener('resize', onWindowResize, false)
    // window.addEventListener('mousemove', onMove, false)
}


function generateAsteroids(){
    for (let i = 0; i < ASTEROIDS_COUNT; i++){
        const asteroid = ASSETS.asteroid.clone()

        // Asteroid properties
        asteroid.randomTexture = Math.round(getRandomNumber(1, 4))
        asteroid.randomPositionZ = Math.round(getRandomNumber( -1000, -50))
        asteroid.randomPositionX = Math.round(getRandomNumber(MIN_WIDTH, MAX_WIDTH))
        asteroid.randomPositionY = Math.round(getRandomNumber(MIN_HEIGHT, MAX_HEIGHT))
        asteroid.randomScale = getRandomNumber(0.01, 0.08)
        asteroid.rotationSpeed = getRandomNumber(-0.03, 0.03)
        asteroid.moveSpeed = Math.round(getRandomNumber(2, 7))
        

        if(asteroid.randomTexture === 1){
            asteroid.texture = ASSETS.uvasteroide1
        } else if(asteroid.randomTexture === 2){
            asteroid.texture = ASSETS.uvasteroide2
        } else{
            asteroid.texture = ASSETS.uvasteroide3
        }

        asteroid.children[0].material = new THREE.MeshLambertMaterial()
        asteroid.children[0].material.map = asteroid.texture

        asteroid.position.set(asteroid.randomPositionX , asteroid.randomPositionY, asteroid.randomPositionZ)
        asteroid.scale.set(asteroid.randomScale, asteroid.randomScale, asteroid.randomScale)

        asteroid.center = new THREE.Vector3(asteroid.randomScale /2, asteroid.randomScale /2, asteroid.randomScale /2)
        asteroid.sizee = new THREE.Vector3(7,7,7)

        ASTEROIDES_ARRAY.push(asteroid)
        scene.add(asteroid)      
        
        let hitboxAsteroid = new THREE.Box3().setFromObject(asteroid);
        asteroid.hitbox = hitboxAsteroid

        let hitboxAsteroidHelper = new THREE.Box3Helper( hitboxAsteroid, 0xffff00 );
        // scene.add(hitboxAsteroidHelper)
    }
    
}

function generateStars(){
    let pGeometry = new THREE.Geometry()

    let pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: PARTICLE_SIZE,
        map: ASSETS.particle,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

    particleSystem = new THREE.Points(pGeometry, pMaterial)

    for(let i = 0; i < PARTICLE_COUNT; i++){
        let pX = getRandomNumber(-500, 500)
        let pY = getRandomNumber(-500, 500)
        let pZ = getRandomNumber(-1000, -100)
        let particle = new THREE.Vector3(pX, pY, pZ)
    
        pGeometry.vertices.push(particle);
        particleSystem.sortParticles = true;
    }
    
    scene.add(particleSystem)
}

function launch(){
    let translation = 100
    
    let translationInterval = setInterval(()=>{
        if(translation === 0){
            clearInterval(translationInterval)
            PLAY.style.display = "none"             
        }

        document.getElementsByTagName("canvas")[0].style.left = translation + "%"
        document.getElementsByClassName("ingame")[0].style.left = translation + "%"
        translation --
    }, 5)

    // COMPTE A REBOURS
    let beep = new Audio('assets/sounds/22414.wav')
    let start = new Audio('assets/sounds/1933.wav')

    let intervalCompteur = setInterval(()=>{
        if(COMPTEUR === 2){
            document.getElementsByClassName("preparation")[0].style.display = "none"
            document.getElementsByClassName("crew")[0].classList.add("translateCrew")            
            document.getElementsByClassName("reactors")[0].classList.add("translateReactors1")             
            document.getElementsByClassName("launchShip")[0].classList.add("translateLaunchShip1")             
        }

        if(COMPTEUR === 1){
            document.getElementsByClassName("crew")[0].style.display = "none"
            document.getElementsByClassName("reactors")[0].classList.add("translateReactors2")                         
            document.getElementsByClassName("launchShip")[0].classList.add("translateLaunchShip2")             
        }

        if(COMPTEUR === 0){
            document.getElementsByClassName("reactors")[0].style.display = "none"
            document.getElementsByClassName("launchShip")[0].classList.add("translateLaunchShip3")             
            
            clearInterval(intervalCompteur)
            start.play()
            
            setTimeout(()=>{
                window.addEventListener('mousemove', onMove, false)    
                document.getElementsByClassName("launch")[0].style.display = "none"
                document.getElementsByClassName("scores")[0].style.display = "block"
                drawScore()
            }, 1000)

            setTimeout(()=>{
                prepare = true
            }, 2000)
        } else {
            beep.play()
        }
        
        document.getElementsByClassName("countdown")[0].innerHTML = COMPTEUR
        COMPTEUR --
    },1000)
}

function playMusic(){
    let music = new Audio('assets/sounds/opus.mp3')
    
    music.addEventListener('ended', ()=>{
        music.currentTime = 0;
        music.play();
    }, false);

    music.play()
}

// EVENT HANDLERS

function onMove(event) {
    MOUSE.x = (event.clientX - (SCREEN_WIDTH/2))/ WIDTH_3D / SHIFTING
    MOUSE.y = -((event.clientY - (SCREEN_HEIGHT/2))/ HEIGHT_3D  / SHIFTING ) + camera.position.y 

    spaceship.position.x = MOUSE.x 
    spaceship.position.y = MOUSE.y
    spaceship.rotation.z = MOUSE.x / ROTATION
    spaceship.rotation.x = - MOUSE.y / ROTATION *1.5
    spaceship.hitbox.setFromObject(spaceship)
}

function onWindowResize (){
    renderer.setSize(window.innerWidth,  window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

// RENDER 

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    // Asteroids
    ASTEROIDES_ARRAY.forEach((asteroid)=>{
        asteroid.rotation.x += asteroid.rotationSpeed
        asteroid.rotation.z += asteroid.rotationSpeed
        asteroid.position.z += asteroid.moveSpeed

        if(asteroid.position.z > 100){
            // Asteroid properties
            asteroid.randomPositionX = Math.round(getRandomNumber(MIN_WIDTH, MAX_WIDTH))
            asteroid.randomPositionY = Math.round(getRandomNumber(MIN_HEIGHT, MAX_HEIGHT))
            
            asteroid.randomScale = getRandomNumber(0.01, 0.1)
            asteroid.rotationSpeed = getRandomNumber(-0.03, 0.03)

            if(asteroid.moveSpeed <= 20){
                asteroid.moveSpeed += Math.round(getRandomNumber(2, 7)) * .07
            }
            
            asteroid.position.set(asteroid.randomPositionX, asteroid.randomPositionY, -1000)
            asteroid.scale.set(asteroid.randomScale, asteroid.randomScale, asteroid.randomScale)
        }

        asteroid.hitbox.setFromObject(asteroid);
        collision = spaceship.hitbox.intersectsBox(asteroid.hitbox);

        if(collision && prepare){
            CRASH.play()
            isalive = false
        }        
    })
    
    // COLLISION
    if(!isalive){
        // Score stockage + reinitialisation
        if(score > highScore){
            highScore = score
            localStorage.setItem('highScore', highScore)
            highScoreContainer.innerHTML = highScore                     
        }
        score = 0

        if(spaceship.rotation.y <= 2*Math.PI){
            spaceship.rotation.y += .15
            particleSpeed = 1

            ASTEROIDES_ARRAY.forEach((asteroid)=>{
                asteroid.moveSpeed = 1 
            })

            shake()
        } else {
            isalive = true
            spaceship.rotation.y = 0
            camera.position.set(0, 3, 15) 
            particleSpeed = 6
            
            ASTEROIDES_ARRAY.forEach((asteroid)=>{
                asteroid.moveSpeed = Math.round(getRandomNumber(2, 7))    
            })      
        }
    }   
    

    // Particles System
    particleSystem.geometry.verticesNeedUpdate = true
    
    for(let i=0; i < particleSystem.geometry.vertices.length; i++){
        particleSystem.geometry.vertices[i].z += particleSpeed

        if(particleSystem.geometry.vertices[i].z > 100){
            particleSystem.geometry.vertices[i].z = -1000
        }
    }    

    renderer.render(scene, camera)    
}

// UTILS

function getRandomNumber(min, max){
    return Math.random() * (max - min) + min
}

function shake(){
    let x = getRandomNumber(-.5, .5)
    let y = getRandomNumber(2.8, 3.2)

    camera.position.set(x,y,15)        
}

// DECLARATIONS
const ASTEROIDES_ARRAY = []
const PARTICLES_ARRAY = []
const ASSETS = {}
const MOUSE = {x: 0, y: 0}

const PLAY_BUTTON = document.getElementsByClassName("playButton")[0]
const SCREEN_WIDTH = window.innerWidth
const SCREEN_HEIGHT = window.innerHeight
let WIDTH_3D
let HEIGHT_3D

// Asteroids range
const MAX_WIDTH = SCREEN_WIDTH / 10
const MIN_WIDTH = - SCREEN_WIDTH / 10
const MAX_HEIGHT = SCREEN_HEIGHT / 20
const MIN_HEIGHT = - SCREEN_HEIGHT / 20

const SHIFTING = 2
const ROTATION = - Math.PI * 6
const ASTEROIDS_COUNT = 40
const PARTICLE_COUNT = 500
const PARTICLE_SIZE = 3

const CRASH = new Audio('assets/sounds/14982.wav')
const PLAY = document.getElementsByClassName("play")[0]

let COMPTEUR = 3
let camera, scene, pointLight, renderer
let spaceship, texture, particleSystem, particleSpeed = 6
let collision, isalive = true, prepare = false
let rotationRight, orientation, vitesse

init()
console.log('%c By Tristan Le Moigne & Augustin Stephan', 'font-size: 30px')
PLAY_BUTTON.addEventListener('click', startGame, {once : true})




