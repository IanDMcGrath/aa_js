import { AnimationClip } from "three";
import { scene } from "../../script";


export class RaceFont {
  constructor(obj, num) {
    this.obj = obj;
    this.num = num;

    this.animate();
  }

  animate() {
    // console.log(this.obj);
    let clip = new AnimationClip('countdown', 1, [0]);
    // clip.play();
  }

}