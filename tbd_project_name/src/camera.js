const Util = require('./utils');
import {Vector3, Quaternion} from 'three'
const Quat = Quaternion;

export class PlayCam{
    constructor(camObj, vectorObj){
        this.obj = camObj;
        this.player = undefined;
    }

    move() {
        // this.obj.lookAt(this.player.position)
        
        this.offsetCam();
        this.clampDist();
        this.lookAt();
    }

    clampDist() {
        // get distance by cam position minus player position
        let offset = this.player.obj.scene.position.clone().sub(this.obj.position);
        let dist = offset.length();
        this.obj.position.add(new Vector3(0,0.1,0))     ////////// replace this
        // if distance greater than 10, get direction multiply by remaining distance, add to cam position
        if (dist > 10) {
            offset.clampLength(0, dist - 10);
            this.obj.position.add(offset);
        }
    }

    offsetCam() {
        let offset = this.player.camOffset.clone().applyEuler(this.player.obj.scene.rotation);
        let targetPos = this.player.position.clone().add(offset);
        targetPos.lerpVectors(targetPos, this.obj.position, 0.9);
        this.obj.position.set(...targetPos.toArray());
    }

    lookAt() {      // coders beware, jank code be here
        let firstRot = new Quat();
        let secondRot = new Quat();
        firstRot.setFromEuler(this.obj.rotation);
        this.obj.lookAt(this.player.position.clone().add(this.player.forwardDir.clone().multiplyScalar(10)));
        secondRot.setFromEuler(this.obj.rotation);
        firstRot.slerp(secondRot, 0.2);
        this.obj.rotation.setFromQuaternion(firstRot);

    }
}

