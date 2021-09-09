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
            this.lapCount = 1;
            this.fanfare = {
                raceFont: undefined
            };
            // this.racerPosition = {
            //     racerId: 0,
            //     gateId: 0,
            //     distance: 0
            // };
    }

    raceLineup() {
        for (let i=0; i<this.racers.length; i++) {
            this.racers[i].position = this.position.clone();
            this.racers[i].rotation = this.rotation.clone();
        }

        const that = this;
        setTimeout(()=>{that.raceCountdown()}, 3000);
    }

    raceCountdown() {
        const that = this;
        // delay race start //
        this.delayRaceStart = () => {that.raceStart()};
        setTimeout(this.delayRaceStart, 4000);
        
        // countdown //
        this.delayCtd0 = () => {that.displayCtdNumber(0)}; // display GO! event object // forgot how I bound these events in the vehicle class so i'm just copying what it is now...
        this.delayCtd1 = () => {that.displayCtdNumber(1)}; // display 1! event object
        this.delayCtd2 = () => {that.displayCtdNumber(2)}; // display 2! event object
        this.delayCtd3 = () => {that.displayCtdNumber(3)}; // display 3! event object
        setTimeout(this.delayCtd3, 0); // delay display numbers
        setTimeout(this.delayCtd2, 1000);
        setTimeout(this.delayCtd1, 2000);
        setTimeout(this.delayCtd0, 3000); // delay display GO!
        // this.fanfare.raceFont.animAction.setDuration(1);
        this.fanfare.raceFont.animAction.setLoop(0,1);
        this.fanfare.raceFont.animAction.play();
    }

    displayCtdNumber(num) {
        let raceFont = new RaceFont(this.fanfare.raceFont, num);
        // scene.add()
        if (num > 0) {
            console.log(`COUNTDOWN: ${num}${num}${num}${num}${num}!`);
        } else {
            console.log('### GO! GO! GO! GO! GO! ###');
            this.racers[0].bindControls();
        }
    }

    raceStart() {
    }

    sortRaceGates() {
        let sortedGates = Array(this.raceGates.length);

        for (let i=0; i<this.raceGates.length; i++) {
            let idx = parseInt(this.raceGates[i].name.slice(this.raceGates[i].name.length - 3) - 1)
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
                    console.log(`newLap ${position.lap}`);
                    if (position.lap > this.lapCount) this.raceFinish();
                }

                console.log(`currentGate: ${position.gateId}`);
                position.gateId = (position.gateId + 1 ) % (this.raceGates.length);
                console.log(`nextGate: ${position.gateId}`);
            }
            // console.log(position.gateId)

        }
    }

    raceFinish(){
        console.log('!race finished!')
    }
}

