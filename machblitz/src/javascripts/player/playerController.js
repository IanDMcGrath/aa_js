import { shallowCompare } from '../utils/utils';

class PlayerController {
  constructor() {
    this.handleOrientation = this.handleOrientation.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.bindControls = this.bindControls.bind(this);
    this.pawn = undefined;

    this.inputs = {
      roll: 0,
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    }

    this.touchList = {};

    this.debug = [];

    // this.bindControls();
  }

  bindControls() {
    window.addEventListener("keydown", (e) => this.handleInput(e, true));
    window.addEventListener("keyup", (e) => this.handleInput(e, false));
    window.addEventListener("deviceorientation", this.handleOrientation, true);
    window.addEventListener("touchstart", (e) => this.handleTouch(e, true), false);
    window.addEventListener("touchend", (e) => this.handleTouch(e, false), false);

  }

  handleTouch(e, down) {
    // e.preventDefault();
    let { pawn, touchList, inputs: { forward, backward, left, right, brake } } = this;
    // console.log(e);
    // console.log(touchList);
    // console.log(e);
    if (!pawn) return;
    e.stopPropagation();
    let width = Math.floor(screen.width * 0.5);

    if (down) {
      Object.values(e.changedTouches).forEach(touch => {
        if (touch.clientX > width && !forward) {
          touchList[touch.identifier] = 'right';
          this.inputs.forward = true;
          pawn.inputForward(true);
        } else if (!backward || !brake) {
          touchList[touch.identifier] = 'left';
          if (forward && !brake) {
            this.inputs.brake = true;
            pawn.inputBrake(true);
          } else if (!backward) {
            this.inputs.backward = true;
            pawn.inputBackward(true);
          }
        }
      });
    } else {
      if (touchList[e.changedTouches[0].identifier]) {
        if (touchList[e.changedTouches[0].identifier] === 'right') {
          if (forward) {
            this.inputs.forward = false;
            pawn.inputForward(false);
          }
        } else if (touchList[e.changedTouches[0].identifier] === 'left') {
          if (backward || brake) {
            this.inputs.backward = false;
            pawn.inputBackward(false);
            this.inputs.brake = false;
            pawn.inputBrake(false);
          }
        }
        delete touchList[e.changedTouches[0].identifier];
      }
    }
    // console.log(touchList);

    // let strings = [width, Object.values(e.touches)];

    // this.debug = strings;

  }


  handleInput(e, down) {
    // e.preventDefault();
    e.stopPropagation();
    let { inputs: { forward, backward, left, right, brake } } = this;
    console.log(e.code);
    switch (e.code) {
      case "KeyW": case "ArrowUp":
        this.inputs.forward = down;
        this.pawn.inputForward(down);
        break;
      case "KeyS": case "ArrowDown":
        this.inputs.backward = down;
        this.pawn.inputBackward(down);
        break;
      case "KeyA": case "ArrowLeft":
        this.inputs.left = down;
        this.pawn.leftPressed = down;
        this.pawn.inputLeft(down);
        break;
      case "KeyD": case "ArrowRight":
        this.inputs.right = down;
        this.pawn.rightPressed = down;
        this.pawn.inputRight(down);
        break;
      case "Space":
        this.inputs.brake = down;
        this.pawn.inputBrake(down);
        break;
    }
  }

  handleOrientation(e) {
    // const { absolute, alpha, beta, gamma } = e;
    const { beta, gamma } = e;
    let roll = 0;
    if (gamma < 0) {
      roll = beta;
    } else {
      roll = (beta > 0 ? beta - 180 : beta + 180) * -1;
    }
    this.inputs.mobile.roll = roll;
  }
}

export default PlayerController;