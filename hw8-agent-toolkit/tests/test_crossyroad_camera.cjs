// Focused camera regression tests. Runs production movement/camera functions
// with deterministic time and safe lanes; no browser, WebGL, or Feature Check.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(process.env.CAMERA_SOURCE ||
  path.resolve(__dirname, '../../crossyroad/game.js'), 'utf8');

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `production function ${name} exists`);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`unterminated function ${name}`);
}

function harness() {
  const context = vm.createContext({});
  vm.runInContext(`
    const TILE = 4, CAMERA_SIZE = 25;
    let currentLaneIndex = 0, currentGridX = 0, highestLane = 0;
    let score = 0, gameOver = false, cameraZ = 0, previous = 0, clock = 0;
    const performance = {now: () => clock * 1000};
    const THREE = {MathUtils:{lerp:(a,b,t) => (1-t)*a+t*b}};
    function vector() {return {x:0, y:0, z:0,
      set(x,y,z) {this.x=x; this.y=y; this.z=z;}};}
    const chicken = {position:vector(), rotation:{y:0}};
    const camera = {position:vector(), aim:vector(),
      lookAt(x,y,z) {this.aim.set(x,y,z);}};
    const skyline = {position:vector()};
    const document = {getElementById: () => ({textContent:''})};
    const lanes = [];
    function createLane(index) {lanes[index] = {type:'plaza', objects:[]};}
    for (let i=0; i<50; i++) createLane(i);
    function checkLanding() {}
    function checkCars() {}
    function updateObjects() {}
    function updateRiverPlayer() {}
    function requestAnimationFrame() {}
    const scene = {}, renderer = {render() {}};
    ${source.slice(source.indexOf('let hopping = false;'), source.indexOf('// ARROW KEYS ONLY'))}
    ${functionSource('finishHop')}
    ${functionSource('updateCamera')}
    ${functionSource('animate')}
    updateCamera();
  `, context);
  const run = code => vm.runInContext(code, context);
  return {
    run,
    state: () => JSON.parse(run(`JSON.stringify({cameraZ, currentLaneIndex,
      currentGridX, highestLane, score, hopping, camera, skyline, chicken})`)),
    frame(fps = 60) {run(`clock += ${1 / fps}; animate();`);},
    settle() {for (let i = 0; i < 1000; i++) this.frame();},
    move(dx, laneMove, check = () => {}, fps = 60) {
      run(`tryMove(${dx}, ${laneMove});`);
      let frames = 0;
      do {this.frame(fps); check(this.state()); assert.ok(++frames < 100);}
      while (this.state().hopping);
    },
  };
}

// Project a point using the same orthographic camera basis/frustum as game.js.
// This checks geometric visibility, not rendered pixels or scene occlusion.
function projected(state, point, aspect = 16 / 9) {
  const {position:p, aim:a} = state.camera;
  const length = Math.hypot(p.x-a.x, p.y-a.y, p.z-a.z);
  const back = [(p.x-a.x)/length, (p.y-a.y)/length, (p.z-a.z)/length];
  const horizontal = Math.hypot(back[0], back[2]);
  const right = [back[2]/horizontal, 0, -back[0]/horizontal];
  const up = [back[1]*right[2], back[2]*right[0]-back[0]*right[2], -back[1]*right[0]];
  const relative = [point.x-a.x, point.y-a.y, point.z-a.z];
  const dot = (v,w) => v.reduce((sum,n,i) => sum+n*w[i],0);
  return {x:dot(relative,right)/(12.5*aspect), y:dot(relative,up)/12.5,
    depth:dot([p.x-point.x,p.y-point.y,p.z-point.z],back)};
}

function assertVisible(state) {
  // Main body center (local y=1.45, scale=1.15) must remain visible.
  // This does not require every extremity to remain fully inside the viewport.
  for (const height of [1.45 * 1.15]) {
    const point = {...state.chicken.position, y:state.chicken.position.y+height};
    const ndc = projected(state, point);
    assert.ok(Math.abs(ndc.x)<1 && Math.abs(ndc.y)<1 &&
      ndc.depth>0.1 && ndc.depth<230,
      `lane ${state.currentLaneIndex}, cameraZ ${state.cameraZ.toFixed(3)}, projected ${JSON.stringify(ndc)}`);
  }
}

test('sideways hops preserve settled camera; residual forward easing is independent of X/Y', () => {
  const h = harness();
  for (const lane of [0, 12]) {
    while (h.state().currentLaneIndex < lane) h.move(0, 1);
    h.settle();
    const before = h.state();
    for (const dx of [1,1,1,-1,-1,-1,-1,-1,-1,1,1,1]) {
      h.move(dx, 0, s => {
        assert.ok(Math.abs(s.cameraZ-before.cameraZ)<1e-9);
        assert.equal(s.camera.position.x,8);
        assert.equal(s.camera.position.y,16);
        assert.equal(s.camera.aim.x,0);
        assert.equal(s.camera.aim.y,0);
      });
    }
  }
  const a = harness(), b = harness();
  for (let i=0;i<8;i++) {a.move(0,1); b.move(0,1);}
  a.run('tryMove(1,0);');
  for (let i=0;i<10;i++) {a.frame(); b.frame();
    assert.equal(a.state().cameraZ,b.state().cameraZ);}
});

test('forward lanes keep original three-lane buffer and 0.035 easing without snapping', () => {
  const h = harness();
  for (let lane=1;lane<=20;lane++) {
    let previous = h.state().cameraZ;
    h.move(0,1,s => {
      const target = -Math.max(0,s.currentLaneIndex-3)*4;
      assert.ok(Math.abs(s.cameraZ-(previous+(target-previous)*0.035))<1e-10);
      assert.ok(s.cameraZ<=previous+1e-10 && s.cameraZ>=target-1e-10);
      previous = s.cameraZ;
    });
  }
  h.settle();
  assert.ok(Math.abs(h.state().cameraZ+68)<1e-9);
  assert.equal(h.state().score,20);
});

test('lane 20 to lane 0 stays visible at 30/60/120 fps and grid X -3/0/3', () => {
  for (const fps of [30,60,120]) for (const gridX of [-3,0,3]) {
  const h = harness();
  for (let i=0;i<20;i++) h.move(0,1);
  h.settle();
  for (let i=0;i<Math.abs(gridX);i++) h.move(Math.sign(gridX),0);
  for (let i=0;i<20;i++) h.move(0,-1,assertVisible,fps);
  h.settle();
  assertVisible(h.state());
  assert.equal(h.state().currentLaneIndex,0);
  assert.equal(h.state().highestLane,20);
  assert.equal(h.state().score,20);
  assert.ok(Math.abs(h.state().cameraZ)<1e-9);
  h.move(0,1,assertVisible);
  assert.equal(h.state().score,20);
  }
});
