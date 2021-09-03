const {vectorAdd} = require('./utils');

class Vehicle {
    constructor(obj) {
        this.scale = 0;
        this.loc = [0,0,0];
        this.rotation = [0,0,0];
        this.throttle = 0;
        this.velocity = [100,0,0];
        this.obj = obj;
        // console.log(obj);
        console.log(this.obj.position())
    }

    get location() {
        return this.loc;
    }

    set location(vector) {
        this.loc = vector;
    }

    move() {
        // get user input
        // set throttle
        // set velocity
        // set position
        this.location = vectorAdd([this.velocity,this.location]);
        
        // set rotation
        // console.log(this.location);
    }

    render() {

    }


}

module.exports = Vehicle;