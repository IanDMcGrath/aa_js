export const playerSpeed = {speed: 0};

const racerSpeedBarFill = document.querySelector('.racer-speed-bar-fill');
const racerSpeedNumber = document.querySelector('.speed-number');

export const setSpeedGauge = () => {
  let speedActual = Math.min(Math.floor(Math.abs(playerSpeed.speed) * 100), 1000);
  let speedPercent = speedActual * 0.1;
  racerSpeedBarFill.setAttribute('style', `width: ${speedPercent}%`);
  racerSpeedNumber.innerHTML = speedActual.toString();
};
