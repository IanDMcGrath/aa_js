import {Vector3, Quaternion, Euler, Raycaster, ArrowHelper} from 'three'
const Util = require('./utils');
const Quat = Quaternion; // because it's easier to type and read


export class Vehicle {
    constructor(obj, isPlayer=false) {
        this.scale = [1,1,1];
        this.position = new Vector3(0,5,0);
        // this.position.x = -5
        this.rotation = new Quat();
        this.throttle = 0;
        this.speed = 0;
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
        this.walls = undefined;
        this.isFalling = false;
        this.gravityDir = new Vector3(0,-1,0);
        this.gravityTotal = new Vector3(0,0,0);
        this.trueVelocity = new Vector3(0,0,0);
        this.secondPos = new Vector3();
        this.yaw = 0;
        this.surface = "road";

        if (isPlayer) {
            bindControls();
            this.forwardPressed = false;
            this.backwardPressed = false;
            this.leftPressed = false;
            this.rightPressed = false;
        }

    }

    calcDirections(){
        this.forwardDir = new Vector3(0,0,1).applyQuaternion(this.rotation.clone());
        this.upDir = new Vector3(0,1,0).applyQuaternion(this.rotation.clone());
        this.rightDir = new Vector3(1,0,0).applyQuaternion(this.rotation.clone());
        this.forwardDir.normalize();
        this.upDir.normalize();
        this.rightDir.normalize();
    }
    
    
    move() {
        this.collision();
        this.accelerate();
        if (this.isFalling) {
            this.gravity();
        } else {
            // this.momentum();
        }
        this.position.add(this.linearVelocity);
        this.rotation.multiply(this.rotationalVelocity);
        this.rotation.normalize();
        this.calcDirections();
        // this.yaw += this.rotationalVelocity.y;
        // this.yaw = this.yaw % Math.PI;
        // console.log(this.yaw)
        
        
        
        
        // update the mesh to match the class transform;
        this.obj.scene.position.set(...this.position.toArray());
        // this.obj.scene.rotation.setFromQuaternion(this.rotation.clone());
        this.obj.scene.rotation.setFromQuaternion(new Quat().setFromEuler(this.obj.scene.rotation).rotateTowards(this.rotation, 0.1))
    }

    gravity() {
        this.gravityTotal.add(this.gravityDir.clone().multiplyScalar(0.01));
        // this.linearVelocity.add(this.gravityDir.clone().multiplyScalar(0.05))
        // console.log(this.gravityDir);
    }

    falling(isFalling) {
        if (isFalling && !this.isFalling) {
            this.isFalling = true;
            // this.gravityTotal.add(this.gravityDir);
            // this.linearVelocity = this.trueVelocity;
        } else if (!isFalling && this.isFalling) {
            this.isFalling = false;
            this.gravityTotal.set(0,0,0);
        }
    }

    momentum() {
        this.trueVelocity = this.position.clone().sub(this.secondPos);
        this.secondPos = this.position.clone();
    }

    accelerate() {
        this.speed = this.speed + this.throttle;
        // speed = (this.speed + this.throttle);
        // speed = Util.clampFMax(this.surface === "dirt" ? speed * 0.97 : speed, 4);
         if (this.throttle === 0) this.speed = this.speed * 0.99;
        this.linearVelocity.set(...(this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed)).toArray()));
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
            this.throttle = 0.02
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
            // this.rotationalVelocity = new Quat(0.03,0,0);
        } else {
            this.rightPressed ? this.playerRight(true) : this.rotationalVelocity = new Quat();
        }
    }

    playerRight(pressed) {
        this.rightPressed = pressed;
        if (pressed) {
            this.rotationalVelocity = new Quat(0,-0.03,0);
            // this.rotationalVelocity = new Quat(-0.03,0,0);
        } else {
            this.leftPressed ? this.playerLeft(true) : this.rotationalVelocity = new Quat();
        }
    }

    buildCollisions() {
        this.obj.scene.layers.set(2);
        this.raycaster1 = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        // this.raycaster1.far = 5;
        // this.raycaster1.direction = new Euler(0,-1,0);
        // this.raycaster2 = new Raycaster();
        // this.raycaster2.far = 1;
        // this.raycaster2.direction = new Euler(0,0,0);
        // this.raycaster3 = new Raycaster();
        // this.raycaster3.far = 1;
        // this.raycaster3.direction = new Euler(0,0,0);
        // this.raycaster4 = new Raycaster();
        // this.raycaster4.far = 1;
        // this.raycaster4.direction = new Euler(0,0,0);
    }
    
    collision() {
        this.collideRoad();
    }
    
    collideRoad() {
        let hitDists = []
        // let hitDists1 = []
        // let hitDists2 = []
        // let hitDists3 = []
    
        this.floorTrace = {origin: this.position.clone().add(this.upDir.clone().multiplyScalar(2)), direction: this.upDir.clone().negate()}
        this.raycaster1.set(this.floorTrace.origin, this.floorTrace.direction);
        // console.log(this.raycaster1);
        // this.raycaster2.set(this.position.clone().add(this.forwardDir.clone().negate), this.upDir.clone().negate());
        // this.raycaster3.set(this.position.clone().add(this.rightDir.multiplyScalar(1)), this.upDir.clone().negate());
        // this.raycaster4.set(this.position.clone().add(this.rightDir.clone().negate()), this.upDir.clone().negate());
        let intersects = [];
        // console.log(this.road)
        this.raycaster1.intersectObjects(this.road.children, true, intersects);
        // this.raycaster2.intersectObjects(this.road.children, true, hitDists1);
        // this.raycaster3.intersectObjects(this.road.children, true, hitDists2);
        // this.raycaster4.intersectObjects(this.road.children, true, hitDists3);
        // hitDists.push(intersects[0])
        // hitDists.concat(hitDists1.concat(hitDists2.concat(hitDists3)))
        
        this.falling(!intersects.length > 0);
        if (!this.isFalling) {
            this.moveToRoad(intersects[0], hitDists);
        }
    };
    
    moveToRoad(intersect, hitDists) {
        // console.log(intersect)
        let hitDist = this.floorTrace.origin.clone().sub(intersect.point).length();
        // let downDir = this.upDir.clone().multiplyScalar(-1);
        // console.log(downDir)
        let offset = this.upDir.clone().multiplyScalar((hitDist - 2.5) * -1); // subtract to offset from trace origin (0 is on the origin) (higher numbers push the vehicle off the floor)
        this.position.add(offset);
        // console.log(offset);
        if (intersect.object.name === "dirt") {
            this.surface = "dirt";
        } else {
            this.surface = "road";
        }
        // console.log(this.surface)
        // console.log(intersect)
        
        // for (let i=0; i<4; i++) {
        //     if (hitDists[i]) {
        //         hitDists[i] = this.position.clone().sub(hitDists[i].point).length();
        //     } else {
        //         hitDists.push(1);
        //     }
        // }
        // console.log(hitDists)

        // let frontRocker = hitDists[0] - hitDists[1];
        // let sideRocker = hitDists[2] - hitDists[3];
        // let rollForward = new Quat(frontRocker*0.1,0,0);
        // let rollRight = new Quat(0,0,sideRocker*0.1);

        // this.rotation.multiply(rollForward).normalize();
        // this.rotation.multiply(rollRight).normalize();
        
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


        //// --->> the simple, snappy solution <<---
        let localHitNormal = intersect.face.normal.clone(); 
        let quat = new Quat().setFromUnitVectors(this.upDir.clone(), localHitNormal);
        let angle = this.upDir.angleTo(localHitNormal);
        this.rotation.premultiply(quat);
        // let quatTarget = this.rotation.clone().premultiply(quat);
        // this.rotation.rotateTowards(quatTarget, angle);



        // this.rotation.multiply(quat);
        // this.rotation.normalize();



        // let hitNormal = intersect.face.normal;
        
        intersect.face.normal.negate();
        this.gravityDir = intersect.face.normal.clone();
    }

}

// module.exports = Vehicle;