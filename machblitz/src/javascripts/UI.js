import Menu from './Menu';

// class UIManager {


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

const pressStartHud = document.querySelector('.press-start-hud');




// // // STARTMENU object // // //

const startMenu = new Menu;
startMenu.canvasElement = document.querySelector('.start-menu-hud');
startMenu.setButtons('start-menu-option');

// // // PAUSE MENU // // //

const pauseMenu = new Menu;
pauseMenu.canvasElement = document.querySelector('.pause-menu-hud');
pauseMenu.setButtons('pause-menu-option');

const inputPause = e => {
  if (pauseMenu.gameState.isPaused) {
    e.preventDefault();
    e.stopPropagation();
    switch (e.code) {
      case "Escape": case "Tab":
        togglePause();
        return;
      default: return;
    }
  } else {
    switch (e.code) {
      case "Escape": case "Tab":
        e.preventDefault();
        e.stopPropagation();
        togglePause();
        return;

      default: return;
    }
  }
};

const togglePause = () => {
  pauseMenu.gameState.isPaused = !pauseMenu.gameState.isPaused;
  console.log(`TOGGLEPAUSE: Is Paused?: ${pauseMenu.gameState.isPaused}`);
  if (pauseMenu.gameState.isPaused) {
    playHud.classList.add('invisible');
    pauseMenu.canvasElement.classList.remove('invisible');
    pauseMenu.focus();
  } else {
    pauseMenu.canvasElement.classList.add('invisible');
    playHud.classList.remove('invisible');
    pauseMenu.unfocus();
  }
};



const inputPressStart = e => {
  e.preventDefault();
  e.stopPropagation();
  showMenu('start-menu-hud');
  document.removeEventListener("keydown", inputPressStart);
  startMenu.addMouseOverEvents(startMenu.keyNav.buttons, startMenu.hoverMenuButtons);
  document.removeEventListener("click", inputPressStart);
  startMenu.focus();
};

const showPressStartMenu = () => {
  document.addEventListener("keydown", inputPressStart);
  document.addEventListener("click", inputPressStart);
  startMenu.unfocus();
};

const hideMenuAndStartGame = () => {
  startMenu.unfocus();
  document.addEventListener("keydown", inputPause);
  showMenu('play-hud');
};


startMenu.confirmMenuItem = (buttonIdx) => {
  switch (buttonIdx) {
    case 'button-start':
      hideMenuAndStartGame();
      return;

    case 'button-github':
      window.open('https://github.com/IanDMcGrath', '_blank').focus();
      return;

    case 'button-linkedin':
      window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
      return;

    default: return;
  }
};

import isPaused from '../script';

pauseMenu.confirmMenuItem = (buttonIdx) => {
  switch (buttonIdx) {
    case 'button-resume':
      togglePause();
      isPaused = true;
      return;

    case 'button-restart':
      return;

    case 'button-quit':
      return;

    case 'button-github':
      window.open('https://github.com/IanDMcGrath', '_blank').focus();
      return;

    case 'button-linkedin':
      window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
      return;

    default: return;
  }
};

const showMenu = menuName => {
  pressStartHud.classList.add('invisible');
  startMenu.canvasElement.classList.add('invisible');
  playHud.classList.add('invisible');
  switch (menuName) {
    case 'press-start-hud':
      pressStartHud.classList.remove('invisible');
      return;
    case 'start-menu-hud':
      startMenu.canvasElement.classList.remove('invisible');
      return;
    case 'play-hud':
      playHud.classList.remove('invisible');
      return;
    default: return;
  }
};




const initializeUI = () => {
  console.log('initializeUI');
  showPressStartMenu();
}

// }

// initializeUI();

// export default UIManager;