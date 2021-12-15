class PlayerController {
  constructor() {
    this.handleOrientation = this.handleOrientation.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.pawn = undefined;

    this.inputs = {
      roll: 0,
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    }

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
    e.preventDefault();
    e.stopPropagation();
    let width = screen.width;

    let strings = [width, `${e.touches}`];

    this.debug = strings;

  }

  handleInput(e, down) {
    // e.preventDefault();
    e.stopPropagation();
    let { inputs: { forward, backward, left, right, brake } } = this;
    console.log(e.code);
    switch (e.code) {
      case "KeyW": case "ArrowUp":
        forward = down;
        this.pawn.inputForward(forward);
        break;
      case "KeyS": case "ArrowDown":
        backward = down;
        this.pawn.inputBackward(backward);
        break;
      case "KeyA": case "ArrowLeft":
        left = down;
        this.pawn.inputLeft(left);
        break;
      case "KeyD": case "ArrowRight":
        right = down;
        this.pawn.inputRight(right);
        break;
      case "Space":
        brake = down;
        this.pawn.inputBrake(brake);
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