// Keyboard + mouse input. Actions are edge-triggered and consumed once per
// frame by the game loop (takeActions). Held state (jump held, duck held,
// horizontal) is read live. Mouse: left hold = jump/glide, right click = dash.
const ACTION_CONFIRM = 1;
const ACTION_PAUSE = 2;
const ACTION_DASH = 4;
const ACTION_MUTE = 8;
const ACTION_RESTART = 16;

const KEYMAP = {
  KeyW: 'jump', ArrowUp: 'jump', Space: 'jump',
  KeyS: 'duck', ArrowDown: 'duck',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyE: 'dash',
  KeyP: 'pause', Escape: 'pause',
  KeyM: 'mute',
  KeyR: 'restart', Enter: 'restart',
};

function createInput(canvas) {
  const held = { jump: false, duck: false, left: false, right: false };
  let queued = 0;
  let jumpPressedAt = -1;

  function press(action) {
    if (action === 'jump') { held.jump = true; jumpPressedAt = performance.now(); queued |= ACTION_CONFIRM; }
    else if (action === 'duck') held.duck = true;
    else if (action === 'left') held.left = true;
    else if (action === 'right') held.right = true;
    else if (action === 'dash') queued |= ACTION_DASH;
    else if (action === 'pause') queued |= ACTION_PAUSE;
    else if (action === 'mute') queued |= ACTION_MUTE;
    else if (action === 'restart') queued |= ACTION_RESTART;
  }

  function release(action) {
    if (action === 'jump') held.jump = false;
    else if (action === 'duck') held.duck = false;
    else if (action === 'left') held.left = false;
    else if (action === 'right') held.right = false;
  }

  window.addEventListener('keydown', (event) => {
    const action = KEYMAP[event.code];
    if (!action) return;
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'ArrowDown') event.preventDefault();
    if (event.repeat) return;
    press(action);
  });
  window.addEventListener('keyup', (event) => {
    const action = KEYMAP[event.code];
    if (action) release(action);
  });

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    if (event.button === 0) press('jump');
    else if (event.button === 2) queued |= ACTION_DASH;
  });
  window.addEventListener('mouseup', (event) => {
    if (event.button === 0) release('jump');
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('touchstart', (event) => { event.preventDefault(); press('jump'); }, { passive: false });
  canvas.addEventListener('touchend', (event) => { event.preventDefault(); release('jump'); }, { passive: false });

  return {
    held,
    takeActions() {
      const actions = queued;
      queued = 0;
      return actions;
    },
    jumpPressedAt() { return jumpPressedAt; },
    direction() {
      return (held.right ? 1 : 0) - (held.left ? 1 : 0);
    },
  };
}
