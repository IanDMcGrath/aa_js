// import threejs
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// import my files
const Vehicle = require('./vehicle');
const Util = require('./utils');

// Loading
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load('/testDoor/dirt_mid_normal.jpg');
const gltfLoader = new GLTFLoader();

// Collections
const racers = [];


// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.TorusBufferGeometry( .7, .2, 16, 100 );


// Materials

const material = new THREE.MeshBasicMaterial()
material.metalness = 0.7;
material.roughness = 0.2;
material.normalMap = normalTexture;
material.color = new THREE.Color(0xff0000)

// Mesh
const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere)


gltfLoader.load( 'testDoor/stageDoor.glb', function ( gltf ) {
    let mesh = gltf.scene.children[0];
    let mesh2 = gltf.scene.children[1];
    mesh.scale.set(0.001,0.001,0.001);
    mesh2.scale.set(0.001,0.001,0.001);
	scene.add( gltf.scene );
    // console.log(gltf)
}, undefined, function ( error ) {
    console.error( error );
} );

function addRacer() {
    gltfLoader.load( 'testmesh/monstar.gltf', function ( gltf ) {
        let mesh = gltf.scene;
        mesh.scale.set(0.01,0.01,0.01);
        scene.add( gltf.scene );
        let racer = new Vehicle(gltf);
        racers.push(racer);
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
camera.position.y = 0
camera.position.z = 2
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


// render iterators
function renderRacers() {
    console.log(racers[0].location)
    for (let i=0; i<racers.length; i++) {
        racers[i].move();
        // racers[i].obj.position(...racers[i].location);
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
    sphere.rotation.y = .5 * elapsedTime
    // renderRacers();

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()