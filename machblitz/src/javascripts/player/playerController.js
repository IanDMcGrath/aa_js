import { shallowCompare } from '../utils/utils';

class PlayerController {
  constructor() {
    this.handleOrientation = this.handleOrientation.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleInputDown = (e) => this.handleInput(e, true);
    this.handleInputUp = (e) => this.handleInput(e, false);
    this.handleTouch = this.handleTouch.bind(this);
    this.bindControls = this.bindControls.bind(this);
    this.hasControl = false;
    this.handleTouchStart = (e) => this.handleTouch(e, true);
    this.handleTouchEnd = (e) => this.handleTouch(e, false);
    this.pawn = undefined;
    this.gameState = undefined;

    this.inputs = {
      roll: 0,
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    }

    this.isMobile = Boolean(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    if (this.isMobile) window.addEventListener("deviceorientation", this.handleOrientation, true);

    this.touchList = {};

    this.debug = [];

    // this.bindControls();
  }

  bindControls() {
    this.hasControl = true;
    if (this.isMobile) {

      const viewport = document.getElementById('game-viewport');
      viewport.addEventListener("touchstart", this.handleTouchStart, false);
      viewport.addEventListener("touchend", this.handleTouchEnd, false);

    } else {

      window.addEventListener("keydown", this.handleInputDown);
      window.addEventListener("keyup", this.handleInputUp);

    }
  }

  unbindControls() {
    this.hasControl = false;
    const viewport = document.getElementById('game-viewport');
    viewport.removeEventListener("touchstart", this.handleTouchStart);
    viewport.removeEventListener("touchend", this.handleTouchEnd);
    window.removeEventListener("keydown", this.handleInputDown);
    window.removeEventListener("keyup", this.handleInputUp);
    this.pawn.inputRoll(0);
  }

  handleTouch(e, down) {
    // feature detect
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', this.handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      // handle regular non iOS 13+ devices
      this.inputTouch(e, down);
    }
  }

  inputTouch(e, down) {

    if (this.gameState.isPaused) {return;}

    if (!e.target.classList.contains('button')) {
      e.preventDefault();
    } else {return;}

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
    e.preventDefault();
    let { inputs: { forward, backward, left, right, brake } } = this;
    // console.log(e.code);
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
    if (!this.hasControl) return;
    const { beta, gamma } = e;
    let roll = 0;
    if (gamma < 0) {
      roll = beta;
    } else {
      roll = (beta > 0 ? beta - 180 : beta + 180) * -1;
    }

    // console.log(roll);

    this.inputs.roll = roll;
    this.pawn.inputRoll(roll);
  }
}

export default PlayerController;