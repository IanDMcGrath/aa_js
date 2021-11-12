export const playerSpeed = {speed: 0};

const racerSpeedBarFill = document.querySelector('.racer-speed-bar-fill');
const racerSpeedNumber = document.querySelector('.speed-number');
const playHud = document.querySelector('.play-hud');

export const setSpeedGauge = () => {
  let speedActual = Math.min(Math.floor(Math.abs(playerSpeed.speed) * 100), 1000);
  let speedPercent = speedActual * 0.1;
  racerSpeedBarFill.setAttribute('style', `width: ${speedPercent}%`);
  racerSpeedNumber.innerHTML = speedActual;
};


const racerTimer = document.querySelector('.racer-timer');

export const setElapsedTime = (time) => {
  racerTimer.innerHTML = time;
};

// const githubImg = document.createElement('img');
// const linkGithub = document.querySelector('.github');
// linkGithub.appendChild(githubImg);
// githubImg.src = ""

const pressStartHud = document.querySelector('.press-start-hud');
const startMenuHud = document.querySelector('.start-menu-hud');

const inputPressStart = e => {
  e.preventDefault();
  e.stopPropagation();
  // console.log(pressStartMenu);
  showMenu('start-menu-hud');
  document.removeEventListener("keydown", inputPressStart);
};

const showPressStartMenu = () => {
  console.log('invoking showMenu()');
  showMenu('press-start-hud');
  document.addEventListener("keydown", inputPressStart);
};

const showMenu = menuName => {
  console.log('hiding all menus');
  pressStartHud.classList.remove('visible');
  startMenuHud.classList.remove('visible');
  playHud.classList.remove('visible');
  switch (menuName) {
    case 'press-start-hud':
      console.log('showing press-start-hud');
      pressStartHud.classList.add('visible');
      return;
    case 'start-menu-hud':
      startMenuHud.classList.add('visible');
      return;
    case 'play-hud':
      playHud.classList.add('visible');
      return;
    default: return;
  }
}


const initializeUI = () => {
  console.log('initializeUI');
  showPressStartMenu();
}

initializeUI();
