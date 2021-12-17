import { LoopOnce, Quaternion, Vector3 } from 'three';
import Timer from '../utils/Timer.js';


export class RaceManager {
  constructor() {
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.width = 1;
    this.length = 1;
    this.rows = 1;
    this.columns = 1;
    this.racers = [];
    this.raceGates = [];
    this.racerPositions = [];
    this.lapCount = 3;
    this.timers = {};
    this.fanfare = {
      raceFont: undefined
    };
    this.elapsedTime = { mm:0, ss:0, ms:0 };
    this.currentTime = 0;
    this.timeStart = new Date().getTime();
    this.d = new Date();
    this.isRaceStarted = false;
    this.isRaceEnded = false;
    this.updateElapsedSeconds = this.updateElapsedSeconds.bind(this);
    this.updateElapsedMinutes = this.updateElapsedMinutes.bind(this);
    this.raceLineup = this.raceLineup.bind(this);
    this.raceCountdown = this.raceCountdown.bind(this);
    this.raceStart = this.raceStart.bind(this);
    this.updateElapsedMinutes = this.updateElapsedMinutes.bind(this);
    this.updateElapsedSeconds = this.updateElapsedSeconds.bind(this);
    this.updateElapsedTime = this.updateElapsedTime.bind(this);
    this.formatElapsedTime = this.formatElapsedTime.bind(this);
    this.sortRaceGates = this.sortRaceGates.bind(this);
    this.initPositions = this.initPositions.bind(this);
    this.updatePositions = this.updatePositions.bind(this);
    this.raceFinish = this.raceFinish.bind(this);
    this.raceTogglePause = this.raceTogglePause.bind(this);

    // this.racerPosition = {
      // racerId: 0,
      // gateId: 0,
      // distance: 0
    // };
  }

  raceLineup() {
    for (let i=0; i<this.racers.length; i++) {
      this.racers[i].position = this.position.clone();
      this.racers[i].rotation = this.rotation.clone();
    }

    const { animCountdown } = this.fanfare.raceFont;
    animCountdown.stop();

    if (this.timers.raceCountDown) {this.timers.raceCountDown.clear()}
    if (this.timers.raceStart) {this.timers.raceStart.clear()}

    this.isRaceStarted = false;
  }

  raceCountdown() {
    this.timers.raceCountDown = null;
    this.timers.raceStart = new Timer(this.raceStart, 3000);

    this.racers[0].cam.obj.attach(this.fanfare.raceFont.obj.scene);
    this.fanfare.raceFont.obj.scene.position.set(0,1,-5);

    const { animCountdown } = this.fanfare.raceFont;
    animCountdown.stop();
    animCountdown.setLoop( LoopOnce );
    animCountdown.play();
    this.initPositions();
  }

  raceDelayStart() {
    this.timers.raceCountDown = new Timer(this.raceCountdown, 3000);
  }

  raceTogglePause(isPausing) {
    if (this.isRaceStarted) return;
    const { raceCountDown, raceStart} = this.timers;
    if (isPausing) {
      if (raceCountDown) {
        raceCountDown.pause();
      } else if (raceStart) {
        raceStart.pause();
      }
    } else {
      if (raceCountDown) {
        raceCountDown.resume();
      } else if (raceStart) {
        this.timers.raceStart.resume();
      }
    }
  }

  raceStart() {
    this.timers.raceStart = null;

    this.isRaceStarted = true;
    // this.racers[0].bindControls();
    this.gameState.playerController.bindControls();
    this.timeStart = new Date().getTime();
    this.currentTime = 0;
    this.isRaceEnded = false;
    this.times = {
      lap1: 'DNF',
      lap2: 'DNF',
      lap3: 'DNF',
      total: 'DNF',
    }
    // const timerSeconds = setInterval(this.updateElapsedSeconds, 1000);
    // const timerMinutes = setInterval(this.updateElapsedMinutes, 60000);
    // this.clearTimers = () => {
    //   // not working
    //   clearInterval(timerSeconds);
    //   clearInterval(timerMinutes);
    // }
  }

  updateElapsedSeconds() {
    this.elapsedTime.ss = Math.floor(this.currentTime * 0.001) % 60;
  }

  updateElapsedMinutes() {
    this.elapsedTime.mm = Math.floor(this.currentTime * 0.000016666666667);
  }

  updateElapsedTime(deltaTime) {
    if (!this.isRaceStarted) { return '00:00:000' }
    if (this.isRaceEnded) { return this.formatElapsedTime() }

    // this.currentTime = new Date().getTime() - this.timeStart;
    // this.elapsedTime.ms = this.currentTime % 1000;

    const { elapsedTime } = this;
    this.currentTime += (deltaTime * 1000); // convert seconds to milliseconds
    this.elapsedTime.ms = Math.round(this.currentTime % 1000);
    this.updateElapsedSeconds();
    this.updateElapsedMinutes();

    return this.formatElapsedTime();
  }

  formatElapsedTime() {
    let { mm, ss, ms } = this.elapsedTime;
    if (ms < 10) { ms = `00${ms}` } else if (ms < 100) { ms = `0${ms}` }
    if (ss < 10) { ss = `0${ss}` }
    if (mm < 10) { mm = `0${mm}` }

    return `${mm}:${ss}:${ms}`;
  }

  formatTime(time) {
    let ms = Math.floor(time % 1000);
    let ss = Math.floor(time * 0.001 % 60);
    let mm = Math.floor(time * 0.0000166667);

    if (ms < 10) { ms = `00${ms}` } else if (ms < 100) { ms = `0${ms}` }
    if (ss < 10) { ss = `0${ss}` }
    if (mm < 10) { mm = `0${mm}` }

    return `${mm}:${ss}:${ms}`;
  }

  sortRaceGates() {
    let sortedGates = Array(this.raceGates.length);

    for (let i=0; i<this.raceGates.length; i++) {
      let idx = parseInt(this.raceGates[i].name.slice(this.raceGates[i].name.length - 3) - 1);
      sortedGates[idx] = this.raceGates[i];
    }

  this.raceGates = sortedGates;
  this.initPositions();
  }

  initPositions() {
    this.racerPositions = [];
    for (let i=0; i<this.racers.length; i++) {
      this.racerPositions.push({
        racerId: i,
        gateId: 0, // start on the next gate because first gate is the starting line
        distance: 0,
        lap: 0
      });
    }
    this.updatePositions();
  }

  updatePositions() {
    for (let i=0; i<this.racerPositions.length; i++) {
      let position = this.racerPositions[i];
      let racer = this.racers[position.racerId];
      let gate = this.raceGates[position.gateId];


      // console.log(this.raceGates);
      position.distance = racer.position.clone().sub(gate.position).lengthSq();
      if (position.distance < 1600) {
        if (position.gateId === 0) {
          position.lap += 1;
          if (position.lap > 1) {this.setLapTime(position.lap - 1)};
          if (position.lap === 2) {
            // this.fanfare.raceFont.animMixer.clipAction(this.fanfare.raceFont.animLap2);
            this.fanfare.raceFont.animLap2.stop();
            this.fanfare.raceFont.animLap2.setLoop(LoopOnce);
            // this.fanfare.raceFont.animLap2.timeScale = 42;
            this.fanfare.raceFont.animLap2.play();
            // console.log('lap 22222222222');
          } else if (position.lap === 3) {
            // this.fanfare.animMixer.clipAction(this.fanfare.raceFont.animLap3);
            // this.fanfare.raceFont.animLap3.setLoop(0,1);
            // this.fanfare.raceFont.animLap3.timeScale = 42;
            // this.fanfare.raceFont.animLap3.play();
            // console.log('lap 33333333333');
          // } else if (position.lap === 4) {
            // this.fanfare.animMixer.clipAction(this.fanfare.raceFont.animLapFinal);
            this.fanfare.raceFont.animLapFinal.stop();
            this.fanfare.raceFont.animLapFinal.setLoop(LoopOnce);
            // this.fanfare.raceFont.animLapFinal.timeScale= 42;
            this.fanfare.raceFont.animLapFinal.play();
            // console.log('lap FFIINNAALL');
          }
          // console.log(`newLap ${position.lap}`);
          if (position.lap > this.lapCount) this.raceFinish();
        }

        // console.log(`currentGate: ${position.gateId}`);
        position.gateId = (position.gateId + 1 ) % (this.raceGates.length);
        // console.log(`nextGate: ${position.gateId}`);
      }
      // console.log(position.gateId)

    }
  }

  setLapTime(lap) {
    switch(lap) {
      case 1:
        this.times.lap1 = this.currentTime;
        return;

      case 2:
        this.times.lap2 = this.currentTime - this.times.lap1;
        return;

      case 3:
        this.times.lap3 = (this.currentTime - this.times.lap2 - this.times.lap1);
        this.times.total = this.currentTime;
        this.times.lap1 = this.formatTime(this.times.lap1);
        this.times.lap2 = this.formatTime(this.times.lap2);
        this.times.lap3 = this.formatTime(this.times.lap3);
        this.times.total = this.formatTime(this.times.total);
        return;

      default: return;
    }
  };

  raceFinish() {
    // console.log('!race finished!');
    // this.fanfare.animMixer.clipAction(this.fanfare.raceFont.animFinish);
    // this.setLapTime(3);
    const { times: { lap1, lap2, lap3, total } } = this;
    document.getElementById('time-lap1').innerHTML=lap1;
    document.getElementById('time-lap2').innerHTML = lap2;
    document.getElementById('time-lap3').innerHTML = lap3;
    document.getElementById('time-total').innerHTML = total;
    this.fanfare.raceFont.animFinish.stop();
    this.fanfare.raceFont.animFinish.setLoop(LoopOnce);
    // this.fanfare.raceFont.animFinish.timeScale = 42;
    this.fanfare.raceFont.animFinish.play();
    this.isRaceEnded = true;
    this.gameState.raceComplete();
    // this.clearTimers();
  };
}

