import {Vector3, Quaternion, Euler, Raycaster, ArrowHelper} from 'three'
const Util = require('./utils');
const Quat = Quaternion; // because it's easier to type and read


export class Vehicle {
    constructor(obj, isPlayer=false) {
        this.prevNormalTotal = new Vector3(0,1,0);
        this.scale = [1,1,1];
        this.position = new Vector3(0,5,0);
        this.rotation = new Quat();
        this.throttle = 0;
        this.speed = 0;
        this.linearVelocity = new Vector3(); //[0.1,0,0]; // x, y, z : right, up, forward
        this.rotationalVelocity = new Quat();
        this.obj = obj;
        this.isPlayer = isPlayer;
        this.forwardDir = new Vector3(0,0,1);
        this.upDir = new Vector3(0,1,0);
        this.rightDir = new Vector3(1,0,0);
        this.camOffset = new Vector3(0,10,-10);
        this.cam = undefined;
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
        this.resetPos = {pos: new Vector3(), rot: new Quaternion(0,1,0)};

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
        this.addTurn();
        if (this.isFalling) {
            this.gravity();
        } else {
            this.momentum();
        }
        this.position.add(this.linearVelocity);
        this.rotation.multiply(this.rotationalVelocity);
        this.rotation.normalize();
        this.calcDirections();
        
        
        
        
        // update the mesh to match the class transform;
        this.obj.scene.position.set(...this.position.toArray());
        // this.obj.scene.rotation.setFromQuaternion(this.rotation.clone());
        this.obj.scene.rotation.setFromQuaternion(new Quat().setFromEuler(this.obj.scene.rotation).rotateTowards(this.rotation, 0.1))
    }

    gravity() {
        this.gravityTotal.add(this.gravityDir.clone().multiplyScalar(0.05));
        // this.linearVelocity.add(this.gravityDir.clone().multiplyScalar(0.05))
        // console.log(this.gravityDir);
    }

    falling(isFalling) {
        if (isFalling && !this.isFalling) {
            this.isFalling = true;
            // this.gravityTotal.add(this.gravityDir);
            this.linearVelocity = this.trueVelocity;
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
        this.speed = this.speed + this.throttle * (this.leftPressed || this.rightPressed ? 0.5 : 1);
        // speed = (this.speed + this.throttle);
        this.speed = Util.clampFMax((this.surface === "dirt" ? this.speed * 0.97 : this.speed) * (this.leftPressed || this.rightPressed ? 0.99 : 1), 4);
         if (this.throttle === 0) {
             this.speed = this.speed * 0.99
            } else if (this.throttle < 0) {
               this.speed = this.speed * 0.97
            }
        this.linearVelocity.set(...(this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed)).toArray()));
        // console.log(this.linearVelocity)
    }

    addTurn() {
        let maxTurn = 0.03
        let currentTurn = this.rotationalVelocity.y;
        currentTurn = currentTurn + (this.leftPressed ? 0.003 : this.rightPressed ? -0.003 : currentTurn * -0.2);
        currentTurn = Util.clampFRange(currentTurn, -maxTurn, maxTurn)
        this.rotationalVelocity.y = currentTurn;
    }

    render() {

    }

    // // --->> HANDLE INPUTS <<---
    bindControls() {
        console.log('binding keys')
        const that = this;

        this.keydown = (event) => {that.handleInput(event, true)}; // remove event listener proof for darrick #1
        this.keyup = (event) => {that.handleInput(event, false)};

        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup",this.keyup);
    }

    handleInput(event, down) {
        switch(event.key) {
            case "w":
                this.playerForward(down);
                // console.log("W")
                // alert('you pressed w')
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
            case "r":
                if (down) this.resetPosition();
                break;
            default:
                return;
        }
    }

    resetPosition() { // in case the player gets stuck, call this by pressing 'R'
        console.log(this.rotation);
        this.position = this.resetPos.pos.clone();
        this.rotation = this.resetPos.rot.clone();
        console.log(this.resetPos.rot.clone());
        this.obj.scene.rotation.setFromQuaternion(this.rotation);
        this.obj.scene.position.set(...this.position.toArray());
        this.linearVelocity = new Vector3();
        this.trueVelocity = new Vector3();
        this.rotationalVelocity = new Quat();
        this.speed = 0;
        this.cam.resetPosition();
    }

    playerForward(pressed) {
        // window.removeEventListener("keydown", this.keydown); // remove event listener proof for darrick #2
        this.forwardPressed = pressed;
        if (pressed) {
            this.throttle = 0.02;
        } else {
            this.backwardPressed ? this.playerBackward(true) : this.throttle = 0;
        }
    }

    playerBackward(pressed) {
        this.backwardPressed = pressed;
        if (pressed) {
            this.throttle = -0.01;
        } else {
            this.forwardPressed ? this.playerForward(true) : this.throttle = 0;
        }
    }

    playerLeft(pressed) {
        this.leftPressed = pressed;
        // if (pressed) {
        //     // this.rotationalVelocity = new Quat(0,0.03,0);
        //     // this.rotationalVelocity = new Quat(0.03,0,0);
        // } else {
        //     this.rightPressed ? this.playerRight(true) : this.rotationalVelocity = new Quat();
        // }

        if (!pressed) {
            if (this.rightPressed) {this.playerRight(true)}
        }
    }

    playerRight(pressed) {
        this.rightPressed = pressed;
        // if (pressed) {
        //     // this.rotationalVelocity = new Quat(0,-0.03,0);
        //     // this.rotationalVelocity = new Quat(-0.03,0,0);
        // } else {
        //     this.leftPressed ? this.playerLeft(true) : this.rotationalVelocity = new Quat();
        // }

        if (!pressed) {
            if (this.leftPressed) {this.playerLeft(true)}
        }
    }

    buildCollisions() {
        this.obj.scene.layers.set(2);
        this.raycaster1 = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        // this.raycaster2 = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        // this.raycaster3 = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        // this.raycaster4 = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        this.raycasterWallC = new Raycaster(this.position.clone(), this.forwardDir.clone(), 0, 1);
        this.raycasterWallF = new Raycaster(this.position.clone(), this.forwardDir.clone(), 0, 4);
        this.raycasterWallL = new Raycaster(this.position.clone(), this.rightDir.clone().negate(), 0, 2);
        this.raycasterWallR = new Raycaster(this.position.clone(), this.rightDir.clone(), 0, 2);
    }
    
    collision() {
        if (this.road) this.collideRoad();
        if (this.walls) this.collideWall();
    }
    
    collideRoad() {
        let hitDists = [];
        // let hitDists1 = []
        // let hitDists2 = []
        // let hitDists3 = []
    
        let upOffset = this.position.clone().add(this.upDir.clone().multiplyScalar(2));
        let downDir = this.upDir.clone().negate();
        this.floorTraceCenter = {origin: upOffset.clone(), direction: downDir.clone()}
        // this.floorTraceFront = {origin: upOffset.clone().add(this.forwardDir.clone().multiplyScalar(3)), direction: downDir.clone()}
        // this.floorTraceBack = {origin: upOffset.clone().add(this.forwardDir.clone().multiplyScalar(-3)), direction: downDir.clone()}
        // console.log(upOffset.clone().add(this.forwardDir.clone().multiplyScalar(1)))
        this.raycaster1.set(this.floorTraceCenter.origin, this.floorTraceCenter.direction);
        // this.raycaster2.set(this.floorTraceFront.origin, this.floorTraceFront.direction);
        // this.raycaster3.set(this.floorTraceBack.origin, this.floorTraceBack.direction);
        // this.raycaster4.set(this.position.clone().add(this.rightDir.clone().negate()), this.upDir.clone().negate());
        let intersects = [];
        // console.log(this.road)
        this.raycaster1.intersectObjects(this.road.children, true, intersects);
        // this.raycaster2.intersectObjects(this.road.children, true, hitDists1);
        // this.raycaster3.intersectObjects(this.road.children, true, hitDists2);
        // this.raycaster4.intersectObjects(this.road.children, true, hitDists3);
        // hitDists.push(intersects[0])
        // hitDists = [hitDists[hitDists.length - 1], hitDists1[hitDists1.length - 1], hitDists2[hitDists2.length - 1]];
        
        this.falling(!intersects.length > 0);
        if (!this.isFalling) {
            this.moveToRoad(intersects[0], hitDists);
        }
    };
    
    moveToRoad(intersect, hitDists) {
        // console.log(intersect)
        let hitDist = this.floorTraceCenter.origin.clone().sub(intersect.point).length();
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


        // // --->> the janky, was supposed to smooth, way <<---
        // let offsetOrder = [this.floorTraceCenter, this.floorTraceFront, this.floorTraceBack];
        // let hitNormalTotal = new Vector3(0,1,0);
        // for (let i=0; i<hitDists.length; i++) {
        //     if (hitDists[i]) {
        //         hitNormalTotal.add(hitDists[i].face.normal.clone().multiplyScalar(offsetOrder[i].origin.clone().sub(hitDists[i].point).length() * 0.1));
        //         // console.log(hitDists[i].face.normal)
        //     } else {
        //         hitNormalTotal.add(this.upDir);
        //     }
        // }
        // console.log(hitDists)
        // let hitNormalAvg = this.prevNormalTotal.clone().add(hitNormalTotal)
        // this.prevNormalTotal = hitNormalTotal.clone();
        // hitNormalAvg.normalize()

        // // let localHitNormal = intersect.face.normal.clone(); 
        // let localHitNormal = hitNormalAvg.clone();
        // let quat = new Quat().setFromUnitVectors(this.upDir.clone(), localHitNormal);
        // // let angle = this.upDir.angleTo(localHitNormal);
        // this.rotation.premultiply(quat);



        // --->> the simple, snappy solution <<---
        let localHitNormal = intersect.face.normal.clone(); 
        let quat = new Quat().setFromUnitVectors(this.upDir.clone(), localHitNormal);
        // let angle = this.upDir.angleTo(localHitNormal);
        this.rotation.premultiply(quat);



        this.gravityDir = intersect.face.normal.clone().negate();
    }

    collideWall() {
        let predictPos = this.linearVelocity.clone().normalize();
        let wallTraceCenter = {origin: this.position.clone(), dir: predictPos, hits: []};
        let wallTraceFront = {origin: this.position.clone(), dir: this.forwardDir.clone(), hits: []};
        let wallTraceLeft = {origin: this.position.clone(), dir: this.rightDir.clone().negate(), hits: []};
        let wallTraceRight = {origin: this.position.clone(), dir: this.rightDir.clone(), hits: []};

        this.raycasterWallC.set(wallTraceCenter.origin, wallTraceCenter.dir);
        this.raycasterWallC.far = Util.clampFMin(this.linearVelocity.length(), 3);

        this.raycasterWallF.set(wallTraceFront.origin, wallTraceFront.dir);
        this.raycasterWallL.set(wallTraceLeft.origin, wallTraceLeft.dir);
        this.raycasterWallR.set(wallTraceRight.origin, wallTraceRight.dir);

        this.raycasterWallC.intersectObjects(this.walls.children, true, wallTraceCenter.hits);
        this.raycasterWallF.intersectObjects(this.walls.children, true, wallTraceFront.hits);
        this.raycasterWallL.intersectObjects(this.walls.children, true, wallTraceLeft.hits);
        this.raycasterWallR.intersectObjects(this.walls.children, true, wallTraceRight.hits);


        if (wallTraceCenter.hits.length > 0 || wallTraceFront.hits.length > 0 || wallTraceLeft.hits.length > 0 || wallTraceRight.hits.length > 0) {
            this.bounceOffWall([wallTraceCenter, wallTraceFront, wallTraceLeft, wallTraceRight]);
        }
    }

    bounceOffWall(tracers) { 
        // needs refactor to take hits from 2 sources at the same time 
        // (when colliding with the wall on the side, the forward trace will lose priority 
        // and you can slip through the wall)
        let hitNormalTotal = new Vector3();
        let hitPoints = [new Vector3()];
        for (let i=0; i<tracers.length; i++) {
            for (let j=0; j<tracers[i].hits.length; j++) {
                let normal = tracers[i].hits[j].face.normal.clone();
                hitNormalTotal.add(normal);
                hitPoints.push(tracers[i].hits[j].point.clone());
            }
        }

        let furthestHitPoint = hitPoints[0]
        for (let i=0; i<hitPoints.length; i++) {
            if (furthestHitPoint.lengthSq() < hitPoints[i].lengthSq()) {
                furthestHitPoint = hitPoints[i].clone();
            }
        }

        this.linearVelocity.projectOnPlane(hitNormalTotal.clone().normalize());

        let hitDist = this.position.clone().sub(furthestHitPoint).length();
        let hitOffset = furthestHitPoint.clone().sub(this.position)
        let hitDepth = hitOffset.length() > this.raycasterWallL.far ? this.raycasterWallF.far : this.raycasterWallL.far;
        hitOffset = furthestHitPoint.clone().sub(this.position).multiplyScalar(hitDist - hitDepth);

        this.position.add(hitOffset);
        this.speed = this.speed * 0.95;
    }
}

// module.exports = Vehicle;