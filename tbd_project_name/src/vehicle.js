const Util = require('./utils');

class Vehicle {
    constructor(obj) {
        this.scale = [1,1,1];
        this.position = [0,0,0];
        this.rotation = [0,0,0];
        this.throttle = 0;
        this.linearVelocity = [0.1,0,0]; // x, y, z : right, up, forward
        this.rotationalVelocity = [0,0,0];
        this.obj = obj;
    }


    move() {
        // get user input
        // set throttle
        // set velocity
        // set position
        this.position = Util.vectorAdd([this.linearVelocity,this.position]);
        this.obj.scene.position.set(...this.position);
        // console.log(this.position)
        // set rotation
        let newRot  = Util.vectorAdd([this.rotation, this.rotationalVelocity]);
        // console.log(newRot)
        this.rotation = [Util.wrapAngle(newRot[0]),Util.wrapAngle(newRot[1]),Util.wrapAngle(newRot[2])]
        this.obj.scene.rotation.set(...this.rotation)
    }

    render() {

    }


}

module.exports = Vehicle;