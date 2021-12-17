import { Vector3, Quaternion, Euler, Raycaster, ArrowHelper, LineCurve, Vector2, SplineCurve } from 'three';
// import { playerSpeed } from './javascripts/UI';
const Util = require('../utils/utils');
const Quat = Quaternion; // because it's easier to type and read


export class Vehicle {
  constructor(obj, isPlayer=false) {
    this.handleInput = this.handleInput.bind(this);
    this.keyup = (e) => this.handleInput(e, false);
    this.keydown = (e) => this.handleInput(e, true);
    this.unbindControls = this.unbindControls.bind(this);
    this.wallUnbounce = this.wallUnbounce.bind(this);
    this.boost = this.boost.bind(this);
    this.effectThrottleLoop = this.effectThrottleLoop.bind(this);
    this.effectThrottleUp = this.effectThrottleUp.bind(this);
    this.effectThrottleDown = this.effectThrottleDown.bind(this);
    this.lean = this.lean.bind(this);

    this.prevNormalTotal = new Vector3(0,1,0);
    this.scale = [1,1,1];
    this.position = new Vector3(0,5,0);
    this.rotation = new Quat();
    this.throttle = 0;
    this.steer = 0;
    this.speed = 0;
    this.linearVelocity = new Vector3(); //[0.1,0,0]; // x, y, z : right, up, forward
    this.rotationalVelocity = new Quat();
    this.obj = obj;
    this.isPlayer = isPlayer;
    this.forwardDir = new Vector3(0,0,1);
    this.upDir = new Vector3(0,1,0);
    this.rightDir = new Vector3(1,0,0);
    this.camOffset = new Vector3(0,5,-5);
    this.cam = undefined;
    this.buildCollisions();
    this.road = undefined;
    this.walls = undefined;
    this.isFalling = false;
    this.gravityDir = new Vector3(0,-1,0);
    this.gravityTotal = new Vector3(0,0,0);
    this.trueVelocity = new Vector3(0,0,0);
    this.secondPos = new Vector3();
    this.currentTurn = 0;
    this.surface = "road";
    this.resetPos = {pos: new Vector3(), rot: new Quaternion(0,1,0)};
    this.jumping = false;
    this.wallBounced = 1;
    this.startIntervals();
    this.speedCurve = new SplineCurve([
      new Vector2(0, 0),
      new Vector2(0.1, 0.4),
      new Vector2(0.5, 0.5),
      new Vector2(0.9, 0.6),
      new Vector2(1, 1)
    ]);
    this.mobile = {
      roll: 0
    }
    // console.log('SPEED CURVE:');
    // console.log(this.speedCurve);
    // console.log(this.speedCurve.getPoints());

    if (isPlayer) {
      // bindControls();
      this.forwardPressed = false;
      this.backwardPressed = false;
      this.leftPressed = false;
      this.rightPressed = false;
      this.brakePressed = false;
    }
  }

  restart() {
    this.prevNormalTotal = new Vector3(0, 1, 0);
    this.scale = [1, 1, 1];
    this.position = new Vector3(0, 5, 0);
    this.rotation = new Quat();
    this.throttle = 0;
    this.steer = 0;
    this.speed = 0;
    this.linearVelocity = new Vector3(); //[0.1,0,0]; // x, y, z : right, up, forward
    this.rotationalVelocity = new Quat();
    this.forwardDir = new Vector3(0, 0, 1);
    this.upDir = new Vector3(0, 1, 0);
    this.rightDir = new Vector3(1, 0, 0);
    this.camOffset = new Vector3(0, 5, -6);
    this.isFalling = false;
    this.gravityDir = new Vector3(0, -1, 0);
    this.gravityTotal = new Vector3(0, 0, 0);
    this.trueVelocity = new Vector3(0, 0, 0);
    this.secondPos = new Vector3();
    this.currentTurn = 0;
    this.surface = "road";
    this.resetPos = { pos: new Vector3(), rot: new Quaternion(0, 1, 0) };
    this.jumping = false;
    this.wallBounced = 1;

    this.unbindControls();
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


  move(deltaTime) {
    // console.log(deltaTime);
    this.calcDirections();
    this.accelerate(deltaTime);
    this.addTurn(deltaTime);
    // this.lean(deltaTime);
    if (this.isFalling) {
      this.gravity(deltaTime);
    } else {
      this.momentum();
    }
    // this.collision(deltaTime);
    if (this.walls) this.collideWall(deltaTime);
    this.position.add(this.linearVelocity.clone());
    if (this.road) this.collideRoad(deltaTime);

    this.rotation.multiply(this.rotationalVelocity);
    this.rotation.normalize();

    // console.log(this.linearVelocity.length());


    // update the mesh to match the class transform;
    this.obj.scene.position.set(...this.position.toArray());
    // this.obj.scene.rotation.setFromQuaternion(this.rotation.clone());
    this.obj.scene.rotation.setFromQuaternion(new Quat().setFromEuler(this.obj.scene.rotation).rotateTowards(this.rotation.clone().multiply(new Quat(0,0,this.steer * -0.2).normalize()), 5 * deltaTime));
    if (this.throttle > 0) {
      this.jets.objs.forEach(jet => {
        jet.scale.set(1,1, (1 + 0.5 * (1 - 2 * Math.random())) * (this.brakePressed ? 0.2 : 1));
      });
    }
    // if (this.isPlayer) {this.updatePlayerInterface();}
  }

  // updatePlayerInterface() {
  //   playerSpeed.speed = this.speed;
  // }

  gravity(deltaTime) {
    // this.gravityTotal.add(this.gravityDir.clone());
    this.gravityTotal.add(this.gravityDir.clone().multiplyScalar(deltaTime));
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

  lean(deltaTime) {
    // if (this.steer > 0) {
      this.obj.scene.rotation.setFromQuaternion((new Quaternion().setFromEuler(this.obj.scene.rotation)).multiply(new Quaternion(0,0,this.steer * -deltaTime * 5)));
    // } else if (this.steer < 0) {

    // }
  }

  boost() {
    this.isBoosting = true;
    this.throttle = 0.04;
    if (!this.timers) this.timers = {};
    clearTimeout(this.timers.endBoost);
    this.timers.endBoost = setTimeout(() => {
      this.isBoosting = false;
      if (this.forwardPressed) {
        this.throttle = 0.02;
      } else {
        this.throttle = Math.min(this.throttle, 0);
      }
    }, 1000);
  }

  accelerate(deltaTime) {
    this.speed = this.speed + (this.throttle * (this.leftPressed || this.rightPressed ? 0.85 : 1));
    // speed = (this.speed + this.throttle);
    this.speed = (this.surface === "dirt" ? this.speed * 0.97 : this.speed) * (this.leftPressed || this.rightPressed ? 0.99 : 1);
    if (this.brakePressed) {
      this.speed = Math.max(this.speed - (1 * deltaTime), 0);
    }
    // this.speed = this.speed / (1 / deltaTime);
    if (this.throttle === 0) {
      this.speed = this.speed * 0.995;
    } else if (this.throttle < 0) {
      this.speed = this.speed * 0.97;
    }

    this.speed = Math.min(this.speed, 3.55);
    // this.linearVelocity.set(...(this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed)).toArray()));
    // let trueSpeed = Math.min(this.speed, 1);
    // if (this.speed > this.isBoosting ? 2 : 1) {
    //   trueSpeed += Math.log2(this.speed);
    // }

    // this.speed = Math.min(1, this.speed);
    // console.log(trueSpeed);
    this.linearVelocity.lerp((this.gravityTotal.clone().add(this.forwardDir.clone().multiplyScalar(this.speed)).multiplyScalar(deltaTime * 100)), this.traction());
    // this.linearVelocity.lerp(new Vector3, 1)
    // console.log(this.linearVelocity)
    // console.log(this.linearVelocity)
  }

  traction() {
    let traction = 0.1;
    traction = traction * this.wallBounced;
    if (this.brakePressed) {traction = Math.min(traction, 0.025);}
    return traction;
  }

  wallDidBounce() {
    clearTimeout(this.tohWallUnbounce);
    // console.log("bounced!");
    this.wallBounced = 0.01;
    this.tohWallUnbounce = setTimeout(this.wallUnbounce, 100);
  }

  wallUnbounce() {
    // console.log("stopped bounce");
    // console.log(this);
    // console.log(this.wallBounced);
    this.wallBounced = Math.min(this.wallBounced * 2, 1);
    if (this.wallBounced < 1) {
      setTimeout(this.wallUnbounce, 100);
    }
  }

  addTurn(deltaTime) {
    // this.currentTurn = (this.leftPressed ? 1 : this.rightPressed ? -1 : 0);
    this.currentTurn = this.steer;
    if (this.brakePressed) {this.currentTurn = this.currentTurn * 2;}
    this.rotationalVelocity.y = this.currentTurn * deltaTime;
  }

  // // // --->> HANDLE INPUTS <<--- // // //
  bindControls() {
    console.log('binding keys');
    // const that = this;

    // this.keydown = (event) => {that.handleInput(event, true);}; // remove event listener proof for darrick #1
    // this.keyup = (event) => {that.handleInput(event, false);};

    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
  }

  unbindControls() {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
  }

  handleInput(e, down) {
    e.preventDefault();
    e.stopPropagation();

    // console.log(event.key)
    switch(e.code) {
      case "KeyW": case "ArrowUp":
        this.inputForward(down);
        break;
      case "KeyS": case "ArrowDown":
        this.inputBackward(down);
        break;
      case "KeyA": case "ArrowLeft":
        this.leftPressed = down;
        // console.log(down ? 'LeftPressed' : 'LeftReleased');
        this.inputLeft(down);
        break;
      case "KeyD": case "ArrowRight":
        this.rightPressed = down;
        // console.log(down ? 'RightPressed' : 'RightReleased');
        this.inputRight(down);
        break;
      case "KeyR":
        if (down) this.resetPosition();
        break;
      case "Space":
        this.inputBrake(down);
        // this.boost();
        break;
      default: return;
    }
  }

  handleOrientation(e) {
    // const { absolute, alpha, beta, gamma } = e;
    const { beta, gamma } = e;
    let roll = 0;
    if (gamma < 0) {
      roll = beta;
    } else {
      roll = (beta > 0 ? beta - 180: beta + 180) * -1;
    }
    this.mobile.roll = roll;
    // console.log(alpha);
    // console.log(e);
    // pitch yaw roll // gab
    // gamma = pitch
    // alpha = yaw
    // beta = roll
  }

  jump(pressed) { // not used, replaced with inputBrake
    // console.log("jump!");
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

  inputBrake(pressed) {
    this.brakePressed = pressed;
  }

  jumpStop() {
    this.jumping = false;
  }

  startIntervals() {
    const that = this;

    this.intNewResetPos = () => {that.newResetPos();};
    this.intRespawn = () => {that.respawn();};

    setInterval(this.intNewResetPos, 2000);
    setInterval(this.intRespawn, 1000);
  }

  // --->> lazy checkpoint system <<---
  respawn() {
    if (this.position.y < -10) {
      if (this.resetPosition.y < 0){
        this.position = new Vector3(0,5,0);
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

  inputForward(pressed) {
    // window.removeEventListener("keydown", this.keydown); // remove event listener proof for darrick #2
    if (pressed && !this.forwardPressed ) {
      this.effectThrottleUp();
    }

    this.forwardPressed = pressed;
    // if (this.isBoosting) {
    //   this.throttle = 0.04;
    //   return;
    // }
    if (pressed) {
      this.throttle = 0.02;
    } else {
      this.backwardPressed ? this.inputBackward(true) : this.throttle = 0;
      this.effectThrottleDown();
    }
  }

  effectThrottleDown() {
    if (!this.effects) {
      this.effects = {};
      return;
    }
    clearTimeout(this.effects.throttleLoop);
    this.jets.objs.forEach(obj => {
      obj.scale.set(0,0,0);
    });
    this.jets.anims1.forEach(anim => {
      anim.stop();
    });
    this.jets.anims2.forEach(anim => {
      anim.stop();
    });
    // console.log(this.jets);
    this.jetLight.intensity = 0;
  };
  effectThrottleUp() {
    if (!this.effects) this.effects = {};
    this.effects.throttleLoop = setTimeout(this.effectThrottleLoop, 333);
    // if (!this.jets || !this.jets.objs) return;
    this.jets.objs.forEach(obj => {
      obj.scale.set(0.5,0.5,1);
    });
    this.jets.anims2.forEach(anim => {
      anim.play();
    });
  };
  effectThrottleLoop() {
    // console.log('throttle looping!!!!');
    this.jets.anims1.forEach(anim => {
      anim.play();
    });
    this.jets.anims2.forEach(anim => {
      anim.stop();
    });
    this.jets.objs.forEach(obj => {
      obj.scale.set(1, 1, 1);
    });
    this.jetLight.intensity = 2;
  };

  inputBackward(pressed) {
    this.backwardPressed = pressed;
    if (pressed) {
      this.throttle = -0.01;
    } else {
      this.forwardPressed ? this.inputForward(true) : this.throttle = 0;
    }
  }

  inputRoll(roll) {
    let rollScaled = Math.max(-1, Math.min(1, roll * 0.05));
    this.steer = -rollScaled;
  }

  inputLeft(pressed) {
    // this.leftPressed = pressed;
    this.steer = pressed ? 1 : 0;
    if (!pressed) {
      if (this.rightPressed) {
        this.inputRight(true);
      }
    }
  }

  inputRight(pressed) {
    // this.rightPressed = pressed;
    this.steer = pressed ? -1 : 0;
    if (!pressed) {
      if (this.leftPressed) {
        this.inputLeft(true);
      }
      // this.inputLeft(this.leftPressed);
    }
  }

  buildCollisions() {
    this.obj.scene.layers.set(2);
    this.raycasterFloorC = new Raycaster(this.position.clone().add(this.upDir.clone().multiplyScalar(5)), this.upDir.clone().negate(), 0, 10);
    this.raycasterFloorVel = new Raycaster(this.position.clone(), this.upDir.clone().negate(), 0, 5);
    this.raycasterWallVel = new Raycaster(this.position.clone(), this.forwardDir.clone(), 0, 1);
    this.raycasterWallL = new Raycaster(this.position.clone(), this.rightDir.clone().negate(), 0, 2);
    this.raycasterWallR = new Raycaster(this.position.clone(), this.rightDir.clone(), 0, 2);
  }

  collision(deltaTime) {
    if (this.road) this.collideRoad(deltaTime);
    if (this.walls) this.collideWall(deltaTime);
  }

  collideRoad(deltaTime) {
    let upOffset = this.position.clone().add(this.upDir.clone().multiplyScalar(5));
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
      this.moveToRoad(intersectsC[0], deltaTime);
      this.falling(false);
    // } else if (intersectsVel.length > 0) {
    //   console.log(intersectsVel[0]);
    //   this.moveToRoadVel(intersectsVel[0]);
    //   this.falling(false);
    } else {
      this.falling(true);
      this.setSurface(); // set surface to undefined (this.surface will be "none")
    }
  }

  setSurface(floor){
    // this.surface =
    if (!floor) {
      this.surface = "none";
      return;
    }
    if (floor.name.slice(0,4) === "dirt") {
      this.surface = "dirt";
    } else if (floor.name.slice(0,4) === "road") {
      this.surface = "road";
    } else {
      this.surface = "none";
    }
  }

  moveToRoad(intersect, deltaTime) {
    this.position = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(1));
    this.setSurface(intersect.object);

    this.orientToRoad(intersect, deltaTime);
  }

  moveToRoadVel(intersect, deltaTime) {
    // console.log('moveToRoadVel');
    let hitPoint = intersect.point;

    this.position = hitPoint.clone().add(intersect.face.normal.clone().multiplyScalar( 1 ));
    this.linearVelocity.projectOnPlane(intersect.face.normal);

    this.orientToRoad(intersect, deltaTime);
  }

  orientToRoad(intersect, deltaTime) {
    // --->> the simple, snappy solution <<---
    // console.log(intersect)
    let localHitNormal = intersect.face.normal.clone();
    let quat = new Quat().setFromUnitVectors(this.upDir.clone(), localHitNormal);
    let newQuat = this.rotation.clone().premultiply(quat);
    this.rotation.slerp(newQuat, deltaTime * 10);

    this.gravityDir = intersect.face.normal.clone().negate();
  }

  collideWall(deltaTime) {
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
      this.wallVelCollide(wallTraceCenter, deltaTime);
    } else if (wallTraceLeft.hits.length > 0 || wallTraceRight.hits.length > 0 ) {
      this.wallSideCollide( [wallTraceLeft, wallTraceRight], deltaTime);
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

  getFirstHitPoint(hitPoints) {
    if (hitPoints.length < 1) return this.position.clone();
    let firstHitPoint = hitPoints[0];
    hitPoints.forEach(point => {
      if (firstHitPoint.lengthSq() < point.lengthSq()) {
        firstHitPoint = point.clone();
      }
    });
    return firstHitPoint;
  }

  wallVelCollide(trace, deltaTime) {
    let hits = this.getHits([trace]);
    let hitNormal = hits.normal.normalize();
    let hitpoints = hits.points;

    let point = this.getFirstHitPoint(hitpoints);
    let offset = this.position.clone().sub(point);

    let dist = (this.raycasterWallVel.far - offset.length());

    this.position.add(offset.clampLength(0, dist));
    this.speed = this.speed * ((this.moveDir.dot(hitNormal) + 1) * 0.9);
    this.position.add(this.linearVelocity.reflect(hitNormal.normalize()).multiplyScalar((this.moveDir.dot(hitNormal) + 2) * 0.33));

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

