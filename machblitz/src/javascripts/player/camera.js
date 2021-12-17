import * as Util from '../utils/utils';
import {Vector3, Quaternion} from 'three'
import Timer from '../utils/Timer';
const Quat = Quaternion;

export class PlayCam{
  constructor(camObj, vectorObj){
    this.obj = camObj;
    this.player = undefined;
    this.gameState = undefined;
    this.flycams = {};
  }

  move(deltaTime) {
    // this.obj.lookAt(this.player.position)
    // console.log(this.gameState.gameStarted);
    if (this.gameState.gameStarted) {
      this.offsetCam();
      this.clampDist();
      this.lookAt(deltaTime);
      // this.rotToSurface();
    } else {
      // console.log(this.flycams.flycamStart.position);
      this.obj.position.copy(this.flycams.flycamStart.obj.children[0].position);
      this.obj.rotation.copy(this.flycams.flycamStart.obj.children[0].rotation);
    }
  }



  clampDist() {
    // get distance by cam position minus player position
    let offset = this.player.camOffset.clone().applyQuaternion(this.player.rotation).add(this.player.obj.scene.position).clone().sub(this.obj.position);
    let dist = offset.length();
    this.obj.position.add(new Vector3(0,0.1,0));     ////////// replace this
    // if distance greater than 10, get direction multiply by remaining distance, add to cam position
    if (dist > 10) {
      offset.clampLength(0, dist - 10);
      this.obj.position.add(offset);
    }
  }

  offsetCam() {
    let offset = this.player.camOffset.clone().applyEuler(this.player.obj.scene.rotation);
    let targetPos = this.player.position.clone().add(offset);
    targetPos.lerpVectors(targetPos, this.obj.position, 0.95);

    // let offsetDir = this.player.position.clone().sub(this.player.camOffset);
    // targetPos.projectOnVector(offsetDir.normalize());

    this.obj.position.set(...targetPos.toArray());
  }

  lookAt(deltaTime) {      // coders beware, jank code be here
    // let firstRot = new Quat();
    // let secondRot = new Quat();
    // firstRot.setFromEuler(this.obj.rotation);
    // this.obj.lookAt(this.player.position.clone().add(this.player.forwardDir.clone().multiplyScalar(10)));
    // secondRot.setFromEuler(this.obj.rotation);
    // firstRot.slerp(secondRot, 0.2);
    // this.obj.rotation.setFromQuaternion(firstRot);


    // let lookatQuat = new Quat().setFromUnitVectors(this.obj.position.clone().sub(this.player.position));
    // upDir.sub(this.player.upDir);
    // lookatQuat.multiply(upDir);
    // lookatQuat.normalize();
    // this.obj.rotation.setFromQuaternion(lookatQuat);
    // this.obj.rotation.setFromQuaternion(new Quat().setFromUnitVectors(this.obj.position.clone().sub(this.player.position), this.player.gravityDir.clone()));

    let newQuat = new Quat().setFromEuler(this.obj.rotation);
    let currentQuat = newQuat.clone();
    let upDir = new Vector3(0, 1, 0).applyQuaternion(newQuat);
    newQuat.premultiply(new Quat().setFromUnitVectors(upDir, this.player.upDir));
    let forwardDir = new Vector3(0, 0, -1).applyQuaternion(newQuat);
    let targetPos = this.player.position.clone().add(this.player.forwardDir.clone().multiplyScalar(10));
    newQuat.premultiply(new Quat().setFromUnitVectors(forwardDir, targetPos.sub(this.obj.position).normalize()));
    newQuat.multiply(new Quat(0, 0, this.gameState.playerController.inputs.roll * -0.008726 ));
    newQuat.normalize();
    this.obj.rotation.setFromQuaternion(currentQuat.slerp(newQuat, deltaTime * 10));

    // console.log(this.gameState.playerController.inputs.roll);
  }

  rotToSurface() {
    let quat = new Quat();
    quat.setFromUnitVectors(new Vector3(0,1,0).applyQuaternion(new Quat().setFromEuler(this.obj.rotation)), this.player.gravityDir.clone().negate());
    this.obj.rotation.setFromQuaternion((new Quat().setFromEuler(this.obj.rotation)).premultiply(quat));
    // this.obj.rotation.setFromQuaternion(new Quat().setFromUnitVectors(new Vector3().applyEuler(this.obj.rotation),this.player.graviyDir));
    // console.log(this.obj.rotation);
    // console.log(this.player.gravityDir);
  };

  resetPosition() {
    // this.player.rotation.set(1,0,0,0);
    // console.log(this.player.obj.scene.rotation);
    // this.obj.lookAt(this.player.position.clone().add(this.player.forwardDir.clone().multiplyScalar(10)));
    let offset = this.player.camOffset.clone().applyEuler(this.player.obj.scene.rotation);
    this.position = this.player.position.clone().add(offset);
    // this.obj.rotation.setFromQuaternion(new Quaternion(0, 1, 0));
  }

  cancelFade() {
    clearInterval(this.flycams.fadeTimer);
    this.flycams.fadeTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    })
    // cleartTimeout(this.flycams.fadeTimeout);
  }

  flycamFadeAnim() {
    this.flycams.flycamStart.anim.stop();
    this.flycams.flycamStart.anim.play();
    this.flycams.fader = document.getElementById('fader');
    let timeout1 = setTimeout(() => {
      this.flycams.fader.classList.add('fade-to-black');
      // console.log(this.flycams.fader);
      setTimeout(() => {
        this.flycams.fader.classList.remove('fade-to-black');
        // console.log(this.flycams.fader);
      }, 1000);
    }, 4000);

    let timeout2 = setTimeout(() => {
      this.flycams.fadeTimer = setInterval(() => {
        this.flycams.fader.classList.add('fade-to-black');
        // console.log(this.flycams.fader)
        setTimeout(() => {
          this.flycams.fader.classList.remove('fade-to-black');
          // console.log(this.flycams.fader)

        }, 1000);
      }, 5000);
    }, 4000)
    this.flycams.firstFade = true;

    this.flycams.fadeTimeouts = [timeout1, timeout2];
  }
}

