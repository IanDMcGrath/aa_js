import React from 'react';
import ReactDOM from 'react-dom';
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
    this.raceComplete = this.raceComplete.bind(this);
    this.quit = this.quit.bind(this);

    this.buttonDown = false;

    this.initializeUI();
  };

  initializeUI() {
    // console.log('initializeUI');
    this.createHUD();
    this.createMenus();
    this.configureMenuActions();
    this.showPressStartMenu();
    this.buttons = {};
    this.buttons.burger = document.getElementById("button-burger");
    this.buttons.burger.addEventListener("click", this.togglePause);
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
    // console.log('THIS.MENUS.PLAYHUD');
    // console.log(playHud);
  };

  setSpeedGauge() {
    const { racerSpeedBarFill, racerSpeedNumber, playerSpeed } = this.menus.playHud;
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

    // // // RESULTS MENU // // //
    this.menus.resultsMenu = new Menu;
    const { resultsMenu } = this.menus;
    resultsMenu.canvasElement = document.querySelector('.results-menu-hud');
    resultsMenu.setButtons('results-menu-option');
  };

  inputPause(e) {
    const { pauseMenu } = this.menus;
    if (this.gameState.isPaused) {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === "Escape" || e.code === "Tab") {
        this.togglePause();
        return;
      }
    } else {
      if (e.code === "Escape" || e.code === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        this.togglePause();
        return;
      }
    }
  };

  togglePause() {
    if (!this.gameState.gameStarted) return;
    const { pauseMenu, playHud } = this.menus;
    // console.log(this.menus);
    this.gameState.gamePause(!this.gameState.isPaused);
    // console.log(`TOGGLEPAUSE: Is Paused?: ${this.gameState.isPaused}`);
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
    // console.log(e);
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
    const { startMenu, pressStartHud } = this.menus;
    pressStartHud.focus();
    this.showMenu('press-start-hud');
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
    const { pauseMenu, startMenu, resultsMenu } = this.menus;
    const { gameState } = this;

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
          this.gameState.raceRestart();
          return;

        case 'button-quit':
          pauseMenu.initializeMenuPos();
          pauseMenu.unfocus();
          this.quit();
          return;

        case 'button-github':
          window.open('https://github.com/IanDMcGrath/aa_js', '_blank').focus();
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
          this.gameState.raceStart();
          return;

        case 'button-github':
          window.open('https://github.com/IanDMcGrath/aa_js', '_blank').focus();
          startMenu.initializeMenuPos();
          return;

        case 'button-linkedin':
          window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
          startMenu.initializeMenuPos();
          return;

        default: return;
      }
    };

    // // // CONFIGURE RESULTS MENU ACTIONS // // //
    resultsMenu.confirmMenuItem = (buttonIdx) => {
      switch (buttonIdx) {
        case 'button-restart':
          resultsMenu.initializeMenuPos();
          this.gameState.raceRestart();
          resultsMenu.unfocus();
          this.hideMenuAndStartGame();
          return;

        case 'button-quit':
          resultsMenu.initializeMenuPos();
          resultsMenu.unfocus();
          this.quit();
          return;

        case 'button-github':
          window.open('https://github.com/IanDMcGrath/aa_js', '_blank').focus();
          resultsMenu.initializeMenuPos();
          return;

        case 'button-linkedin':
          window.open('https://www.linkedin.com/in/ianmcgrath-techartist/', '_blank').focus();
          resultsMenu.initializeMenuPos();
          return;

        default: return;
      }
    };
  };

  showMenu(menuName) {
    const { pressStartHud, startMenu, playHud, pauseMenu, resultsMenu } = this.menus;
    pressStartHud.classList.add('invisible');
    startMenu.canvasElement.classList.add('invisible');
    playHud.canvasElement.classList.add('invisible');
    pauseMenu.canvasElement.classList.add('invisible');
    resultsMenu.canvasElement.classList.add('invisible');
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
      case 'results-menu-hud':
        resultsMenu.canvasElement.classList.remove('invisible');
      default: return;
    }
  };

  quit() {
    const { gameState } = this;
    this.showPressStartMenu();
    gameState.gameQuit();
  };

  raceComplete() {
    const { resultsMenu } = this.menus;
    setTimeout(() => {
      this.showMenu('results-menu-hud');
      resultsMenu.focus();
      document.removeEventListener("keydown", this.inputPause);
    }, 2000);

  };

  debug(strings) {
    const root = document.getElementById('debug');
    ReactDOM.render(<Debug strings={strings} />, root);
  }
};

class Debug extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { strings } = this.props;
    console.log(strings);
    return (
      <ul>
        {strings.map((str, i) => <li key={`debug-${i}`}>{str}</li>)}
      </ul>
    );
  }
}

export default UIManager;