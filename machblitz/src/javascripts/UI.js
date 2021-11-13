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
  console.log(e);
  showMenu('start-menu-hud');
  document.removeEventListener("keydown", inputPressStart);
  addMouseOverEvents(startMenu.buttons, hoverMenuButtons);
  // document.removeEventListener("mousedown", inputPressStart);
  document.removeEventListener("click", inputPressStart);
  document.addEventListener("keydown", inputNavMenu);
  document.addEventListener("mousedown", clickNavMenu);
  // document.addEventListener("mousedown", inputNavMenu);
};

const showPressStartMenu = () => {
  console.log('invoking showMenu()');
  // showMenu('press-start-hud');
  document.addEventListener("keydown", inputPressStart);
  document.addEventListener("click", inputPressStart);
  // document.addEventListener("mousedown", inputPressStart);
  document.removeEventListener("keydown", inputNavMenu);
  // document.removeEventListener("mousedown", inputNavMenu);
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
    case "space": case "Enter":

      return;
    default: return;
  }
};

const clickNavMenu = e => {
  confirmMenuItem(startMenu.buttons[startMenu.buttonId].id);
};

const confirmMenuItem = (buttonId) => {
  console.log(buttonId);
  switch (buttonId) {
    case 'button-start':
    case 'button-linkedin':
    case 'button-github':
    default: return;
  }
};

const hoverMenuButtons = e => {
  e.preventDefault();
  e.stopPropagation();
  console.log(e.currentTarget.className);
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

const startMenu = { buttons: [], buttonId: 0, buttonNames: {} };
startMenu.buttons = Array.from(document.getElementsByClassName('start-menu-option'));
startMenu.buttons.forEach(button => {
  startMenu.buttonNames[button.className] = button;
});

const unselectButtons = () => {
  startMenu.buttons.forEach(button => {
    button.classList.remove('selected');
  });
};

const selectButton = () => {
  startMenu.buttons[startMenu.buttonId].classList.add('selected');
  // startMenu.buttons[startMenu.buttonId].hover(); // this don't work // :hover is an "untrusted" event
};

const navMenuButtons = ( { isUp } ) => {
  console.log(startMenu);
  unselectButtons();
  let numButtons = Object.keys(startMenu.buttons).length;
  if (!isUp) {
    startMenu.buttonId = startMenu.buttonId + 1;
    if (startMenu.buttonId >= numButtons) {startMenu.buttonId = 0}
  } else {
    startMenu.buttonId = startMenu.buttonId - 1;
    if (startMenu.buttonId < 0) {startMenu.buttonId = numButtons - 1}
  }
  selectButton();
  console.log(startMenu.buttons[startMenu.buttonId].className);
};


const initializeUI = () => {
  console.log('initializeUI');
  showPressStartMenu();
}

initializeUI();
