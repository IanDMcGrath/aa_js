import {Vector3, Quaternion, Euler, Raycaster} from 'three'
const Util = require('./utils');
const Quat = Quaternion; // because it's easier to type and read


export class Vehicle {
    constructor(obj, isPlayer=false) {
        this.scale = [1,1,1];
        this.position = new Vector3(0,0,0);
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
        this.trueVelocity = new Vector3(0,0,0);
        this.secondPos = new Vector3();
        this.yaw = 0;

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
        this.rightDir = new Vector3(1,0,0).applyQuaternion(this.rotation);
        this.forwardDir.normalize();
        this.upDir.normalize();
        this.rightDir.normalize();
    }
    
    
    move() {
        this.rotation.multiply(this.rotationalVelocity);
        this.rotation.normalize();
        this.collision();
        this.calcDirections();
        // this.yaw += this.rotationalVelocity.y;
        // this.yaw = this.yaw % Math.PI;
        // console.log(this.yaw)
        
        this.accelerate();
        if (this.isFalling) {
            // this.gravity();
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
        this.linearVelocity.set(...this.forwardDir.clone().multiplyScalar(speed).toArray());
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
        this.obj.scene.layers.set(2);
        this.raycaster1 = new Raycaster();
        this.raycaster1.far = 50;
        this.raycaster1.direction = new Euler(0,0,0);
        this.raycaster2 = new Raycaster();
        this.raycaster2.far = 50;
        this.raycaster2.direction = new Euler(0,0,0);
        this.raycaster3 = new Raycaster();
        this.raycaster3.far = 50;
        this.raycaster3.direction = new Euler(0,0,0);
        this.raycaster4 = new Raycaster();
        this.raycaster4.far = 50;
        this.raycaster4.direction = new Euler(0,0,0);
    }
    
    collision() {
        this.collideRoad();
    }
    
    collideRoad() {
        let hitDists = []
        let hitDists1 = []
        let hitDists2 = []
        let hitDists3 = []
        this.raycaster1.set(this.position.clone().add(this.forwardDir.multiplyScalar(1)), this.upDir.clone().negate());
        this.raycaster2.set(this.position.clone().add(this.forwardDir.clone().negate), this.upDir.clone().negate());
        this.raycaster3.set(this.position.clone().add(this.rightDir.multiplyScalar(1)), this.upDir.clone().negate());
        this.raycaster4.set(this.position.clone().add(this.rightDir.clone().negate()), this.upDir.clone().negate());
        let intersects = []
        // console.log(this.road)
        this.raycaster1.intersectObjects(this.road.children, true, intersects);
        this.raycaster2.intersectObjects(this.road.children, true, hitDists1);
        this.raycaster3.intersectObjects(this.road.children, true, hitDists2);
        this.raycaster4.intersectObjects(this.road.children, true, hitDists3);
        // hitDists.push(intersects[0])
        hitDists.concat(hitDists1.concat(hitDists2.concat(hitDists3)))
        
        this.falling(!intersects.length > 0);
        if (!this.isFalling) {
            this.moveToRoad(intersects[0], hitDists);
        }
    };
    
    moveToRoad(intersect, hitDists) {
        // console.log(intersect)
        let hitDist = this.position.clone().sub(intersect.point).length();
        // let downDir = this.upDir.clone().multiplyScalar(-1);
        // console.log(downDir)
        let offset = this.upDir.multiplyScalar((hitDist - 3) * -1);
        this.position.add(offset);
        // console.log(intersect)
        
        for (let i=0; i<4; i++) {
            if (hitDists[i]) {
                hitDists[i] = this.position.clone().sub(hitDists[i].point).length();
            } else {
                hitDists.push(1);
            }
        }
        console.log(hitDists)

        let frontRocker = hitDists[0] - hitDists[1];
        let sideRocker = hitDists[2] - hitDists[3];
        let rollForward = new Quat(frontRocker*0.1,0,0);
        let rollRight = new Quat(0,0,sideRocker*0.1);

        this.rotation.multiply(rollForward).normalize();
        this.rotation.multiply(rollRight).normalize();
        
        // if (hitDists[0] - hitDists[1] > 0) {
        //     this.rotation.multiply(rollForward);
        // } else {
        //     this.rotation.multiply(rollBackward);
        // }
                
        // if (hitDists[2] - hitDists[3] > 0) {
        //     this.rotation.multiply(rollLeft);
        // } else {
        //     this.rotation.multiply(rollRight);
        // }

        // let forwardNormal = intersect.face.normal.projectOnPlane(this.forwardDir); // some jank happening here. Need to stabilize the added rotation somehow
        // let dot = forwardNormal.dot(this.upDir);
        // // dot = Math.cos(dot);
        // let slopeQuat = new Quat(-dot*0.1,0,0);
        // slopeQuat = this.rotation.clone().multiply(slopeQuat)
        // this.rotation = slopeQuat.clone();
        
        // hitEuler from the hitface normal
            // hitQuat = transform the hit face normal into car local space
        // let hitQuat = interset.face.normal
            // hitEuler = new euler with x & z rotations of hitQuat and y:0
        // this.rotation.add(new Quat().setFromEuler(hitEuler))

        // let hitQuat = new Quat();
        // hitQuat.setFromUnitVectors(intersect.face.normal, new Vector3(0,-1,0));
        // hitQuat.multiply(this.rotation)
        // console.log(hitQuat)
        // let hitEuler = new Euler().setFromQuaternion(hitQuat);
        // this.rotation.multiply(hitQuat);
        // this.rotation.normalize();
        // console.log(this.rotation)

        // let euler = new Euler();
        // euler.setFromVector3(intersect.face.normal);
        // euler.y = (new Euler().setFromQuaternion(this.rotation)).y;
        // // console.log(euler)
        // this.rotation.setFromEuler(euler.clone());

        // let quat = new Quat();
        // quat.setFromAxisAngle(intersect.face.normal, this.rotation.y)
        // quat.normalize();
        // this.rotation.multiply(quat);

        // let localNormal = intersect.face.normal.applyQuaternion(this.rotation.clone().invert());
        // this.rotation.multiply(new Quat().setFromAxisAngle(localNormal, 0));

        // let localHitNormal = intersect.face.normal
        // // this.obj.scene.updateMatrixWorld();
        // let quat = this.rotation.clone()
        // localHitNormal = localHitNormal.applyQuaternion(quat.conjugate());
        // console.log(localHitNormal)
        // let rollForward = new Quat(0.01,0,0).normalize();
        // let rollBackward = new Quat(-0.01,0,0).normalize();
        // let rollRight = new Quat(0,0,0.01).invert().normalize();
        // let rollLeft = new Quat(0,0,-0.01).invert().normalize();
        // if (localHitNormal.x > 0.05) {
        //     console.log('roll right')
        //     this.rotation.multiply(rollLeft);
        // } else {
        //     console.log('roll left')
        //     this.rotation.multiply(rollRight);
        // }

        // if (localHitNormal.x > 0) {
        //     this.rotation.multiply(rollForward);
        // } else {
        //     this.rotation.multiply(rollBackward);
        // }

        // this.rotation.multiply(quat);
        // this.rotation.normalize();






        // this.gravityDir = intersect.face.normal.negate();
        // this.rotation.setFromAxisAngle(this.gravityDir, 1);
    }




}

// module.exports = Vehicle;