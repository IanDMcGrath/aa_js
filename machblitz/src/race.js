import scene from './script.js';
import { Quaternion, Vector3 } from 'three';
import { RaceFont } from './fanfare.js';


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

    const that = this;
    setTimeout(()=>{that.raceCountdown();}, 3000);
  }

  raceCountdown() {
    const that = this;
    // delay race start //
    this.delayRaceStart = () => {that.raceStart();};
    setTimeout(this.delayRaceStart, 3000);

    // countdown //
    this.delayCtd0 = () => {that.displayCtdNumber(0);}; // display GO! event object // forgot how I bound these events in the vehicle class so i'm just copying what it is now...
    this.delayCtd1 = () => {that.displayCtdNumber(1);}; // display 1! event object
    this.delayCtd2 = () => {that.displayCtdNumber(2);}; // display 2! event object
    this.delayCtd3 = () => {that.displayCtdNumber(3);}; // display 3! event object
    setTimeout(this.delayCtd3, 0); // delay display numbers
    setTimeout(this.delayCtd2, 1000);
    setTimeout(this.delayCtd1, 2000);
    setTimeout(this.delayCtd0, 3000); // delay display GO!
    // this.fanfare.raceFont.animAction.setDuration(1);

    // console.log(this.racers[0]);
    // console.log(this.fanfare.raceFont);
    this.racers[0].cam.obj.attach(this.fanfare.raceFont.obj.scene);

    this.fanfare.raceFont.animCountdown.setLoop(0,1);
    this.fanfare.raceFont.animCountdown.play();
  }

  displayCtdNumber(num) {
    let raceFont = new RaceFont(this.fanfare.raceFont, num);
    // scene.add()
    if (num > 0) {
      // console.log(`COUNTDOWN: ${num}${num}${num}${num}${num}!`);
    } else {
      // console.log('### GO! GO! GO! GO! GO! ###');
      this.raceStart();
    }
  }

  raceStart() {
    this.isRaceStarted = true;
    this.racers[0].bindControls();
    this.timeStart = new Date().getTime();
    const timerSeconds = setInterval(this.updateElapsedSeconds, 1000);
    const timerMinutes = setInterval(this.updateElapsedMinutes, 60000);
    this.clearTimers = () => {
      // not working
      clearInterval(timerSeconds);
      clearInterval(timerMinutes);
    }
  }

  updateElapsedSeconds() {
    this.elapsedTime.ss = Math.round(this.currentTime * 0.001) % 60;
  }

  updateElapsedMinutes() {
    this.elapsedTime.mm = Math.round(this.currentTime * 0.000016666666667);
  }

  updateElapsedTime() {
    if (!this.isRaceStarted) { return '00:00:000' }
    if (this.isRaceEnded) { return this.formatElapsedTime() }

    this.currentTime = new Date().getTime() - this.timeStart;
    this.elapsedTime.ms = this.currentTime % 1000;

    return this.formatElapsedTime();
  }

  formatElapsedTime() {
    let { mm, ss, ms } = this.elapsedTime;
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

      position.distance = racer.position.clone().sub(gate.position).lengthSq();
      if (position.distance < 1500) {
        if (position.gateId === 0) {
          position.lap += 1;
          if (position.lap === 2) {
            // this.fanfare.raceFont.animMixer.clipAction(this.fanfare.raceFont.animLap2);
            this.fanfare.raceFont.animLap2.setLoop(0,1);
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
            this.fanfare.raceFont.animLapFinal.setLoop(0,1);
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

  raceFinish(){
    // console.log('!race finished!');
    // this.fanfare.animMixer.clipAction(this.fanfare.raceFont.animFinish);
    this.fanfare.raceFont.animFinish.setLoop(0,1);
    // this.fanfare.raceFont.animFinish.timeScale = 42;
    this.fanfare.raceFont.animFinish.play();
    this.isRaceEnded = true;
    this.clearTimers();
  }
}

