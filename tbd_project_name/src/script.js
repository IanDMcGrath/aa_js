// import threejs
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// import my files
import { Vehicle } from './vehicle';
import { PlayCam } from './camera';
const Util = require('./utils');

// Loading
const textureLoader = new THREE.TextureLoader();
// const normalTexture = textureLoader.load('/testDoor/dirt_mid_normal.jpg');
const gltfLoader = new GLTFLoader();

// Collections
const arrRacers = [];
const arrSky = [];
const arrColliders = {road: undefined, walls: undefined};


// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = textureLoader.load('environment/sky/skygradient.jpg');

// Objects
// const geometry = new THREE.SphereBufferGeometry( 10, 1, 16, 10 );


// Materials

const material = new THREE.MeshBasicMaterial();
// material.metalness = 0.7;
// material.roughness = 0.2;
// material.normalMap = normalTexture;
material.color = new THREE.Color(0xffffff);

const matRoad = new THREE.MeshMatcapMaterial();
matRoad.map = textureLoader.load('environment/road/roadTexture.jpg');

const matRails = new THREE.MeshPhongMaterial({
    map : textureLoader.load('environment/road/roadGuardRail.png'),
    emissive : new THREE.Color(0xFFFFFF),
    emissiveMap : textureLoader.load('environment/road/roadGuardRailEmissive.jpg'),
    emissiveIntensity : 1,
    alphaMap : textureLoader.load('environment/road/roadGuardRailAlpha.jpg'),
    transparent : true,
    alphaTest : 0.5
});
console.log(matRails);

function meshesMaterial(meshArr=[], material) {
    for (let i=0; i<meshArr.length; i++) {
        meshArr[i].material = material;
    }
}

// Mesh
// var skysphere = undefined
// var sphere = new THREE.Mesh(geometry,material)
// sphere.renderOrder = 0
// sphere.material.depthTest = false
// scene.add(sphere)


// gltfLoader.load( './environment/sky/uvsphere_inverted.glb', function ( gltf ) {
//     let skysphere = gltf.scene;
//     skysphere.scale.set(1,1,1);
// 	scene.add( gltf.scene );
//     // skysphere.material = material;
//     // skysphere.material.depthTest = true
//     skysphere.renderOrder = 1000;
//     // arrSky.push(skysphere)
// }, undefined, function ( error ) {
//     console.error( error );
// } );

function addWalls() {
    gltfLoader.load('./environment/road/track01_walls.gltf', function ( gltf ) {
        let walls = gltf.scene;
        walls.scale.set(1,1,1);

        // meshesMaterial(walls.children, matRails)
        // walls.visible = false;

        arrColliders.walls = walls;
        scene.add( walls );
        
    }, undefined, function ( error ) {
        console.error( error );
    });
}
addWalls();

function addEnv() {
    gltfLoader.load('./environment/road/track01_env.gltf', function ( gltf ) {
        let env = gltf.scene;
        env.scale.set(1,1,1);

        console.log(gltf)

        let roadOwner = undefined;
        let i=0;
        while (i<gltf.scene.children.length && !roadOwner) {
            if (gltf.scene.children[i].name === "roadGroupOwner") {
                roadOwner = gltf.scene.children[i];
            }
        }
        if (roadOwner) meshesMaterial(roadOwner.children, matRails);

        scene.add(env);

    }, undefined, function ( error ) {
        console.error( error );
    });
}
// addEnv();

function addRoad() {
    gltfLoader.load( './environment/road/track01_road.gltf', function ( gltf ) {
        let road = gltf.scene;
        // road.castShadow = true;
        // road.receiveShadow = true;
        road.scale.set(1,1,1);

        meshesMaterial(road.children, matRoad);
        
        // road.layers.enable(1);
        // road.layers.set(1);
        arrColliders.road = road;
        scene.add( road );
        
    }, undefined, function ( error ) {
        console.error( error );
    } );
}
addRoad();

function addRacer() {
    gltfLoader.load( './vehicle/vehicle.glb', function ( gltf ) {
        let mesh = gltf.scene;
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        // console.log(mesh);
        mesh.scale.set(1,1,1);
        // mesh.material = material;
        scene.add( mesh );
        let racer = new Vehicle(gltf);
        
        arrRacers.push(racer);
    }, undefined, function ( error ) {
        console.error( error );
    } );
}
addRacer(); 

function assignRacerColliders() {
    if (arrColliders.road && arrColliders.walls) {      // check that both colliders were loaded and exist
        for (let i=0; i<arrRacers.length; i++) {        // pass references of colliders to racers
            arrRacers[i].road = arrColliders.road;
            arrRacers[i].walls = arrColliders.walls;
        }
    }
}

// Lights

const hlight = new THREE.AmbientLight(0xffffff,0.5);
hlight.position.set(.5,.5,0);

// console.log(hlight)
scene.add(hlight);

// const pointLight = new THREE.PointLight(0xffffff, 1);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(.5,.5,.5);
// directionalLight.castShadow = true;
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
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 30;
const playCam = new PlayCam(camera, new THREE.Vector3(), arrRacers[0]);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const myVector = new THREE.Vector3(50,0,0);
// render iterators
function renderRacers() {
    for (let i=0; i<arrRacers.length; i++) {
        arrRacers[i].move();
        // arrRacers[i].position.x = clock.getElapsedTime();
    }
    // if (arrRacers[0]) playCam.lookAt(arrRacers[0].position);
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

const clock = new THREE.Clock();

const arrows = [];
function addArrows() {
    // vehicle Y (up)
    let arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), arrRacers[0].position, 5, new THREE.Color("rgb(0,255,0)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

    // vehicle Z (forward)
    arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), arrRacers[0].position, 5, new THREE.Color("rgb(0,0,255)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

    // vehicle X (right)
    arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), arrRacers[0].position, 5, new THREE.Color("rgb(255,0,0)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

    // vehicle floor trace (down) 1
    arrow = new THREE.ArrowHelper(new THREE.Vector3(), arrRacers[0].position, arrRacers[0].raycaster1.far, new THREE.Color("rgb(255,255,0)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

    // gravity direction
    arrow = new THREE.ArrowHelper(new THREE.Vector3(), arrRacers[0].position, arrRacers[0].raycaster1.far, new THREE.Color("rgb(0,0,255)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

    // // vehicle floor trace (down) 2
    // arrow = new THREE.ArrowHelper(new THREE.Vector3(), arrRacers[0].position, arrRacers[0].raycaster1.far, new THREE.Color("rgb(255,255,0)"), 0.5);
    // arrows.push(arrow);
    // scene.add(arrow);

    // // vehicle floor trace (down) 3
    // arrow = new THREE.ArrowHelper(new THREE.Vector3(), arrRacers[0].position, arrRacers[0].raycaster1.far, new THREE.Color("rgb(255,255,0)"), 0.5);
    // arrows.push(arrow);
    // scene.add(arrow);

    // vehicle front trace 
    arrow = new THREE.ArrowHelper(new THREE.Vector3(), arrRacers[0].position, arrRacers[0].raycaster1.far, new THREE.Color("rgb(255,255,0)"), 0.5);
    arrows.push(arrow);
    scene.add(arrow);

}

function moveArrows() {
    for (let i=0; i<arrows.length; i++) {
        // arrows[i].position.set(arrRacers[0].position);
        arrows[i].position.x = arrRacers[0].position.x;
        arrows[i].position.y = arrRacers[0].position.y;
        arrows[i].position.z = arrRacers[0].position.z;
    }
    // arrows[0].rotation.setFromQuaternion(arrRacers[0].rotation.clone().multiply(new THREE.Quaternion(0,-1,0)).normalize());
    // arrows[1].rotation.setFromQuaternion(arrRacers[0].rotation.clone().multiply(new THREE.Quaternion(1,0,0)).normalize());
    // arrows[2].rotation.setFromQuaternion(arrRacers[0].rotation.clone().multiply(new THREE.Quaternion(0,0,1)).normalize());
    // arrows[3].rotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), arrRacers[0].floorTrace.direction.clone()));
    arrows[3].setDirection(arrRacers[0].floorTraceCenter.direction.clone());
    arrows[4].setDirection(arrRacers[0].gravityDir.clone());
    arrows[5].setDirection(arrRacers[0].forwardDir.clone());
    // arrows[4].setDirection(arrRacers[0].floorTraceFront.direction.clone());
    // arrows[5].setDirection(arrRacers[0].floorTraceBack.direction.clone());
    // arrows[4].rotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), arrRacers[0].gravityDir.clone()));


    arrows[3].position.set(...arrRacers[0].floorTraceCenter.origin.toArray());
    arrows[4].position.set(...arrRacers[0].position.clone().add(new THREE.Vector3(0,5,0)).toArray())
    // arrows[4].position.set(...arrRacers[0].floorTraceFront.origin.toArray());
    // arrows[5].position.set(...arrRacers[0].floorTraceBack.origin.toArray());
    // console.log(arrows[3].position);
}


const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // console.log(skysphere.scene)
    // skysphere.scene.position.set(camera.position.x,camera.position.y,camera.position.z - 50)
    // renderSky();
    // playCam.obj.lookAt(arrRacers[0].position)
    renderRacers();
    playCam.move();
    moveArrows();
    
    renderer.render(scene, camera);
    // Update Orbital Controls
    // controls.update()
    // camera.rotateOnAxis.y = .1 * elapsedTime
    // camera.rotation.set(0,0,0) // 1 * elapsedTime
    
    
    // Render
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}    

var prepTick = setInterval(tryTick, 100);

function tryTick() {
    console.log("Trying to start tick") // A catch-all solution to waiting on the player's vehicle to be ready

    assignRacerColliders(); // pass references of the roads and walls to all racers

    if (arrRacers[0] && arrRacers[0].walls) {
        arrRacers[0].isPlayer = true;
        arrRacers[0].bindControls();
        playCam.player = arrRacers[0];
        

        addArrows();
        console.log("Tick started")
        tick()
        clearInterval(prepTick);
    }    
}    

// it's math