class lineTracer {
  constructor({scene, location, direction, length, duration}) {
    this.destroySelf = this.destroySelf.bind(this);
    this.drawLine = this.drawLine.bind(this);
    this.scene = scene;
    this.location = location;
    this.direction = direction;
    this.length = length;
    setTimeout(this.destroySelf, duration);
  };

  drawLine() {
    this.lineTrace = null;
  };

  destroySelf() {
    this.scene.remove(this.lineTrace);
  };
};

export default lineTracer;