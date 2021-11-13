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
  // console.log(e);
  // startMenu.selectedButton = startMenu.keyNav.buttons[0];
  showMenu('start-menu-hud');
  document.removeEventListener("keydown", inputPressStart);
  addMouseOverEvents(startMenu.keyNav.buttons, hoverMenuButtons);
  // document.removeEventListener("mousedown", inputPressStart);
  document.removeEventListener("click", inputPressStart);
  document.addEventListener("keydown", inputNavMenu);
  document.addEventListener("mousedown", clickNavMenu);
  // document.addEventListener("mousedown", inputNavMenu);
};

const showPressStartMenu = () => {
  // console.log('invoking showMenu()');
  // showMenu('press-start-hud');
  document.addEventListener("keydown", inputPressStart);
  document.addEventListener("click", inputPressStart);
  // document.addEventListener("mousedown", inputPressStart);
  document.removeEventListener("keydown", inputNavMenu);
  // document.removeEventListener("mousedown", inputNavMenu);
};

const hideMenuAndStartGame = () => {
  document.removeEventListener("keydown", inputNavMenu);
  document.addEventListener("keydown", pauseMenu);
  showMenu('play-hud');

};



// // // PAUSE MENU // // //

const pauseMenuHud = document.querySelector('.pause-menu-hud');

const pauseMenu = e => {
  switch (e.code) {
    case "Escape": case "Tab":
      e.preventDefault();
      e.stopPropagation();
      togglePause();

    return;
      default: return;
  }
};

const togglePause = () => {
  startMenu.gameState.isPaused = !startMenu.gameState.isPaused;
  console.log(`TOGGLEPAUSE: Is Paused?: ${startMenu.gameState.isPaused}`);
  if (startMenu.gameState.isPaused) {
    playHud.classList.add('invisible');
    pauseMenuHud.classList.remove('invisible');
  } else {
    pauseMenuHud.classList.add('invisible');
    playHud.classList.remove('invisible');
  }
};

const inputNavMenu = e => {
  e.preventDefault();
  e.stopPropagation();
  console.log(e.code)
  switch (e.code) {
    case "KeyW": case "ArrowUp":
      navMenuButtons({isUp: true});
      return;
    case "KeyS": case "ArrowDown":
      navMenuButtons({isUp: false});
      return;
    case "Space": case "Enter":
      if (startMenu.keyNav.buttonIdx === -1) {
        initializeMenuPos();
        return;
      }
      confirmMenuItem(startMenu.selectedButton.id);
      return;
    default: return;
  }
};

const clickNavMenu = e => {
  if (!startMenu.selectedButton) {startMenu.keyNav.buttonIdx = 0; selectButton(); return;}
  confirmMenuItem(startMenu.selectedButton.id);
};

const confirmMenuItem = (buttonIdx) => {
  // console.log(buttonIdx);
  switch (buttonIdx) {
    case 'button-start':
      // console.log('YOU PRESSED START!');
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

const hoverMenuButtons = e => {
  e.preventDefault();
  e.stopPropagation();
  // console.log(e.currentTarget.className);
  startMenu.selectedButton = e.currentTarget;
  unselectButtons();
  e.currentTarget.classList.add('selected');
};

const addMouseOverEvents = (hoverables, e)=> {
  hoverables.forEach(item => {
    item.addEventListener("mouseover", e);
  });
};

const showMenu = menuName => {
  // console.log('hiding all menus');
  pressStartHud.classList.add('invisible');
  startMenuHud.classList.add('invisible');
  playHud.classList.add('invisible');
  switch (menuName) {
    case 'press-start-hud':
      // console.log('showing press-start-hud');
      pressStartHud.classList.remove('invisible');
      return;
    case 'start-menu-hud':
      startMenuHud.classList.remove('invisible');
      return;
    case 'play-hud':
      playHud.classList.remove('invisible');
      return;
    default: return;
  }
};

// // // STARTMENU object // // //
const startMenu = {
  keyNav: {
    buttons: [],
    buttonIdx: -1,
  },
  buttonNames: {},
  selectedButton: null,
  gameState: {
    isPaused: false,
    isInPlay: false,
  },
};

startMenu.keyNav.buttons = Array.from(document.getElementsByClassName('start-menu-option'));
startMenu.keyNav.buttons.forEach(button => {
  startMenu.buttonNames[button.className] = button;
});





const unselectButtons = () => {
  startMenu.keyNav.buttons.forEach(button => {
    button.classList.remove('selected');
  });
};

const selectButton = () => {
  let button = startMenu.keyNav.buttons[startMenu.keyNav.buttonIdx];
  button.classList.add('selected');
  startMenu.selectedButton = button;
  // startMenu.keyNav.buttons[startMenu.keyNav.buttonIdx].hover(); // this don't work // :hover is an "untrusted" event
};

const initializeMenuPos = () => {
  startMenu.keyNav.buttonIdx = 0;
  selectButton();
};

const navMenuButtons = ( { isUp } ) => {
  console.log(startMenu);
  unselectButtons();
  let numButtons = Object.keys(startMenu.keyNav.buttons).length;
  if (startMenu.keyNav.buttonIdx === -1) {
    initializeMenuPos();
    return;
  }
  if (!isUp) {
    startMenu.keyNav.buttonIdx = startMenu.keyNav.buttonIdx + 1;
    if (startMenu.keyNav.buttonIdx >= numButtons) {startMenu.keyNav.buttonIdx = 0}
  } else {
    startMenu.keyNav.buttonIdx = startMenu.keyNav.buttonIdx - 1;
    if (startMenu.keyNav.buttonIdx < 0) {startMenu.keyNav.buttonIdx = numButtons - 1}
  }
  selectButton();
  console.log(startMenu.keyNav.buttons[startMenu.keyNav.buttonIdx].className);
};


const initializeUI = () => {
  console.log('initializeUI');
  showPressStartMenu();
}

initializeUI();
