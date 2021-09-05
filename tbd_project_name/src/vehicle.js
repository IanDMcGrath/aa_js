import {Vector3, Quaternion, Euler, Raycaster} from 'three'
const Util = require('./utils');
const Quat = Quaternion; // because it's easier to type and read


export class Vehicle {
    constructor(obj, positionVector, isPlayer=false) {
        this.scale = [1,1,1];
        this.position = positionVector.clone();
        this.position.x = -5
        this.rotation = new Quat();
        this.throttle = 0;
        this.linearVelocity = new Vector3(); //[0.1,0,0]; // x, y, z : right, up, forward
        // this.linearVelocity.x = .1
        this.rotationalVelocity = new Quat();
        this.obj = obj;
        this.isPlayer = isPlayer;
        this.forwardDir = new Vector3(0,0,1);
        this.upDir = new Vector3(0,1,0);
        this.rightDir = new Vector3(1,0,0);
        this.camOffset = new Vector3(0,6,-10);
        this.buildCollisions();
        this.road = undefined;
        this.isFalling = false;
        this.gravityDir = new Vector3(0,-1,0);
        this.trueVelocity = new Vector3();
        this.secondPos = new Vector3();

        if (isPlayer) {
            bindControls();
            this.forwardPressed = false;
            this.backwardPressed = false;
            this.leftPressed = false;
            this.rightPressed = false;
        }

    }

    calcDirections(){
        this.forwardDir = new Vector3(0,0,1).applyQuaternion(this.rotation);
        this.upDir = new Vector3(0,1,0).applyQuaternion(this.rotation);
        this.forwardDir.normalize();
        // console.log(this.forwardDir)
    }


    move() {
        this.calcDirections();
        this.collision();
        this.rotation.multiply(this.rotationalVelocity);
        this.rotation.normalize();

        this.accelerate();
        if (this.isFalling) {
            this.gravity();
        } else {
            this.momentum();
        }
        
        this.position.add(this.linearVelocity);


        // update the mesh to match the class transform;
        this.obj.scene.position.set(...this.position.toArray());
        this.obj.scene.rotation.setFromQuaternion(this.rotation);
    }

    gravity() {
            this.linearVelocity.add(this.gravityDir.multiplyScalar(1))
    }

    falling(isFalling) {
        if (isFalling && !this.isFalling) {
            this.isFalling = true;
            this.linearVelocity = this.trueVelocity;
        } else if (!isFalling && this.isFalling) {
            this.isFalling = false;
        }
    }

    momentum() {
        this.trueVelocity = this.position.clone().sub(this.secondPos);
        this.secondPos = this.position.clone();
    }

    accelerate() {
        let speed = this.linearVelocity.length();
        speed = (speed + this.throttle);
        speed = Util.clampFMax(speed, 2);
         if (this.throttle === 0) speed = speed * 0.98;
        this.linearVelocity.set(...this.forwardDir.multiplyScalar(speed).toArray());
        // console.log(this.linearVelocity)
    }

    render() {

    }

    bindControls() {
        const that = this;
        console.log('binding keys')
        window.addEventListener("keydown", (event) => {that.handleInput(event, true)})
        window.addEventListener("keyup", (event) => {that.handleInput(event, false)})
    }

    handleInput(event, down) {
        switch(event.key) {
            case "w":
                this.playerForward(down);
                break;
            case "s":
                this.playerBackward(down);
                break;
            case "a":
                this.playerLeft(down);
                break;
            case "d":
                this.playerRight(down);
                break;
            default:
                return;
        }
    }

    playerForward(pressed) {
        this.forwardPressed = pressed;
        if (pressed) {
            this.throttle = 0.035
        } else {
            this.backwardPressed ? this.playerBackward(true) : this.throttle = 0;
        }
    }

    playerBackward(pressed) {
        this.backwardPressed = pressed;
        if (pressed) {
            this.throttle = -0.035
        } else {
            this.forwardPressed ? this.playerForward(true) : this.throttle = 0;
        }
    }

    playerLeft(pressed) {
        this.leftPressed = pressed;
        if (pressed) {
            this.rotationalVelocity = new Quat(0,0.03,0);
        } else {
            this.rightPressed ? this.playerRight(true) : this.rotationalVelocity = new Quat();
        }
    }

    playerRight(pressed) {
        this.rightPressed = pressed;
        if (pressed) {
            this.rotationalVelocity = new Quat(0,-0.03,0);
        } else {
            this.leftPressed ? this.playerLeft(true) : this.rotationalVelocity = new Quat();
        }
    }

    buildCollisions() {
        this.raycaster = new Raycaster();
        // this.raycaster.layers.set(1);
        this.obj.scene.layers.set(1);
        this.raycaster.far = 5;
        this.raycaster.direction = new Euler(0,0,0);
        console.log(this.raycaster.direction);
    }
    
    collision() {
        this.collideRoad();
    }
    
    collideRoad() {
        this.raycaster.set(this.position, new Vector3(0,-1,0).applyQuaternion(this.rotation));
        let intersects = []
        this.raycaster.intersectObjects(this.road.children, true, intersects);
        this.falling(!intersects.length > 0);
        if (!this.isFalling) {
            this.moveToRoad(intersects[0]);
        }
    };

    moveToRoad(intersect) {
        // console.log(intersect)
        let hitDist = this.position.clone().sub(intersect.point).length();
        // let downDir = this.upDir.clone().multiplyScalar(-1);
        // console.log(downDir)
        let offset = this.upDir.multiplyScalar((hitDist - 1) * -1)
        this.position.add(offset);
        // console.log(intersect)

        let forwardNormal = intersect.face.normal.projectOnPlane(this.forwardDir); // some jank happening here. Need to stabilize the added rotation somehow
        let dot = forwardNormal.dot(this.upDir);
        // dot = Math.cos(dot);
        let slopeQuat = new Quat(-dot*0.3,0,0);
        slopeQuat = this.rotation.clone().multiply(slopeQuat)
        this.rotation = slopeQuat.clone();

        // let forwardNormal = intersect.face.normal.projectOnPlane(this.forwardDir);
        // let offsetQuat = new Quat();
        // offsetQuat.setFromAxisAngle(intersect.face.normal.negate(), -this.rotation.w);
        // console.log(offsetQuat.w)
        // offsetQuat.normalize();
        // this.rotation = offsetQuat.clone();



        // this.gravityDir = intersect.face.normal.negate();
        // this.rotation.setFromAxisAngle(this.gravityDir, 1);
    }




}

// module.exports = Vehicle;