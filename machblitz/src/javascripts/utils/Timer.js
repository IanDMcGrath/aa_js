class Timer {
  constructor(callback, delay) {
    this.callback = callback
    this.startTime = new Date().getTime();
    this.remaining = delay;
    this.timerId = setTimeout(this.callback, delay);

    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.clear = this.clear.bind(this);
  };

  pause() {
    clearTimeout(this.timerId);
    let currentTime = new Date().getTime();
    this.remaining -= (currentTime - this.startTime);
    // console.log(`paused with ${this.remaining} ms remaining...`);
  };

  resume() {
    this.startTime = new Date().getTime();
    this.timerId = setTimeout(this.callback, this.remaining);
  };

  clear() {
    clearTimeout(this.timerId);
  }
};

// const callback = () => {console.log('timer over!')};

// const t = new Timer(callback, 10000);

export default Timer;