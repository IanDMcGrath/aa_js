// this file is deprecated. I started building this out without realizing I can just ride on HTML and DOM to build menus.



// FULLSCREEN BUTTON
// const canvas = document.querySelector('canvas');
// const fullscreenButton = document.querySelector("#button-fullscreen");
// const hud = document.querySelector('.mid');

// const fullscreenClick = e => {
//   e.stopPropagation();
//   if (!document.fullscreenElement) {
//     hud.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// };

// fullscreenButton.addEventListener('click', fullscreenClick);

// const getCursorPosition = (canvas, event) => {
//   const rect = canvas.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const y = event.clientY - rect.top;
//   // console.log("x: " + x + " y: " + y);
//   // clickButton([x, y]);
// };

// canvas.addEventListener('mousedown', function (e) {
//   getCursorPosition(canvas, e);
// });


// DOP BUT HERE FOR REFERENCE
// class Button {
//   constructor(ctx, size, pos, canvas) {
//     this.ctx = ctx;
//     this.size = size;
//     this.pos = pos;
//     this.anchor = anchor;
//     this.canvas = canvas;
//   }

//   getAnchorPosition(anchor='') {
//     switch(anchor) {
//       case 'left': return [0, this.canvase.height * 0.25];
//       case 'bottomLeft': return [0, this.canvas.height];
//       case 'bottom': return [this.canvas.width * 0.25, this.canvase.height * 0.5];
//       case 'bottomRight': return [this.canvas.width * 0.5, this.canvas.height * 0.5];
//       case 'right': return [this.canvas.width * 0.5, this.canvas.height * 0.25];
//       case 'topRight': return [this.canvas.width * 0.5, 0];
//       case 'top': return [this.canvas.width * 0.25, 0];
//       case 'topLeft': return [0,0];
//       default: return [0,0];
//     }
//   }

//   getPosition() {
//     let anchor = this.getAnchorPosition(this.anchor);
//     return [anchor[0] + this.pos[0], anchor[1] + this.pos[1]];
//   }

//   clicked() {
//     console.log(`you clicked ${this.getPosition()}`);
//   }

//   didClick(clickPos) {
//     let clickX = clickPos[0];
//     let clickY = clickPos[1];
//     let pos = this.getPosition();
//     let boundLeft = pos[0] - (this.size[0] / 2);
//     let boundRight = pos[0] + (this.size[0] / 2);
//     console.log(`${boundLeft} < ${clickX} < ${boundRight} ?: ${Boolean(clickX > boundLeft && clickX < boundRight)}`);
//     if (clickX > boundLeft && clickX < boundRight) {
//       let boundTop = pos[1] - (this.size[1] / 2);
//       let boundBottom = pos[1] + (this.size[1] / 2);
//       console.log(`${boundTop} < ${clickY} < ${boundBottom} ?: ${Boolean(clickY > boundTop && clickY < boundBottom)}`);
//       if (clickY > boundTop && clickY < boundBottom) {
//         this.clicked();
//       }
//     }
//   }
// }

// const buttons = {};
// let size = [30, 30]; let pos = [-30, 30]; let anchor = 'topRight';
// const buttonExitFullscreen = new Button(fullscreenButton, size, pos, anchor, canvas);
// buttons.exitFullscreen = buttonExitFullscreen;

// const clickButton = pos => {
//   for (let i=0; i<buttons.length; i++) {
//     console.log(`checking button ${i}`);
//     Object.values(buttons)[i].didClick(pos);
//   }
// };

// export default buttons;