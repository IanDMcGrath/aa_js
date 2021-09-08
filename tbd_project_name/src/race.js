import scene from './script.js';
import { Quaternion, Vector3 } from 'three';


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
    }

    raceLineup() {
        for (let i=0; i<this.racers.length; i++) {
            this.racers[i].position = this.position.clone();
            this.racers[i].rotation = this.rotation.clone();
        }
    }

    raceCountdown() {
        // delay race start //
        setTimeout(this.raceStart, 4000);
        
        // countdown //
        setTimeout(this.displayCtdNumber, 1000, 3);
        setTimeout(this.displayCtdNumber, 2000, 2);
        setTimeout(this.displayCtdNumber, 3000, 1);
        setTimeout(this.displayCtdNumber, 4000, 0); // display GO!
    }

    displayCtdNumber(num) {
        if (num > 0) {
            console.log(`COUNTDOWN: ${num}${num}${num}${num}${num}!`)
        } else {
            console.log('### GO! GO! GO! GO! GO! ###')
        }
        console.log(this.raceGates);
    }

    raceStart() {}

    sortRaceGates() {
    }
}