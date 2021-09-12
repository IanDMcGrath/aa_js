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
        this.jumping = false;
        this.wallBounced = 1;
        this.startIntervals();

        if (isPlayer) {
            // bindControls();
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
        this.moveDir = this.linearVelocity.clone().normalize();
    }
    
    
    move() {
        this.calcDirections();
        this.accelerate();
        this.addTurn();
        if (this.isFalling) {
            this.gravity();
        } else {
            this.momentum();
        }
        this.collision();
        this.position.add(this.linearVelocity);
        this.rotation.multiply(this.rotationalVelocity);
        this.rotation.normalize();
        
        
        
        
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
             this.speed = this.speed * 0.995;
            } else if (this.throttle < 0) {
               this.speed = this.speed * 0.97;
            }
        // this.linearVelocity.set(...(this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed)).toArray()));
        this.linearVelocity.lerp((this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed))), this.traction());
        // this.linearVelocity.lerp(new Vector3, 1)
        // console.log(this.linearVelocity)
        // console.log(this.linearVelocity)
    }

    traction() {
        let traction = 1;
        traction = traction * this.wallBounced;
        return traction;
    }

    wallDidBounce() {
        clearTimeout(this.tohWallUnbounce);
        // console.log("bounced!");
        this.wallBounced = 0.01;
        this.tohWallUnbounce = setTimeout(this.wallUnbounce.bind(this), 100);
    }

    wallUnbounce() {
        // console.log("stopped bounce");
        // console.log(this);
        // console.log(this.wallBounced);
        this.wallBounced = Math.min(this.wallBounced * 1.5, 1);
        if (this.wallBounced < 1) {
            setTimeout(this.wallUnbounce.bind(this), 100);
        }
    }

    addTurn() {
        let maxTurn = 0.03;
        let currentTurn = this.rotationalVelocity.y;
        currentTurn = currentTurn + (this.leftPressed ? 0.003 : this.rightPressed ? -0.003 : currentTurn * -0.2);
        currentTurn = Util.clampFRange(currentTurn, -maxTurn, maxTurn);
        this.rotationalVelocity.y = currentTurn;
    }

    render() {

    }

    // // --->> HANDLE INPUTS <<---
    bindControls() {
        console.log('binding keys');
        const that = this;

        this.keydown = (event) => {that.handleInput(event, true)}; // remove event listener proof for darrick #1
        this.keyup = (event) => {that.handleInput(event, false)};

        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup",this.keyup);
    }

    handleInput(event, down) {
        // console.log(event.key)
        switch(event.key) {
            case "w": case "ArrowUp":
                this.playerForward(down);
                break;
            case "s": case "ArrowDown":
                this.playerBackward(down);
                break;
            case "a": case "ArrowLeft":
                this.playerLeft(down);
                break;
            case "d": case "ArrowRight":
                this.playerRight(down);
                break;
            case "r":
                if (down) this.resetPosition();
                break;
            case " ":
                if (down) this.jump(down);
                break;
            default:
                return;
        }
    }

    jump(pressed) {
        console.log("jump!")
            this.jumping = true;
            if (pressed) {
                if (!this.isFalling) {
                    this.momentum();
                    this.linearVelocity.add(this.upDir.clone().multiplyScalar(50));
                    this.position.add(this.upDir.clone().multiplyScalar(5));
                }
            } else {

            }
    }

    jumpStop() {
        this.jumping = false;
    }

    // --->> lazy checkpoint system <<---
    startIntervals() {
        const that = this;

        this.intNewResetPos = () => {that.newResetPos()};
        this.intRespawn = () => {that.respawn()};

        setInterval(this.intNewResetPos, 2000);
        setInterval(this.intRespawn, 1000);
    }

    respawn() {
        if (this.position.y < -10) {
            if (this.resetPosition.y < 0){
                this.position = new Vector3(0,5,0)
            } else {
                this.resetPosition();
            }
        }
    }

    resetPosition() { // in case the player gets stuck, call this by pressing 'R'
        this.linearVelocity = new Vector3();
        this.trueVelocity = new Vector3();
        this.gravityTotal = new Vector3();
        this.position = this.resetPos.pos.clone();
        this.rotation = this.resetPos.rot.clone();
        this.obj.scene.rotation.setFromQuaternion(this.rotation);
        this.obj.scene.position.set(...this.position.toArray());
        this.rotationalVelocity = new Quat();
        this.speed = 0;
        this.cam.resetPosition();
        this.isFalling = false;
        // console.log(reset position to:);
        // console.log(this.position);
    }

    newResetPos() {
        if (this.surface === "road") {
            this.resetPos.pos = this.position.clone();
            this.resetPos.rot = this.rotation.clone();
        }
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
        if (!pressed) {
            if (this.rightPressed) {this.playerRight(true)}
        }
    }

    playerRight(pressed) {
        this.rightPressed = pressed;
        if (!pressed) {
            if (this.leftPressed) {this.playerLeft(true)}
        }
    }

    buildCollisions() {
        this.obj.scene.layers.set(2);
        this.raycasterFloorC = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        this.raycasterFloorVel = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
        this.raycasterWallVel = new Raycaster(this.position.clone(), this.forwardDir.clone(), 0, 1);
        this.raycasterWallL = new Raycaster(this.position.clone(), this.rightDir.clone().negate(), 0, 2);
        this.raycasterWallR = new Raycaster(this.position.clone(), this.rightDir.clone(), 0, 2);
    }
    
    collision() {
        if (this.road) this.collideRoad();
        if (this.walls) this.collideWall();
    }
    
    collideRoad() {
        let upOffset = this.position.clone().add(this.upDir.clone().multiplyScalar(2));
        let downDir = this.upDir.clone().negate();

        this.floorTraceVel = {origin: this.position.clone().add(this.upDir.clone().multiplyScalar(-1 * this.raycasterFloorC.far)), dir: this.moveDir};
        this.raycasterFloorVel.set(this.floorTraceVel.origin, this.moveDir);

        this.floorTraceCenter = {origin: upOffset.clone(), dir: downDir.clone()};
        this.raycasterFloorC.set(this.floorTraceCenter.origin, this.floorTraceCenter.dir);

        let intersectsC = [];
        this.raycasterFloorC.intersectObjects(this.road.children, true, intersectsC);

        let intersectsVel = [];
        this.raycasterFloorVel.intersectObjects(this.road.children, true, intersectsVel);
        
       
        if (intersectsC.length > 0) {
            this.moveToRoad(intersectsC[0]);
            this.falling(false);
        } else if (intersectsVel.length > 0) {
            console.log(intersectsVel[0])
            this.moveToRoadVel(intersectsVel[0]);
            this.falling(false);
        } else {
            this.falling(true);
            this.setSurface(); // set surface to undefined (this.surface will be "none")
        }
    };

    setSurface(floor){
        // this.surface =
        if (!floor) {
            this.surface = "none";
            return;
        };
        if (floor.name.slice(0,4) === "dirt") {
            this.surface = "dirt";
        } else if (floor.name.slice(0,4) === "road") {
            this.surface = "road";
        } else {
            this.surface = "none";
        }
    }
    
    moveToRoad(intersect) {
        this.position = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(1));
        this.setSurface(intersect.object);

        this.orientToRoad(intersect);
    }

    moveToRoadVel(intersect) {
        console.log('moveToRoadVel');
        let hitPoint = intersect.point;
        
        this.position = hitPoint.clone().add(intersect.face.normal.clone().multiplyScalar( 3 ));
        this.linearVelocity.projectOnPlane(intersect.face.normal);

        this.orientToRoad(intersect);
    }
    
    orientToRoad(intersect) {
    // --->> the simple, snappy solution <<---
    let localHitNormal = intersect.face.normal.clone(); 
    let quat = new Quat().setFromUnitVectors(this.upDir.clone(), localHitNormal);
    this.rotation.premultiply(quat);

    this.gravityDir = intersect.face.normal.clone().negate();
    }

    collideWall() {
        let predictPos = this.linearVelocity.clone().normalize();
        let wallTraceCenter = { origin: this.position.clone(), dir: predictPos, hits: [] };
        let wallTraceLeft = { origin: this.position.clone(), dir: this.rightDir.clone().negate(), hits: [] };
        let wallTraceRight = { origin: this.position.clone(), dir: this.rightDir.clone(), hits: [] };

        this.raycasterWallVel.set(wallTraceCenter.origin, wallTraceCenter.dir);
        this.raycasterWallVel.far = Math.max(this.linearVelocity.length(), 3);

        this.raycasterWallL.set(wallTraceLeft.origin, wallTraceLeft.dir);
        this.raycasterWallR.set(wallTraceRight.origin, wallTraceRight.dir);

        this.raycasterWallVel.intersectObjects(this.walls.children, true, wallTraceCenter.hits);
        this.raycasterWallL.intersectObjects(this.walls.children, true, wallTraceLeft.hits);
        this.raycasterWallR.intersectObjects(this.walls.children, true, wallTraceRight.hits);

        
        if (wallTraceCenter.hits.length > 0) {
            this.wallVelCollide(wallTraceCenter);
        } else if (wallTraceLeft.hits.length > 0 || wallTraceRight.hits.length > 0 ) {
            this.wallSideCollide( [wallTraceLeft, wallTraceRight]);
        }
    }

    getHits(tracers) {
        if (tracers.length < 1) return [this.position.clone()];
        let hitPoints = [];
        let hitNormalTotal = new Vector3();
        for (let i=0; i<tracers.length; i++) {
            for (let j=0; j<tracers[i].hits.length; j++) {
                let normal = tracers[i].hits[j].face.normal.clone();
                hitNormalTotal.add(normal);
                hitPoints.push(tracers[i].hits[j].point.clone());
                break;
            }
        }
        return {points: hitPoints, normal: hitNormalTotal};
    }

    getFurthestHitPoint(hitPoints) {
        if (hitPoints.length < 1) return this.position.clone();
        let furthestHitPoint = hitPoints[0];
        for (let i=0; i<hitPoints.length; i++) {
            if (furthestHitPoint.lengthSq() < hitPoints[i].lengthSq()) {
                furthestHitPoint = hitPoints[i].clone();
            }
        }
        return furthestHitPoint;
    }

    wallVelCollide(trace) {
        let hits = this.getHits([trace]);
        let hitNormal = hits.normal;
        let hitpoints = hits.points;

        let point = this.getFurthestHitPoint(hitpoints);
        let offset = this.position.clone().sub(point);

        let dist = this.raycasterWallVel.far - offset.length();

        this.position.add(offset.clampLength(0, dist));
        this.speed = this.speed * (this.moveDir.dot(hitNormal) + 1);
        this.position.add(this.linearVelocity.reflect(hitNormal.normalize()));

        this.wallDidBounce();
    }

    wallSideCollide(sideTracers=[]) {
        let sideHits = this.getHits(sideTracers);
        let sideHitNormalTotal = sideHits.normal;
        let sideHitPoints = sideHits.points;
        
        let furthestSideHitPoint = this.getFurthestHitPoint(sideHitPoints);
        let furthestHitPoint = furthestSideHitPoint;
        let hitNormalTotal = sideHitNormalTotal;

        this.linearVelocity.projectOnPlane(hitNormalTotal.clone().normalize());

        let hitDist = this.position.clone().sub(furthestHitPoint).length();
        let hitOffset = furthestHitPoint.clone().sub(this.position);
        let hitDepth = hitOffset.length() > this.raycasterWallL.far ? this.raycasterWallF.far : this.raycasterWallL.far;
        hitOffset = furthestHitPoint.clone().sub(this.position).multiplyScalar(hitDist - hitDepth);

        this.position.add(hitOffset);
        this.speed = this.speed * 0.95;
    }
}

