class Menu {
  constructor() {
    this.canvasElement = null;
    this.keyNav = {
      buttons: [],
      buttonIdx: -1,
    };
    this.buttonNames = {};
    this.selectedButton = null;
    this.gameState = {
      isPaused: false,
      isInPlay: false,
    };
    this.navMenuButtons = this.navMenuButtons.bind(this);
    this.inputNavMenu = this.inputNavMenu.bind(this);
    this.clickNavMenu = this.clickNavMenu.bind(this);
    this.focus = this.focus.bind(this);
    this.unfocus = this.unfocus.bind(this);
    this.setButtons = this.setButtons.bind(this);
    this.initializeMenuPos = this.initializeMenuPos.bind(this);
    this.selectButton = this.selectButton.bind(this);
    this.hoverMenuButtons = this.hoverMenuButtons.bind(this);
  };

  setButtons(className) {
    this.keyNav.buttons = Array.from(document.getElementsByClassName(className));
    this.keyNav.buttons.forEach(button => {
      this.buttonNames[button.className] = button;
    });
  };

  initializeMenuPos() {
    this.unselectButtons();
    this.keyNav.buttonIdx = 0;
    this.selectButton();
  };

  selectButton() {
    let button = this.keyNav.buttons[this.keyNav.buttonIdx];
    button.classList.add('selected');
    this.selectedButton = button;
  };

  unselectButtons() {
    this.keyNav.buttons.forEach(button => {
      button.classList.remove('selected');
    });
  };

  hoverMenuButtons(e) {
    // console.log(this);
    e.preventDefault();
    e.stopPropagation();
    // console.log(e.currentTarget.className);
    this.selectedButton = e.currentTarget;
    this.unselectButtons();
    e.currentTarget.classList.add('selected');
  };

  addMouseOverEvents(hoverables, e) {
    hoverables.forEach(item => {
      item.addEventListener("mouseover", e);
    });
  };

  inputNavMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    // console.log(e.code);
    switch (e.code) {
      case "KeyW": case "ArrowUp":
        // console.log(this);
        this.navMenuButtons({ isUp: true });
        return;
      case "KeyS": case "ArrowDown":
        this.navMenuButtons({ isUp: false });
        return;
      case "Space": case "Enter":
        if (this.keyNav.buttonIdx === -1) {
          this.initializeMenuPos();
          return;
        }
        // console.log(this);
        if (!this.confirmMenuItem) {console.log("WARNING: you are trying to use a confirm input but this Menu's 'confirmMenuItem' has not been set"); return;}
        this.confirmMenuItem(this.selectedButton.id);
        return;
      default: return;
    }
  };

  setConfirmMenuItem(caseFunc) {
    this.confirmMenuItem = caseFunc;
  };

  navMenuButtons({ isUp }) {
    // console.log(this);
    this.unselectButtons();
    let numButtons = Object.keys(this.keyNav.buttons).length;
    if (this.keyNav.buttonIdx === -1) {
      this.initializeMenuPos();
      return;
    }
    if (!isUp) {
      this.keyNav.buttonIdx = this.keyNav.buttonIdx + 1;
      if (this.keyNav.buttonIdx >= numButtons) { this.keyNav.buttonIdx = 0 }
    } else {
      this.keyNav.buttonIdx = this.keyNav.buttonIdx - 1;
      if (this.keyNav.buttonIdx < 0) { this.keyNav.buttonIdx = numButtons - 1 }
    }
    this.selectButton();
    // console.log(this.keyNav.buttons[this.keyNav.buttonIdx].className);
  };

  clickNavMenu(e) {
    if (!this.selectedButton) { this.keyNav.buttonIdx = 0; this.selectButton(); return; }
      this.confirmMenuItem(this.selectedButton.id);
  };

  focus() {
    // console.log('FOCUS MENU');
    // console.log(this);
    // console.log(objectId(this));
    document.addEventListener("keydown", this.inputNavMenu);
    document.addEventListener("mousedown", this.clickNavMenu);
    this.addMouseOverEvents(this.keyNav.buttons, this.hoverMenuButtons);

  };

  unfocus() {
    // console.log('UNFOCUS MENU');
    // console.log(this);
    // console.log(objectId(this));
    document.removeEventListener("keydown", this.inputNavMenu);
    document.removeEventListener("mousedown", this.clickNavMenu);
  };

};

export default Menu;