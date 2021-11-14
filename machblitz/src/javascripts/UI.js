import Menu from './Menu';

class UIManager {
  constructor() {
    this.initializeUI = this.initializeUI.bind(this);
    this.createHUD = this.createHUD.bind(this);
    this.setSpeedGauge = this.setSpeedGauge.bind(this);
    this.setElapsedTime = this.setElapsedTime.bind(this);
    this.createMenus = this.createMenus.bind(this);
    this.inputPause = this.inputPause.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.inputPressStart = this.inputPressStart.bind(this);
    this.showPressStartMenu = this.showPressStartMenu.bind(this);
    this.hideMenuAndStartGame = this.hideMenuAndStartGame.bind(this);
    this.configureMenuActions = this.configureMenuActions.bind(this);
    this.showMenu = this.showMenu.bind(this);

    this.initializeUI();
  };

  initializeUI() {
    console.log('initializeUI');
    this.createHUD();
    this.createMenus();
    this.configureMenuActions();
    this.showPressStartMenu();
  };

  createHUD() {
    if (!this.menus) {
      this.menus = {};
    }
    this.menus.playHud = {};
    const { playHud } = this.menus;

    playHud.racerTimer = document.querySelector('.racer-timer');
    playHud.playerSpeed = { speed: 0 };

    playHud.racerSpeedBarFill = document.querySelector('.racer-speed-bar-fill');
    playHud.racerSpeedNumber = document.querySelector('.speed-number');
    playHud.canvasElement = document.querySelector('.play-hud');
    console.log('THIS.MENUS.PLAYHUD');
    console.log(playHud);
  };

  setSpeedGauge() {
    const { playHud: { racerSpeedBarFill, racerSpeedNumber, playerSpeed }} = this.menus;
    let speedActual = Math.min(Math.floor(Math.abs(playerSpeed.speed) * 100), 1000);
    let speedPercent = speedActual * 0.1;
    racerSpeedBarFill.setAttribute('style', `width: ${speedPercent}%`);
    racerSpeedNumber.innerHTML = speedActual;
  };

  setElapsedTime(time) {
    this.menus.playHud.racerTimer.innerHTML = time;
  };

  createMenus() {
    if (!this.menus) {
      this.menus = {};
    }

    // // // PRESS START // // //
    this.menus.pressStartHud = document.querySelector('.press-start-hud');

    // // // START MENU // // //
    this.menus.startMenu = new Menu;
    const { startMenu } = this.menus;
    startMenu.canvasElement = document.querySelector('.start-menu-hud');
    startMenu.setButtons('start-menu-option');

    // // // PAUSE MENU // // //
    this.menus.pauseMenu = new Menu;
    const { pauseMenu } = this.menus;
    pauseMenu.canvasElement = document.querySelector('.pause-menu-hud');
    pauseMenu.setButtons('pause-menu-option');
  };

  inputPause(e) {
    const { pauseMenu } = this.menus;
    if (this.gameState.isPaused) {
      e.preventDefault();
      e.stopPropagation();
      switch (e.code) {
        case "Escape": case "Tab":
          this.togglePause();
          return;

        default: return;
      }
    } else {
      switch (e.code) {
        case "Escape": case "Tab":
          e.preventDefault();
          e.stopPropagation();
          this.togglePause();
          return;

        default: return;
      }
    }
  };

  togglePause() {
    const { pauseMenu, playHud } = this.menus;
    console.log(this.menus);
    this.gameState.isPaused = !this.gameState.isPaused;
    console.log(`TOGGLEPAUSE: Is Paused?: ${this.gameState.isPaused}`);
    if (this.gameState.isPaused) {
      playHud.canvasElement.classList.add('invisible');
      pauseMenu.canvasElement.classList.remove('invisible');
      pauseMenu.focus();
    } else {
      pauseMenu.canvasElement.classList.add('invisible');
      playHud.canvasElement.classList.remove('invisible');
      pauseMenu.unfocus();
    }
  };

  inputPressStart(e) {
    const { startMenu } = this.menus;
    e.preventDefault();
    e.stopPropagation();
    this.showMenu('start-menu-hud');
    document.removeEventListener("keydown", this.inputPressStart);
    startMenu.addMouseOverEvents(startMenu.keyNav.buttons, startMenu.hoverMenuButtons);
    document.removeEventListener("click", this.inputPressStart);
    startMenu.focus();
  };

  showPressStartMenu() {
    const { startMenu } = this.menus;
    document.addEventListener("keydown", this.inputPressStart);
    document.addEventListener("click", this.inputPressStart);
    startMenu.unfocus();
  };

  hideMenuAndStartGame() {
    const { startMenu } = this.menus;
    startMenu.unfocus();
    document.addEventListener("keydown", this.inputPause);
    this.showMenu('play-hud');
  };

  configureMenuActions() {
    const { pauseMenu, startMenu } = this.menus;

    // // // CONFIGURE PAUSE MENU ACTIONS // // //
    pauseMenu.confirmMenuItem = (buttonIdx) => {
      switch (buttonIdx) {
        case 'button-resume':
          this.togglePause();
          this.isPaused = true;
          return;

        case 'button-restart':
          this.togglePause();
          pauseMenu.initializeMenuPos();
          this.gameState.raceReady();
          return;

        case 'button-quit':
          return;

        case 'button-github':
          window.open('https://github.com/IanDMcGrath', '_blank').focus();
          pauseMenu.initializeMenuPos();
          return;

        case 'button-linkedin':
          window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
          pauseMenu.initializeMenuPos();
          return;

        default: return;
      }
    };

    // // // CONFIGURE START MENU ACTIONS // // //
    startMenu.confirmMenuItem = (buttonIdx) => {
      switch (buttonIdx) {
        case 'button-start':
          this.hideMenuAndStartGame();
          return;

        case 'button-github':
          window.open('https://github.com/IanDMcGrath', '_blank').focus();
          startMenu.initializeMenuPos();
          return;

        case 'button-linkedin':
          window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
          startMenu.initializeMenuPos();
          return;

        default: return;
      }
    };
  };

  showMenu(menuName) {
    const { pressStartHud, startMenu, playHud } = this.menus;
    pressStartHud.classList.add('invisible');
    startMenu.canvasElement.classList.add('invisible');
    this.menus.playHud.canvasElement.classList.add('invisible');
    switch (menuName) {
      case 'press-start-hud':
        pressStartHud.classList.remove('invisible');
        return;
      case 'start-menu-hud':
        startMenu.canvasElement.classList.remove('invisible');
        return;
      case 'play-hud':
        playHud.canvasElement.classList.remove('invisible');
        return;
      default: return;
    }
  };
};

export default UIManager;