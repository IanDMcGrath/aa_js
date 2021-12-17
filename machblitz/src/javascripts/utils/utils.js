import { Vector3 } from "three";

export function vectorAdd(vectors){ // sum an array of vectors
    let total = [0,0,0];
    for (let i=0; i<vectors.length; i++) {
        total = [
            total[0] + vectors[i][0],
            total[1] + vectors[i][1],
            total[2] + vectors[i][2]
        ];
    }
    return total;
}

export function vectorSubtract(v1, v2) { // subtract two vectors
    let result = [0,0,0];
        result = [
            v1[0] - v2[0],
            v1[1] - v2[1],
            v1[2] - v2[2]
        ];
    return result;
}


export function rotatorAdd(vectors) {
    for (let i=0; i<vectors.length; i++) {

    }
}


export function wrapAngle(inAngle, wrapAngle=(6.2831)) { // default wrapAngle is pi * 2 (2 radians)
    let dir = inAngle > 0 ? 1 : -1;
    let abs = Math.abs(inAngle) % wrapAngle;
    return abs * dir;
}

export function clampFMin(f, min) {
    if (f < min) {
        return min;
    } else {
        return f;
    }
}

export function clampFMax(f, max) {
    if (f > max) {
        return max;
    } else {
        return f;
    }
}

export function clampFRange(f, min, max) {
    if (f > max) {
        return max;
    } else if (f < min) {
        return min;
    } else {
        return f;
    }
}

export const lerp = (a, b, alpha) => (
  a * (1 - alpha) + b * alpha
);

export const shallowCompare = (obj1, obj2) => {
  return Boolean(Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(key => obj1[key] === obj2[key]));
}

export const shallowDiff = (obj1, obj2) => {
  return result = Object.keys(obj1).select(key => {obj1[key] !== obj2[key]});
}

Array.prototype.select = (func) => {
  let result = [];
  this.forEach( el => {if (func(el)) {result.push(el)}});
  return result;
}

// export const twoPointBezier = () => {

// };


// module.exports = Util