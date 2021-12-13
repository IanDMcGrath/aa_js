// import threejs
import './assets/stylesheets/stylesheets.css';
// import * as THREE from 'three';
import { TextureLoader, Scene, MeshBasicMaterial, MeshMatcapMaterial, MeshPhongMaterial, Color, DirectionalLight, AmbientLight, PerspectiveCamera, Vector3, WebGLRenderer, Clock, Quaternion, ArrowHelper, AnimationMixer, MeshToonMaterial, Euler, NearestFilter, RepeatWrapping, MeshPhysicalMaterial, Mesh, LoopRepeat, LoadingManager, MeshLambertMaterial, PointLight, MeshStandardMaterial } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

import UIManager from './javascripts/UI';

// import my files
import { Vehicle } from './vehicle';
import { PlayCam } from './camera';
const Util = require('./utils');
import { RaceManager } from './race';

const LOADING_MANAGER = new LoadingManager();


// Loading
const textureLoader = new TextureLoader(LOADING_MANAGER);
// const normalTexture = textureLoader.load('/testDoor/dirt_mid_normal.jpg');
const gltfLoader = new GLTFLoader(LOADING_MANAGER);

// Collections
const RACERS = [];
const arrSky = [];
const arrColliders = {road: undefined, walls: undefined};
const arrRaceGates = {gates: undefined, finishLine: undefined};
const animMixers = [];
const UTIL_MESHES = {};

// Game classes
const raceManager = new RaceManager();
raceManager.position = new Vector3(50,0,0);


// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
export const scene = new Scene();
scene.background = textureLoader.load('environment/sky/skygradient.jpg');

// Objects
// const geometry = new SphereBufferGeometry( 10, 1, 16, 10 );



// Materials

const material = new MeshPhysicalMaterial();
material.metalness = 0;
material.roughness = 1;
material.color = new Color(0xffffff);

const matRoad = new MeshStandardMaterial({});
matRoad.map = textureLoader.load('environment/road/roadSurface_BaseColor.png');
matRoad.normalMap = textureLoader.load('environment/road/roadSurface_Normal.png');
matRoad.emissiveMap = textureLoader.load('environment/road/roadSurface_Emissive.png');
matRoad.metalMap = textureLoader.load('environment/road/roadSurface_OcclusionRoughnessMetallic.png');
matRoad.roughnessMap = textureLoader.load('environment/road/roadSurface_OcclusionRoughnessMetallic.png');
matRoad.aoMap = textureLoader.load('environment/road/roadSurface_OcclusionRoughnessMetallic.png');

const matRails = new MeshPhongMaterial({
  map : textureLoader.load('environment/road/roadGuardRail.png'),
  emissive : new Color(0xFFFFFF),
  emissiveMap : textureLoader.load('environment/road/roadGuardRailEmissive.jpg'),
  emissiveIntensity : 1,
  alphaMap : textureLoader.load('environment/road/roadGuardRailAlpha.jpg'),
  transparent : true,
  alphaTest : 0.5
});
let v2 = { x: 3, y: 1 };
matRails.map.wrapS = RepeatWrapping;
matRails.emissiveMap.wrapS = RepeatWrapping;
matRails.alphaMap.wrapS = RepeatWrapping;
// matRails.map.offset = { x: 0, y: 0 };
matRails.map.repeat = v2;
matRails.emissiveMap.repeat = v2;
matRails.alphaMap.repeat = v2;
// console.log(matRails);

function meshesMaterial(meshArr=[], material=null) {
  for (let i=0; i<meshArr.length; i++) {
    meshArr[i].material = material;
  }
}



// Mesh
// var skysphere = undefined
// var sphere = new Mesh(geometry,material)
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

gltfLoader.load('./util/debugLine.glb', function (gltf) {
  let line = gltf.scene.children[0];
  UTIL_MESHES.debugLine = line;
  // console.log(line);

}, undefined, function (error) {
  console.error(error);
});

function addWalls() {
  gltfLoader.load('./environment/road/track01_walls.gltf', function ( gltf ) {
    let walls = gltf.scene;
    walls.scale.set(1,1,1);

    // meshesMaterial(walls.children, matRails)
    walls.visible = false;

    arrColliders.walls = walls;
    scene.add( walls );

  }, undefined, function ( error ) {
    console.error( error );
  });
}
addWalls();

function addEnv() {
  gltfLoader.load('./environment/road/track01_env.glb', function ( gltf ) {
    let env = gltf.scene;
    env.scale.set(1,1,1);

    // console.log('ENVIRONMENT ASSET...');
    // console.log(gltf.scene);

    let roadParent = null;
    let gateParent = null;
    let startingLine = null;
    // let i=0;
    // while (i<gltf.scene.children.length && !(roadParent && gateParent)) {
    for (let i=0; i<gltf.scene.children.length; i++) {
      let obj = gltf.scene.children[i];
      // if (gltf.scene.children[i].name === "roadGroupParent") {
      //     roadParent = gltf.scene.children[i];
      // } else if (gltf.scene.children[i].name === "gateGroupParent") {
      //     gateParent = gltf.scene.children[i];
      // }
      // console.log(obj)
      switch(obj.name) {
        case "roadGroupParent":
          roadParent = obj;
          break;
        case "gateGroupParent":
          gateParent = obj;
          break;
        case "raceStartingLine":
          startingLine = obj;
          break;
        default: break;
      }
    }
    if (startingLine) {
      let mat = startingLine.material;
      mat.map = textureLoader.load('environment/road/checker.jpg');
      mat.map.wrapS = RepeatWrapping;
      mat.map.wrapT = RepeatWrapping;
      mat.map.magFilter = NearestFilter;
      startingLine.scale.set(-1,1,-1);
      mat.emissive = new Color(0xFFFFFF);
      mat.emissiveMap = mat.map;
      mat.emissiveIntensity = 0.7;
    }
    if (gateParent) arrRaceGates.gates = gateParent.children;
    if (roadParent) meshesMaterial(roadParent.children, matRails);
    scene.add(env);

    // console.log(gateParent  );
    // console.log(`found gateGroupParent?: ${Boolean(gateParent)} // roadGroupParent?: ${Boolean(roadParent)} // raceStartingLine?: ${Boolean(startingLine)}`);
    // console.log(`roadChildren length: ${roadParent.children.length} // gateChildren length: ${gateParent.children.length}`)

  }, undefined, function ( error ) {
    console.error( error );
  });
}
addEnv();

function addRoad() {
  gltfLoader.load( './environment/road/track01_road.glb', function ( gltf ) {
    let road = gltf.scene;
    // road.castShadow = true;
    // road.receiveShadow = true;
    // road.scale.set(1,1,1);

    console.log('ROADS')
    console.log(gltf.scene.children)

    gltf.scene.children.forEach(mesh => {
      if (!mesh.geometry) return;
      mesh.geometry.computeVertexNormals();
    });

    meshesMaterial(road.children, matRoad);

    let dirt = null;
    for (let i=0; i<gltf.scene.children.length; i++) {
      let obj = gltf.scene.children[i];
      switch(obj.name) {
        case "dirt":
          dirt = obj;
          break;
        default:
      }
    }
    if (dirt) {
      dirt.material = new MeshPhysicalMaterial();
      let mat = dirt.material;
      mat.map = textureLoader.load("./environment/ground/dirt_grass_basecolor.jpg");
      mat.map.wrapS = RepeatWrapping;
      mat.map.wrapT = RepeatWrapping;
      mat.normalMap = textureLoader.load("./environment/ground/dirt_grass_normal.jpg");
      mat.normalMap.wrapS = RepeatWrapping;
      mat.normalMap.wrapT = RepeatWrapping;
    }

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
    // console.log('addRacer');
    // console.log(gltf.scene);
    // let mat = mesh.children[1].material;
    // let texColor = textureLoader.load("./vehicle/vehicle_BaseColor.jpg");
    // texColor.flipY = false;
    // mat.map = texColor;
    // mat.emissiveMap = texColor;
    // mat.emissive = new Color(0xFFFFFF);
    // mat.emissiveIntensity = 0.75;
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    // console.log(mesh);
    mesh.scale.set(1,1,1);
    // mesh.material = material;
    scene.add( mesh );
    let racer = new Vehicle(gltf);
    const jetLight = new PointLight();
    scene.add(jetLight);
    jetLight.distance = 5;
    jetLight.intensity = 0;
    // jetLight.decay = 10;
    // console.log(jetLight);
    jetLight.position.set(0,0,-2);
    racer.obj.scene.attach(jetLight);
    racer.jetLight = jetLight;

    RACERS.push(racer);
    addRacerJets(racer);
  }, undefined, function ( error ) {
    console.error( error );
  } );
}
addRacer();


const jetMat = new MeshLambertMaterial({emissive: new Color(1,1,1), emissiveIntensity: 255});
const addRacerJets = (racer) => {
gltfLoader.load('./vehicle/jet.glb', function (gltf) {
  // console.log(gltf);
  const jet1 = gltf.scene;
  jet1.children[0].material = jetMat;
  const jet2 = jet1.clone();
  const jet3 = jet1.clone();
  jet1.animations = gltf.animations;
  jet2.animations = gltf.animations;
  jet3.animations = gltf.animations;
  scene.add(jet1);
  scene.add(jet2);
  scene.add(jet3);
  const animMixer1 = new AnimationMixer(jet1);
  const animMixer2 = new AnimationMixer(jet2);
  const animMixer3 = new AnimationMixer(jet3);
  const jet1clip1 = animMixer1.clipAction(jet1.animations[0]);
  const jet1clip2 = animMixer1.clipAction(jet1.animations[1]);
  const jet2clip1 = animMixer2.clipAction(jet1.animations[0]);
  const jet2clip2 = animMixer2.clipAction(jet1.animations[1]);
  const jet3clip1 = animMixer3.clipAction(jet1.animations[0]);
  const jet3clip2 = animMixer3.clipAction(jet1.animations[1]);
  animMixers.push(animMixer1);
  animMixers.push(animMixer2);
  animMixers.push(animMixer3);
  racer.obj.scene.attach(jet1);
  racer.obj.scene.attach(jet2);
  racer.obj.scene.attach(jet3);
  jet1.position.set(0,0.6,-1.5);
  jet2.position.set(0.6, 0.4, -1.4);
  jet3.position.set(-0.6, 0.4, -1.4);
  jet1.scale.set(0, 0, 0);
  jet2.scale.set(0,0,0);
  jet3.scale.set(0, 0, 0);
  racer.jets = {objs: [jet1, jet2, jet3], anims1: [jet1clip1, jet2clip1, jet3clip1], anims2: [jet1clip2, jet2clip2, jet3clip2]};
}, undefined, function (error) {
  console.error(error);
});
}

function assignRacerColliders() {
  if (arrColliders.road && arrColliders.walls) {      // check that both colliders were loaded and exist
    for (let i=0; i<RACERS.length; i++) {        // pass references of colliders to racers
      RACERS[i].road = arrColliders.road;
      RACERS[i].walls = arrColliders.walls;
    }
  }
}

// sound and visual effects for other classes to use
const fanfare = {};
function addRaceFont() {
  gltfLoader.load('./fanfare/race_start/raceFont.gltf', function (gltf) {
    fanfare.raceFont = gltf;
    // gltf.scene.scale.set(10,10,10);
    gltf.scene.position.set(45,10,0);
    // console.log(fanfare.raceFont);
    raceManager.fanfare.raceFont = {};
    raceManager.fanfare.raceFont.obj = gltf;

    gltf.scene.rotation.set(0,Math.PI * 0.5,0);


    const animMixer = new AnimationMixer(gltf.scene);
    // const animAction = animMixer.clipAction(gltf.animations[0]);
    // raceManager.fanfare.raceFont.animMixer = animMixer;
    raceManager.fanfare.raceFont.animCountdown = animMixer.clipAction(gltf.animations[0]);
    raceManager.fanfare.raceFont.animFinish = animMixer.clipAction(gltf.animations[1]);
    raceManager.fanfare.raceFont.animLapFinal = animMixer.clipAction(gltf.animations[2]);
    raceManager.fanfare.raceFont.animLap3 = animMixer.clipAction(gltf.animations[3]);
    raceManager.fanfare.raceFont.animLap2 = animMixer.clipAction(gltf.animations[4]);
    // animAction.timeScale = 42;
    // animAction.play();
    animMixers.push(animMixer);


    // console.log('add race font: ');
    // console.log(gltf);
    // gltf.scene.children[0].children[5].material = matRails
    let mat = gltf.scene.children[0].children[8].material;
    let texMap = textureLoader.load('fanfare/race_start/racingFont.jpg');
    texMap.magFilter = NearestFilter;
    texMap.flipY = false;
    mat.map = texMap;
    mat.alphaMap = textureLoader.load('fanfare/race_start/racingFontAlpha.jpg');
    mat.alphaMap.flipY = false;
    mat.transparent = true;
    mat.alphaTest = 0.5;
    // console.log(mat.map)
    mat.needsUpdate = true;
    // mat.color = new Color(0xFFFFFF)
    mat.emissive = new Color(0xFFFFFF);
    mat.emissiveMap = texMap;
    mat.emissiveIntensity = 1;
    mat.reflectivity = 0;
    // mat.map.offset = [1,1];

    scene.add(gltf.scene);

    // raceManager.fanfare.raceFont.animCountdown.stop();
    // raceManager.fanfare.raceFont.animCountdown.setLoop(1,1);
    // console.log(gltf.animations[1]);
  }, undefined, function ( error ) {
    console.error( error );
  });
}
addRaceFont();

function addFlyCam() {
  gltfLoader.load('./fanfare/flycams/flycam_lv1.gltf', function (glb) {
    scene.add(glb.scene);
    // glb.scene.scale.set(1,1,1);
    fanfare.flycamStart = {};
    playCam.flycams.flycamStart = {};
    fanfare.flycamStart.obj = glb;
    // fanfare.flycamStart.obj.scene.position.set(0,50,0);
    const animMixer = new AnimationMixer(glb.scene);
    fanfare.flycamStart.animMixer = animMixer;
    fanfare.flycamStart.anim = animMixer.clipAction(glb.animations[0]);
    // console.log('PRINTING ANIM MIXER...');
    // console.log(glb);
    // // console.log(fanfare.flycamStart.obj);
    animMixers.push(animMixer);
    // // fanfare.flycamStart.anim.setLoop(LoopRepeat);

    playCam.flycams.flycamStart.obj = fanfare.flycamStart.obj.scene;
    playCam.flycams.flycamStart.anim = animMixer.clipAction(glb.animations[0]);

  }, undefined, function (error) {
    console.error(error);
  });
}
addFlyCam();
// function addDecalShadows() {
//     gltfLoader.load('./util/cube.glb', function (gltf) {
//         console.log('add decal shadows: ');
//         console.log(RACERS[0].obj.scene);
//         var decalShadow = new DecalGeometry(RACERS[0].obj.scene.children[0], RACERS[0].obj.scene.position, RACERS[0].obj.scene.rotation.clone().multiply(new Quaternion(1,0,0)), new Vector3(1,1,1));
//         const matShadow = new MeshBasicMaterial({color: 0x00ff00});
//         const decal = new Mesh(decalShadow, matShadow);
//         console.log(decal);
//         decal.scale.set(5,5,5);
//         decal.position.set(...RACERS[0].position.toArray());
//         scene.add(decal);
//         RACERS[0].decalShadow = decal;

//     }, undefined, function ( error ) {
//         console.error( error );
//     });
// }
// addDecalShadows();

// Lights

const hlight = new AmbientLight(0xD4FBF9,0.5);
hlight.position.set(0.5,0.5,0.5);

// console.log(hlight)
scene.add(hlight);

// const pointLight = new PointLight(0xffffff, 1);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

const directionalLight = new DirectionalLight(0xFAF3C0,1);
directionalLight.position.set(-1,0.5,0.5);
// directionalLight.castShadow = true;
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: Util.clampFMax(window.innerWidth, 1200),
  height: Util.clampFMax(window.innerHeight, 700)
};

window.addEventListener('resize', () =>
{
  // Update sizes
  if (isFullscreen) {
    sizes.width = screen.width;
    sizes.height = screen.height;
  } else {
    sizes.width = Util.clampFMax(window.innerWidth, 1200);
    sizes.height = Util.clampFMax(window.innerHeight, 700);
  }

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const fullscreenButton = document.querySelector("#button-fullscreen");
const hud = document.querySelector('.mid');

const fullscreenClick = e => {
  e.stopPropagation();
  if (!document.fullscreenElement) {
    hud.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

fullscreenButton.addEventListener('click', fullscreenClick);

let isFullscreen = false;
const gameViewport = document.querySelector('#game-viewport');
gameViewport.addEventListener('fullscreenchange', () => { // set the resolution when maximizing / windowing the viewport // needs testing on windows machine
  console.log('fullscreen status changed');
  if (document.fullscreenElement) {
    sizes.width = screen.width;
    sizes.height = screen.height;
    isFullscreen = true;
  } else {
    sizes.width = Util.clampFMax(window.innerWidth, 1200);
    sizes.height = Util.clampFMax(window.innerHeight, 700);
    isFullscreen = false;
  }
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// const ctx = canvas.getContext("webgl");
// import buttons from "./javascripts/buttons";
// const buttonExitFullscreen = buttons.exitFullscreen;
// let img = document.createElement('img');
// img.src = 'icons/expand.png';
// buttonExitFullscreen.img = img;
// const drawWidgets = () => {
//   if (isFullscreen) {
//     let {pos, size, img} = buttonExitFullscreen;
//     void ctx.drawImage(img, pos[0], pos[1], size[0], size[1]);
//   }
// };
/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 30;
const playCam = new PlayCam(camera, new Vector3(), RACERS[0]);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const myVector = new Vector3(50,0,0);
// render iterators
function renderRacers(deltaTime) {
  RACERS[0].handleOrientation(gameState.playerController);
  for (let i=0; i<RACERS.length; i++) {
    RACERS[i].move(deltaTime);
    // RACERS[i].position.x = clock.getElapsedTime();
  }
  // if (RACERS[0]) playCam.lookAt(RACERS[0].position);
  // if (RACERS[0]) playCam.obj.lookAt(myVector);
  // console.log(playCam.lookatTarget)
}

function renderSky() {
  for (let i=0; i<RACERS.length; i++) {
    arrSky[i].position.set(camera.position.x,camera.position.y,camera.position.z);
  }
}

/**
 * Animate
 */
const clock = new Clock();

 function animate(deltaTime) {
  animMixers.forEach(animMix => {
    animMix.update(deltaTime);
  })
}


const arrows = [];
function addArrows() {
  // vehicle Y (up)
  let arrow = new ArrowHelper(new Vector3(0,1,0), RACERS[0].position, 5, new Color("rgb(0,255,0)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

  // vehicle Z (forward)
  arrow = new ArrowHelper(new Vector3(0,0,1), RACERS[0].position, 5, new Color("rgb(0,0,255)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

  // vehicle X (right)
  arrow = new ArrowHelper(new Vector3(1,0,0), RACERS[0].position, 5, new Color("rgb(255,0,0)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

  // vehicle floor trace (down) 1
  arrow = new ArrowHelper(new Vector3(), RACERS[0].position, RACERS[0].raycaster1.far, new Color("rgb(255,255,0)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

  // gravity direction
  arrow = new ArrowHelper(new Vector3(), RACERS[0].position, RACERS[0].raycaster1.far, new Color("rgb(0,0,255)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

  // // vehicle floor trace (down) 2
  // arrow = new ArrowHelper(new Vector3(), RACERS[0].position, RACERS[0].raycaster1.far, new Color("rgb(255,255,0)"), 0.5);
  // arrows.push(arrow);
  // scene.add(arrow);

  // // vehicle floor trace (down) 3
  // arrow = new ArrowHelper(new Vector3(), RACERS[0].position, RACERS[0].raycaster1.far, new Color("rgb(255,255,0)"), 0.5);
  // arrows.push(arrow);
  // scene.add(arrow);

  // vehicle front trace
  arrow = new ArrowHelper(new Vector3(), RACERS[0].position, RACERS[0].raycaster1.far, new Color("rgb(255,255,0)"), 0.5);
  arrows.push(arrow);
  scene.add(arrow);

}

function moveArrows() {
  for (let i=0; i<arrows.length; i++) {
    // arrows[i].position.set(RACERS[0].position);
    arrows[i].position.x = RACERS[0].position.x;
    arrows[i].position.y = RACERS[0].position.y;
    arrows[i].position.z = RACERS[0].position.z;
  }
  // arrows[0].rotation.setFromQuaternion(RACERS[0].rotation.clone().multiply(new Quaternion(0,-1,0)).normalize());
  // arrows[1].rotation.setFromQuaternion(RACERS[0].rotation.clone().multiply(new Quaternion(1,0,0)).normalize());
  // arrows[2].rotation.setFromQuaternion(RACERS[0].rotation.clone().multiply(new Quaternion(0,0,1)).normalize());
  // arrows[3].rotation.setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0), RACERS[0].floorTrace.direction.clone()));
  arrows[3].setDirection(RACERS[0].floorTraceCenter.direction.clone());
  arrows[4].setDirection(RACERS[0].gravityDir.clone());
  arrows[5].setDirection(RACERS[0].forwardDir.clone());
  // arrows[4].setDirection(RACERS[0].floorTraceFront.direction.clone());
  // arrows[5].setDirection(RACERS[0].floorTraceBack.direction.clone());
  // arrows[4].rotation.setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0), RACERS[0].gravityDir.clone()));


  arrows[3].position.set(...RACERS[0].floorTraceCenter.origin.toArray());
  arrows[4].position.set(...RACERS[0].position.clone().add(new Vector3(0,5,0)).toArray());
  // arrows[4].position.set(...RACERS[0].floorTraceFront.origin.toArray());
  // arrows[5].position.set(...RACERS[0].floorTraceBack.origin.toArray());
  // console.log(arrows[3].position);
}

class PlayerController {
  constructor() {
    this.handleOrientation = this.handleOrientation.bind(this);
    window.addEventListener("deviceorientation", this.handleOrientation, true);
    this.absolute = 0;
    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;
  }

  handleOrientation(e) {
    const { absolute, alpha, beta, gamma } = e;
    console.log(e);
    this.absolute = absolute;
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;

    console.log(alpha);
  }
}

const raceInitialize = (restart) => {
  RACERS.forEach(racer => {
    racer.restart();
  });
  raceManager.raceLineup();
  if (restart) {
    raceStart();
  }
};

const raceStart = () => {
  raceManager.raceDelayStart();
  gameState.gameStarted = true;
  playCam.resetPosition();
  // console.log('SET GAMESTARTED TO TRUE')
  playCam.cancelFade();
};

const raceComplete = () => {
  // console.log('RACE IS COMPLETE!!');
  gameInitialize();
  uiManager.raceComplete();
};

const gamePause = (isPaused) => {
  gameState.isPaused = isPaused;
  raceManager.raceTogglePause(isPaused);
}

const gameQuit = () => {
  gameState.gameStarted = false;
  gameState.isPaused = false;
  playCam.cancelFade();
  gameInitialize();
  RACERS.forEach(racer => {
    racer.restart();
  });
  raceManager.raceLineup();
};

class GameState {
  constructor() {
    this.paused = false;
    this.gameStarted = false;
    this.playerController = new PlayerController();
  };
};

const gameState = new GameState;
gameState.raceRestart = () => {
  raceInitialize(true);
};
gameState.raceStart = raceStart;
gameState.raceComplete = raceComplete;
gameState.gameQuit = gameQuit;
gameState.gamePause = gamePause;

const uiManager = new UIManager;
uiManager.gameState = gameState;

playCam.gameState = gameState;
raceManager.gameState = gameState;

// export let isPaused = false;
const tick = () =>
{
  let deltaTime = 0;
  if (gameState.isPaused) {
    deltaTime = 0;
    clock.getDelta();
  } else {
    deltaTime = clock.getDelta();
  }
  // drawWidgets();
  // const elapsedTime = clock.getElapsedTime();
  // Update objects
  // console.log(skysphere.scene)
  // skysphere.scene.position.set(camera.position.x,camera.position.y,camera.position.z - 50)
  // renderSky();
  // playCam.obj.lookAt(RACERS[0].position)
  if (!gameState.isPaused) {

    renderRacers(deltaTime);
    raceManager.updatePositions();
    playCam.move(deltaTime);
    // moveArrows();

    animate(deltaTime);
    uiManager.setElapsedTime(raceManager.updateElapsedTime(deltaTime));
  }

  renderer.render(scene, camera);
  // Update Orbital Controls
  // controls.update()
  // camera.rotateOnAxis.y = .1 * elapsedTime
  // camera.rotation.set(0,0,0) // 1 * elapsedTime


  // Render


  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

const debug = () => {
  let strings = [];

  const { gamma, alpha, beta, absolute } = gameState.playerController

  strings.push(`gamma: ${gamma}`);
  strings.push(`alpha: ${alpha}`);
  strings.push(`beta: ${beta}`);
  strings.push(`absolute: ${absolute}`);

  return strings;
}

const uiTick = () => {
  uiManager.menus.playHud.playerSpeed.speed = RACERS[0].speed;
  uiManager.setSpeedGauge();
  uiManager.debug(debug());
};

// var prepTick = setInterval(tryTick, 100);

function tryTick() {
  console.log("Trying to start tick..."); // A catch-all solution to waiting on the player's vehicle to be ready

  assignRacerColliders(); // pass references of the roads/walls to all racers
  // console.log(`loaded Racer[0]?: ${Boolean(RACERS[0])} // passed walls to racer[0]?: ${Boolean(RACERS[0].walls)} // has gates?: ${Boolean(arrRaceGates.gates)}`)

  if (RACERS[0] && RACERS[0].walls && arrRaceGates.gates) {
    // clearInterval(prepTick); // clear interval first thing so if any functions fail, we don't spam this interval
    clock.getDelta();

    RACERS[0].isPlayer = true;
    // console.log('ARRRACERS[0].SPEED');
    // console.log(RACERS[0].speed);


    // RACERS[0].bindControls();
    playCam.player = RACERS[0];
    RACERS[0].cam = playCam;

    raceManager.racers = RACERS;
    raceManager.rotation = new Quaternion(0,1,0);
    raceManager.raceGates = arrRaceGates.gates;
    raceManager.sortRaceGates();
    raceInitialize();
    // raceManager.raceCountdown();

    // addArrows(); // debugger
    console.log("Tick started");
    tick();
    setInterval(uiTick, 100);
  }
}

LOADING_MANAGER.onLoad = () => {
  console.log('Loading complete!...');
  tryTick();
  // raceManager.fanfare.raceFont.animCountdown.play();
  gameInitialize();
}

const gameInitialize = () => {
  fanfare.flycamStart.anim.play();
  playCam.flycamFadeAnim();
  gameState.gameStarted = false;
};


// it's math