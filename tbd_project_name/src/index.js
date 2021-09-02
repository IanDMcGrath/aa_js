import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const meshLoader = new GLTFLoader(); // GLTF format mesh loader, meshes authored in blender

meshLoader.load( '../dist/assets/stageDoor.glb', function ( gltf ) {
	scene.add( gltf.scene );
    }, undefined, function ( error ) {
	    console.error( error );
} );