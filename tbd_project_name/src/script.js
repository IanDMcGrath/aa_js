// import threejs
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Camera } from 'three';

// import my files
const Vehicle = require('./vehicle');
const Util = require('./utils');
const PlayCam = require('./camera');

// Loading
const textureLoader = new THREE.TextureLoader();
// const normalTexture = textureLoader.load('/testDoor/dirt_mid_normal.jpg');
const gltfLoader = new GLTFLoader();

// Collections
const arrRacers = [];
const arrSky = [];


// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = textureLoader.load('environment/sky/skygradient.jpg');

// Objects
const geometry = new THREE.SphereBufferGeometry( 10, 1, 16, 10 );


// Materials

const material = new THREE.MeshBasicMaterial()
// material.metalness = 0.7;
// material.roughness = 0.2;
// material.normalMap = normalTexture;
material.color = new THREE.Color(0xffffff)

// Mesh
// var skysphere = undefined
// var sphere = new THREE.Mesh(geometry,material)
// sphere.renderOrder = 0
// sphere.material.depthTest = false
// scene.add(sphere)


gltfLoader.load( './environment/sky/uvsphere_inverted.glb', function ( gltf ) {
    let skysphere = gltf.scene;
    skysphere.scale.set(1,1,1);
	scene.add( gltf.scene );
    // skysphere.material = material;
    // skysphere.material.depthTest = true
    skysphere.renderOrder = 1000;
    // arrSky.push(skysphere)
}, undefined, function ( error ) {
    console.error( error );
} );

function addRoad() {
    gltfLoader.load( './environment/road/roadtest.glb', function ( gltf ) {
        let road = gltf.scene;
        road.scale.set(1,1,1);
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    } );
}
addRoad();


function addRacer() {
    gltfLoader.load( './vehicle/vehicle.glb', function ( gltf ) {
        let mesh = gltf.scene;
        console.log(mesh.position.set(...[0,0,-1]))
        mesh.scale.set(1,1,1);
        scene.add( mesh );
        let racer = new Vehicle(gltf);
        arrRacers.push(racer);
    }, undefined, function ( error ) {
        console.error( error );
    } );
}
addRacer();
// Lights

const hlight = new THREE.AmbientLight (0x404040,1);
scene.add(hlight);

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

const directionalLight = new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(.5,.5,0);
directionalLight.castShadow = true;
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 10
camera.position.z = 30
const playCam = new PlayCam(camera, new THREE.Vector3());
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const myVector = new THREE.Vector3(50,0,0);
// render iterators
function renderRacers() {
    for (let i=0; i<arrRacers.length; i++) {
        arrRacers[i].move();
    }
    if (arrRacers[0]) playCam.lookAt(arrRacers[0].position);
    // if (arrRacers[0]) playCam.obj.lookAt(myVector);
    // console.log(playCam.lookatTarget)
}

function renderSky() {
    for (let i=0; i<arrRacers.length; i++) {
        arrSky[i].position.set(camera.position.x,camera.position.y,camera.position.z);
    }
}

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // console.log(skysphere.scene)
    // skysphere.scene.position.set(camera.position.x,camera.position.y,camera.position.z - 50)
    // renderSky();
    
    renderer.render(scene, camera)
    // Update Orbital Controls
    // controls.update()
    // camera.rotateOnAxis.y = .1 * elapsedTime
    // camera.rotation.set(0,0,0) // 1 * elapsedTime
    
    
    // Render
    
    renderRacers();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()