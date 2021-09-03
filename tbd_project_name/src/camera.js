const Util = require('./utils');


class PlayCam{
    constructor(camObj, lookatVector){
        this.obj = camObj;
        this.position = [0,0,0];
        // this.rotation = [0,0,0];
        this.lookatTarget = lookatVector;
    }

    lookAt(positionVector) {
        this.lookatTarget = positionVector;
        this.obj.lookAt(positionVector);
    }
}

module.exports = PlayCam;