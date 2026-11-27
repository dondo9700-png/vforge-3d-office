import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  TEAM, MEETING, MEETING_SEATS, LOUNGE_SPOTS, LOUNGE_QUEUE,
  MEETING_SCRIPT, CHATTER, TODAY,
} from './data.js';
import { buildRoom } from './room.js';
import { buildCharacter } from './characters.js';
import { lerpAngle, canvas2d, tex } from './lib.js';

const $ = (sel) => document.querySelector(sel);

// ------------------------------------------------------------ renderer
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

// soft warm backdrop
const bgCanvas = canvas2d(8, 256);
{
  const c = bgCanvas.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#f8ecda');
  g.addColorStop(0.55, '#efdec6');
  g.addColorStop(1, '#e2cdae');
  c.fillStyle = g;
  c.fillRect(0, 0, 8, 256);
}
scene.background = tex(bgCanvas);
scene.fog = new THREE.Fog('#edddc6', 62, 120);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.5, 260);
camera.position.set(16, 17, 21);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
$('#labels').appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.6, -0.4);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.72;
controls.zoomSpeed = 0.9;
controls.panSpeed = 0.75;
controls.minDistance = 5;
controls.maxDistance = 62;
controls.minPolarAngle = 0.18;
controls.maxPolarAngle = 1.33;
controls.screenSpacePanning = false;
controls.update();

// ------------------------------------------------------------ lights
const hemi = new THREE.HemisphereLight(0xfff6e8, 0xb99b7d, 1.0);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffedd4, 2.35);
key.position.set(12, 18, 10);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 60;
key.shadow.camera.left = -17;
key.shadow.camera.right = 17;
key.shadow.camera.top = 17;
key.shadow.camera.bottom = -17;
key.shadow.bias = -0.0005;
key.shadow.normalBias = 0.035;
scene.add(key);

const fill = new THREE.DirectionalLight(0xd6e6ff, 0.4);
fill.position.set(-10, 10, 12);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffe2bd, 0.4);
rim.position.set(-4, 7, -14);
scene.add(rim);

// ------------------------------------------------------------ room
const room = buildRoom(scene);
const pickables = [...room.pickables];

// ------------------------------------------------------------ agents
const agents = [];
const byId = new Map();

const STATE_LABEL = {
  work: '작업 중',
  walk: '이동 중',
  meeting: '회의 중',
  charging: '충전 중',
  queue: '충전 대기',
  idle: '집중 모드',
};

function labelFor(a) {
  if (a.state === 'work' && a.kind !== 'human') return '집중 모드';
  return STATE_LABEL[a.state] || '작업 중';
}

const spots = LOUNGE_SPOTS.map((s) => ({ ...s, occupant: null }));

TEAM.forEach((cfg, index) => {
  const built = buildCharacter(cfg);
  const group = built.group;
  group.position.set(cfg.home.x, 0, cfg.home.z);
  group.rotation.y = cfg.home.yaw;
  scene.add(group);
  pickables.push(group);

  const anchor = document.createElement('div');
  anchor.className = 'bubble-anchor';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  anchor.appendChild(bubble);
  const label = new CSS2DObject(anchor);
  label.position.set(0, built.anchorY, 0);
  group.add(label);

  const isTeamMember = cfg.meeting !== null;
  const seat = cfg.meeting !== null ? MEETING_SEATS[cfg.meeting] : null;

  const agent = {
    ...cfg,
    group,
    parts: built.parts,
    label,
    anchor,
    bubble,
    seat,
    pose: cfg.home.pose,
    state: 'work',
    path: [],
    onArrive: null,
    energy: 0,
    threshold: 25,
    decay: 0,
    speed: 1.45 + Math.random() * 0.22,
    walkPhase: index * 1.3,
    phase: index * 0.7,
    legAngle: cfg.home.pose === 'sit' ? -1.32 : 0,
    targetY: 0,
    sitY: 0,
    spot: null,
    queueing: false,
    bubbleUntil: 0,
    bubbleSticky: false,
    blinkAt: 2 + Math.random() * 4,
    pair: isTeamMember,
  };

  if (isTeamMember) {
    agent.energy = 55 + Math.random() * 42;
    agent.threshold = 22 + Math.random() * 14;
    agent.decay = 0.75 + Math.random() * 0.5;
  } else {
    agent.energy = 68 + Math.random() * 26;
    agent.threshold = 20;
    agent.decay = 0.05 + Math.random() * 0.06;
  }
  if (cfg.id === 'dev') agent.energy = 24;
  if (cfg.id === 'pd') agent.energy = 38;

  agents.push(agent);
  byId.set(cfg.id, agent);
});

// ------------------------------------------------------------ bubbles
function showBubble(a, text, kind = '', duration = 0) {
  if (!a || !a.bubble) return;
  a.bubble.textContent = text;
  a.bubble.className = 'bubble show' + (kind ? ' ' + kind : '');
  a.bubbleSticky = duration === 0;
  a.bubbleUntil = duration > 0 ? performance.now() + duration * 1000 : 0;
}

function hideBubble(a) {
  if (!a || !a.bubble) return;
  a.bubble.className = 'bubble';
  a.bubbleSticky = false;
  a.bubbleUntil = 0;
}

// ------------------------------------------------------------ walking
const GATE_L = { x: MEETING.x - 3.75, z: MEETING.z };
const GATE_R = { x: MEETING.x + 3.75, z: MEETING.z };

function approachPoint(seat) {
  const dx = seat.x - MEETING.x;
  const dz = seat.z - MEETING.z;
  const d = Math.hypot(dx, dz) || 1;
  return { x: seat.x + (dx / d) * 0.95, z: seat.z + (dz / d) * 0.95 };
}

function gateFor(seat) {
  return seat.x < MEETING.x ? GATE_L : GATE_R;
}

function goTo(a, points, onArrive) {
  if (!points || !points.length) {
    a.state = 'work';
    return;
  }
  a.path = points.map((p) => ({ x: p.x, z: p.z }));
  a.onArrive = onArrive || null;
  a.state = 'walk';
  a.legAngle = 0;
  a.targetY = 0;
  a.queueing = false;
  if (a.bubbleSticky) hideBubble(a);
}

function stepWalk(a, dt) {
  if (!a.path.length) return;
  const tgt = a.path[0];
  const dx = tgt.x - a.group.position.x;
  const dz = tgt.z - a.group.position.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.075) {
    a.group.position.x = tgt.x;
    a.group.position.z = tgt.z;
    a.path.shift();
    if (!a.path.length) {
      const cb = a.onArrive;
      a.onArrive = null;
      if (cb) cb();
    }
    return;
  }
  const step = Math.min(d, a.speed * dt);
  a.group.position.x += (dx / d) * step;
  a.group.position.z += (dz / d) * step;
  const yaw = Math.atan2(dx, dz);
  a.group.rotation.y = lerpAngle(a.group.rotation.y, yaw, Math.min(1, dt * 9));
  a.walkPhase += dt * a.speed * 6.5;
}

// ------------------------------------------------------------ paths
function meetingPath(a) {
  const seat = a.seat;
  const gate = gateFor(seat);
  const pts = [];
  if (a.home.row === 1) {
    pts.push({ x: a.home.aisle, z: -2.7 }, { x: a.home.aisle, z: 0.7 });
  } else if (a.home.row === 2) {
    pts.push({ x: a.home.x, z: 0.7 });
  } else {
    pts.push({ x: -1.3, z: 0.7 });
  }
  pts.push({ x: gate.x, z: gate.z });
  pts.push(approachPoint(seat));
  pts.push({ x: seat.x, z: seat.z });
  return pts;
}

function leaveMeetingPath(a) {
  const seat = a.seat;
  const gate = gateFor(seat);
  const pts = [approachPoint(seat), { x: gate.x, z: gate.z }];
  if (a.home.row === 1) {
    pts.push({ x: a.home.aisle, z: 0.7 }, { x: a.home.aisle, z: -2.7 });
  } else if (a.home.row === 2) {
    pts.push({ x: a.home.x, z: 0.7 });
  } else {
    pts.push({ x: -1.3, z: 0.7 });
  }
  pts.push({ x: a.home.x, z: a.home.z });
  return pts;
}

function loungePath(a, spot) {
  const pts = [];
  if (a.home.row === 1) {
    pts.push({ x: a.home.aisle, z: -2.7 }, { x: a.home.aisle, z: 0.7 });
  } else if (a.home.row === 2) {
    pts.push({ x: a.home.x, z: 0.7 });
  } else if (a.kind === 'mascot') {
    pts.push({ x: -2.9, z: 0.7 });
  }
  pts.push({ x: -6.6, z: 3.4 });
  pts.push({ x: spot.x, z: spot.z });
  return pts;
}

function loungePathFromMeeting(a, spot) {
  const gate = gateFor(a.seat);
  return [
    approachPoint(a.seat),
    { x: gate.x, z: gate.z },
    { x: gate.x, z: 7.15 },
    { x: spot.x, z: spot.z },
  ];
}

function deskPathFromLounge(a) {
  const pts = [{ x: -6.6, z: 3.4 }];
  if (a.home.row === 1) {
    pts.push({ x: a.home.aisle, z: 0.7 }, { x: a.home.aisle, z: -2.7 });
    pts.push({ x: a.home.x, z: a.home.z });
  } else if (a.home.row === 2) {
    pts.push({ x: a.home.x, z: 0.7 }, { x: a.home.x, z: a.home.z });
  } else {
    pts.push({ x: -2.9, z: 0.7 }, { x: a.home.x, z: a.home.z });
  }
  return pts;
}

// ------------------------------------------------------------ states
let meetingActive = false;

function sitAtDesk(a) {
  a.state = 'work';
  a.legAngle = a.home.pose === 'sit' ? -1.32 : 0;
  a.targetY = 0;
  a.group.rotation.y = a.home.yaw;
}

function arriveAtDesk(a) {
  a.group.position.x = a.home.x;
  a.group.position.z = a.home.z;
  sitAtDesk(a);
  if (a.energy < a.threshold && !meetingActive) {
    // arrived home still drained -> rest briefly, then go charge again
    a.energy = a.threshold + 4;
  }
}

function releaseSpot(a) {
  if (a.spot) {
    a.spot.occupant = null;
    a.spot = null;
  }
}

function sendToLounge(a) {
  if (a.state === 'charging') return;
  hideBubble(a);

  if (a.state === 'queue') {
    trySeatOnLounge(a);
    return;
  }

  const spot = spots.find((s) => !s.occupant);
  if (!spot) {
    const path = loungePath(a, LOUNGE_QUEUE);
    goTo(a, path, () => {
      a.state = 'queue';
      a.queueing = true;
      a.legAngle = 0;
      a.group.rotation.y = 0.9;
      showBubble(a, '충전 자리 기다리는 중…', 'warn');
    });
    return;
  }

  spot.occupant = a.id;
  a.spot = spot;
  const path = loungePath(a, spot);
  goTo(a, path, () => {
    a.state = 'charging';
    a.legAngle = -1.45;
    a.targetY = spot.sitY;
    a.sitY = spot.sitY;
    a.group.rotation.y = spot.yaw;
    showBubble(a, `⚡ 충전 중 ${Math.round(a.energy)}%`, 'charge');
  });
}

function trySeatOnLounge(a) {
  const spot = spots.find((s) => !s.occupant);
  if (!spot) return;
  spot.occupant = a.id;
  a.spot = spot;
  const path = [{ x: spot.x, z: spot.z }];
  goTo(a, path, () => {
    a.state = 'charging';
    a.legAngle = -1.45;
    a.targetY = spot.sitY;
    a.sitY = spot.sitY;
    a.group.rotation.y = spot.yaw;
    showBubble(a, `⚡ 충전 중 ${Math.round(a.energy)}%`, 'charge');
  });
}

function sendBackToDesk(a) {
  if (!a.home) return;
  const path = deskPathFromLounge(a);
  goTo(a, path, () => arriveAtDesk(a));
  showBubble(a, '충전 완료! 다시 작업하러 갈게요 ⚡', 'charge', 2.6);
}

function callMeeting() {
  if (meetingActive) {
    endMeeting();
    return;
  }
  meetingActive = true;
  meetingCursor = -1;
  meetingTimer = 1.4;
  setMeetingUI(true);

  agents.forEach((a) => {
    if (a.meeting === null) return;
    releaseSpot(a);
    hideBubble(a);
    goTo(a, meetingPath(a), () => {
      a.state = 'meeting';
      a.legAngle = -1.35;
      a.targetY = 0.02;
      a.group.rotation.y = Math.atan2(MEETING.x - a.seat.x, MEETING.z - a.seat.z);
    });
  });
}

function endMeeting() {
  meetingActive = false;
  setMeetingUI(false);
  meetingCursor = -1;
  agents.forEach((a) => {
    if (a.meeting === null) return;
    hideBubble(a);
    if (a.energy < a.threshold) {
      // too tired to work: go rest, compute path from the meeting table
      const spot = spots.find((s) => !s.occupant);
      if (spot) {
        spot.occupant = a.id;
        a.spot = spot;
        const path = loungePathFromMeeting(a, spot);
        goTo(a, path, () => {
          a.state = 'charging';
          a.legAngle = -1.45;
          a.targetY = spot.sitY;
          a.sitY = spot.sitY;
          a.group.rotation.y = spot.yaw;
          showBubble(a, `⚡ 충전 중 ${Math.round(a.energy)}%`, 'charge');
        });
      } else {
        goTo(a, leaveMeetingPath(a), () => arriveAtDesk(a));
      }
    } else {
      goTo(a, leaveMeetingPath(a), () => arriveAtDesk(a));
    }
  });
}

// ------------------------------------------------------------ meeting script
let meetingCursor = -1;
let meetingTimer = 0;

function updateMeetingScript(dt) {
  if (!meetingActive) return;
  meetingTimer -= dt;
  if (meetingTimer > 0) return;

  if (meetingCursor >= 0) {
    const prev = byId.get(MEETING_SCRIPT[meetingCursor].id);
    if (prev) hideBubble(prev);
  }
  meetingCursor = (meetingCursor + 1) % MEETING_SCRIPT.length;
  const line = MEETING_SCRIPT[meetingCursor];
  const speaker = byId.get(line.id);
  if (speaker) {
    showBubble(speaker, line.text, 'blue');
  }
  meetingTimer = 3.6;
}

// ------------------------------------------------------------ per-frame agent update
function animateAgent(a, dt, t) {
  const p = a.parts;
  const walking = a.state === 'walk';

  if (walking) {
    const sw = Math.sin(a.walkPhase) * 0.55;
    p.leftLeg.rotation.x = sw;
    p.rightLeg.rotation.x = -sw;
    p.leftArm.rotation.x = -sw * 0.7;
    p.rightArm.rotation.x = sw * 0.7;
    if (p.head) p.head.rotation.x = 0;
  } else {
    const lp = Math.min(1, dt * 9);
    p.leftLeg.rotation.x += (a.legAngle - p.leftLeg.rotation.x) * lp;
    p.rightLeg.rotation.x += (a.legAngle - p.rightLeg.rotation.x) * lp;

    let armX = 0.05;
    if (a.state === 'work' && a.home.pose === 'sit') {
      armX = -0.92 + Math.sin(t * 6.5 + a.phase) * 0.06;
    } else if (a.state === 'meeting') {
      armX = -0.52 + Math.sin(t * 2.1 + a.phase) * 0.04;
    } else if (a.state === 'charging') {
      armX = -0.3;
    } else if (a.kind === 'ai') {
      armX = -0.16 + Math.sin(t * 1.3 + a.phase) * 0.06;
    } else if (a.kind === 'mascot') {
      armX = 0.02 + Math.sin(t * 1.6 + a.phase) * 0.05;
    }
    p.leftArm.rotation.x += (armX - p.leftArm.rotation.x) * Math.min(1, dt * 7);
    p.rightArm.rotation.x += (armX - p.rightArm.rotation.x) * Math.min(1, dt * 7);

    if (p.head) {
      const targetHead = a.state === 'work' && a.home.pose === 'sit' ? -0.07 : Math.sin(t * 0.9 + a.phase) * 0.02;
      p.head.rotation.x += (targetHead - p.head.rotation.x) * Math.min(1, dt * 4);
    }
  }

  // vertical placement (sitting low, AI floating)
  const floatY = a.kind === 'ai' ? Math.sin(t * 1.25 + a.phase) * 0.025 : 0;
  const bob = walking ? Math.abs(Math.sin(a.walkPhase)) * 0.035 : 0;
  const targetY = (a.state === 'charging' ? a.sitY : 0) + floatY + bob;
  a.group.position.y += (targetY - a.group.position.y) * Math.min(1, dt * 8);

  // blinking
  a.blinkAt -= dt;
  if (a.blinkAt <= 0) {
    a.blinkAt = 2.4 + Math.random() * 4.5;
    if (p.eyes) {
      p.eyes.forEach((e) => {
        e.scale.y = 0.12;
      });
    }
  }
  if (p.eyes) {
    p.eyes.forEach((e) => {
      if (e.scale.y < 1) e.scale.y = Math.min(1, e.scale.y + dt * 5.5);
    });
  }

  // bubble expiry
  if (!a.bubbleSticky && a.bubbleUntil && performance.now() > a.bubbleUntil) {
    hideBubble(a);
  }
}

function updateEnergy(a, dt) {
  if (meetingActive && a.state === 'meeting') {
    a.energy = Math.max(0, a.energy - 0.42 * dt);
    return;
  }
  if (a.state === 'charging') {
    a.energy = Math.min(100, a.energy + 9.5 * dt);
    if (a.bubbleSticky) {
      a.bubble.textContent = `⚡ 충전 중 ${Math.round(a.energy)}%`;
    }
    if (a.energy >= 99.6) {
      releaseSpot(a);
      sendBackToDesk(a);
      return;
    }
    return;
  }
  const stateFactor = a.state === 'walk' ? 0.55 : 1;
  if (a.kind === 'human' || a.kind === 'mascot') {
    a.energy = Math.max(0, a.energy - a.decay * stateFactor * dt);
  } else if (a.kind === 'ai') {
    // AI 파트너는 콘솔에서 스스로 충전해요
    if (a.energy < 62) a.energy = Math.min(100, a.energy + 2.4 * dt);
    else a.energy = Math.max(0, a.energy - 0.1 * dt);
  }

  if (a.meeting !== null) {
    if (!meetingActive && (a.state === 'work') && a.energy <= a.threshold) {
      sendToLounge(a);
    }
  }
  if (a.state === 'queue') {
    trySeatOnLounge(a);
  }
}

// ------------------------------------------------------------ ui state
const badge = $('#badge');
const badgeText = $('#badge-text');
const badgeTeam = $('#badge-team');
const btnMeeting = $('#btn-meeting');
const btnBoard = $('#btn-board');
const memberCard = $('#member-card');
const dashboard = $('#dashboard');
const dashList = $('#dash-list');
const dashStats = $('#dash-stats');
const dashClock = $('#dash-clock');
const hint = $('#hint');

badgeTeam.textContent = `팀 ${agents.length}`;

let selectedId = null;
let dashRows = [];
let dashboardOpen = false;

function setMeetingUI(on) {
  badge.classList.toggle('meeting', on);
  badgeText.textContent = on ? '회의 중' : '운영 중';
  btnMeeting.textContent = on ? '🏠 자리로 복귀' : '📞 회의 소집';
  btnMeeting.classList.toggle('active', on);
}

function stateClass(state) {
  if (state === 'meeting') return 'meeting';
  if (state === 'charging' || state === 'queue') return 'charge';
  if (state === 'walk') return 'walk';
  return '';
}

function selectAgent(a) {
  selectedId = a.id;
  $('#mc-dot').style.background = a.color;
  $('#mc-name').textContent = a.name;
  $('#mc-role').textContent = a.role;
  const st = $('#mc-state');
  st.textContent = labelFor(a);
  st.className = 'mc-state ' + stateClass(a.state);
  $('#mc-task').textContent = a.task;
  $('#mc-tip').textContent = a.tip || '';
  memberCard.hidden = false;

  if (a.state === 'meeting') showBubble(a, '회의 중이에요 👀', 'blue', 4);
  else if (a.state === 'charging') showBubble(a, `⚡ 충전 중 ${Math.round(a.energy)}%`, 'charge');
  else if (a.state === 'work') showBubble(a, a.task, 'blue', 5);
  else if (a.state === 'walk') showBubble(a, '이동 중이에요 🚶', '', 4);
}

function refreshCard() {
  if (!selectedId || memberCard.hidden) return;
  const a = byId.get(selectedId);
  if (!a) return;
  const st = $('#mc-state');
  st.textContent = labelFor(a);
  st.className = 'mc-state ' + stateClass(a.state);
  const pct = Math.round(a.energy);
  $('#mc-energy').textContent = `${pct}%`;
  const bar = $('#mc-bar');
  bar.style.width = `${pct}%`;
  bar.className = pct <= 28 ? 'crit' : pct <= 55 ? 'low' : '';
}

$('#mc-close').addEventListener('click', () => {
  memberCard.hidden = true;
  selectedId = null;
});

// dashboard
function buildDashboard() {
  dashStats.innerHTML = TODAY.stats
    .map((s) => `<div class="stat"><span>${s.label}</span><strong>${s.value}</strong><em>${s.note}</em></div>`)
    .join('');
  dashList.innerHTML = '';
  dashRows = [];
  agents.forEach((a) => {
    const row = document.createElement('div');
    row.className = 'dash-row';
    row.innerHTML = `
      <div class="dr-name"><i style="background:${a.color}"></i><b>${a.name}</b></div>
      <span class="dr-role">${a.role}</span>
      <span class="dr-state">작업 중</span>
      <div class="dr-energy"><div class="bar"><i></i></div><span>100%</span></div>`;
    dashList.appendChild(row);
    dashRows.push({
      a,
      state: row.querySelector('.dr-state'),
      bar: row.querySelector('.bar > i'),
      pct: row.querySelector('.dr-energy span'),
    });
  });
  refreshDashboard(true);
}

function refreshDashboard() {
  if (!dashRows.length) return;
  dashRows.forEach((r) => {
    const a = r.a;
    const label = labelFor(a);
    r.state.textContent = label;
    r.state.className = 'dr-state ' + stateClass(a.state);
    const pct = Math.round(a.energy);
    r.bar.style.width = `${pct}%`;
    r.bar.className = pct <= 28 ? 'crit' : pct <= 55 ? 'low' : '';
    r.pct.textContent = `${pct}%`;
  });
  const now = new Date();
  dashClock.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function openDashboard() {
  dashboardOpen = true;
  dashboard.hidden = false;
  refreshDashboard();
}

function closeDashboard() {
  dashboardOpen = false;
  dashboard.hidden = true;
}

btnBoard.addEventListener('click', () => {
  if (dashboardOpen) closeDashboard();
  else openDashboard();
});
$('#dash-close').addEventListener('click', closeDashboard);
$('#dash-backdrop').addEventListener('click', closeDashboard);

// ------------------------------------------------------------ camera presets
const PRESETS = {
  all: { p: [18.0, 16.8, 22.2], t: [1.0, 0.55, 0.7], w: 27.5, h: 19.5 },
  meeting: { p: [6.6, 6.4, 10.4], t: [2.2, 0.7, 3.4], w: 10.5, h: 8 },
  lounge: { p: [-8.4, 6.4, 14.2], t: [-4.9, 0.7, 5.1], w: 10, h: 7 },
  board: { p: [4.6, 3.9, 1.6], t: [4.6, 2.3, -7.6], w: 8, h: 5.6 },
};

let camTween = null;
let currentPreset = 'all';
let userMoved = false;

function markPreset(name) {
  currentPreset = name;
  document.querySelectorAll('.chip').forEach((c) => {
    c.classList.toggle('on', c.dataset.preset === name);
  });
}

function presetVectors(name) {
  const p = PRESETS[name];
  const target = new THREE.Vector3(p.t[0], p.t[1], p.t[2]);
  const dir = new THREE.Vector3(p.p[0], p.p[1], p.p[2]).sub(target);
  const baseD = dir.length() || 1;
  dir.normalize();
  let d = baseD;
  if (camera.aspect < 1.2) {
    // portrait / narrow screens: pull back enough that the diorama still fits
    const halfTan = Math.tan((camera.fov * Math.PI) / 360);
    const fit = Math.max(p.w / (2 * halfTan * camera.aspect), p.h / (2 * halfTan));
    d = Math.max(baseD, fit);
    if (camera.aspect < 0.95) {
      dir.y *= 1.28;
      dir.normalize();
    }
  }
  return { pos: target.clone().add(dir.multiplyScalar(d)), target };
}

function setPreset(name, instant = false) {
  if (!PRESETS[name]) return;
  const { pos, target } = presetVectors(name);
  if (instant) {
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
  } else {
    camTween = {
      fromP: camera.position.clone(),
      fromT: controls.target.clone(),
      toP: pos,
      toT: target,
      t: 0,
      dur: 1.0,
    };
  }
  markPreset(name);
}

controls.addEventListener('start', () => {
  userMoved = true;
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => setPreset(chip.dataset.preset));
});

// ------------------------------------------------------------ interaction
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let downInfo = null;
let hoverAt = 0;

function pickAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(pickables, true);
  for (const h of hits) {
    let o = h.object;
    while (o) {
      if (o.userData && o.userData.pick) return o.userData.pick;
      o = o.parent;
    }
  }
  return null;
}

canvas.addEventListener('pointerdown', (e) => {
  downInfo = { x: e.clientX, y: e.clientY, t: performance.now() };
  hint.classList.add('gone');
});

canvas.addEventListener('pointerup', (e) => {
  if (!downInfo) return;
  const dist = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
  const dt = performance.now() - downInfo.t;
  downInfo = null;
  if (dist > 9 || dt > 700) return;

  const pick = pickAt(e.clientX, e.clientY);
  if (!pick) return;
  if (pick.type === 'phone') {
    callMeeting();
  } else if (pick.type === 'board') {
    openDashboard();
  } else if (pick.type === 'agent') {
    const a = byId.get(pick.id);
    if (a) selectAgent(a);
  }
});

canvas.addEventListener('pointermove', (e) => {
  const now = performance.now();
  if (now - hoverAt < 70) return;
  hoverAt = now;
  if (e.pointerType === 'touch') return;
  const pick = pickAt(e.clientX, e.clientY);
  canvas.style.cursor = pick ? 'pointer' : 'grab';
});

btnMeeting.addEventListener('click', () => {
  callMeeting();
  hint.classList.add('gone');
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDashboard();
    memberCard.hidden = true;
    selectedId = null;
  }
  if (e.key === 'm' || e.key === 'M') callMeeting();
});

// ------------------------------------------------------------ board drawing
let boardTimer = 0;
let clockTimer = 0;

function boardModel() {
  return agents.map((a) => ({
    name: a.name,
    color: a.color,
    energy: a.energy,
    state: a.state === 'work' && a.kind !== 'human' ? 'idle' : a.state,
    stateLabel: labelFor(a),
  }));
}

// ------------------------------------------------------------ loop
const clock = new THREE.Clock();
let elapsed = 0;
let chatterTimer = 8;
let uiTimer = 0;
let started = false;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  // camera tween
  if (camTween) {
    camTween.t += dt / camTween.dur;
    const raw = Math.min(1, camTween.t);
    const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    camera.position.lerpVectors(camTween.fromP, camTween.toP, e);
    controls.target.lerpVectors(camTween.fromT, camTween.toT, e);
    if (raw >= 1) camTween = null;
  }

  agents.forEach((a) => {
    if (a.state === 'walk') stepWalk(a, dt);
    updateEnergy(a, dt);
    animateAgent(a, dt, elapsed);
  });

  updateMeetingScript(dt);

  // phone ring pulse
  if (room.phoneRing) {
    const ring = room.phoneRing;
    if (meetingActive) {
      ring.material.color.set('#35d39c');
      ring.material.opacity = 0.32 + Math.sin(elapsed * 3) * 0.12;
      ring.scale.setScalar(1.0);
    } else {
      const p = (elapsed * 0.75) % 1;
      ring.scale.setScalar(1 + p * 0.85);
      ring.material.opacity = 0.55 * (1 - p);
      ring.material.color.set('#5f9bff');
    }
  }
  if (room.phoneLed) {
    room.phoneLed.material.emissiveIntensity = 1.4 + Math.sin(elapsed * (meetingActive ? 6 : 2.2)) * 0.7;
  }

  // ambient chatter
  chatterTimer -= dt;
  if (chatterTimer <= 0) {
    chatterTimer = 9 + Math.random() * 9;
    const candidates = agents.filter((a) => a.state === 'work' && !a.bubbleSticky && (!a.bubbleUntil || performance.now() > a.bubbleUntil));
    if (candidates.length && Math.random() < 0.55) {
      const a = candidates[Math.floor(Math.random() * candidates.length)];
      const line = a.chatter && a.chatter.length ? a.chatter[Math.floor(Math.random() * a.chatter.length)] : CHATTER[0];
      showBubble(a, line, '', 4);
    }
  }

  // whiteboard + clock + ui
  boardTimer -= dt;
  if (boardTimer <= 0) {
    boardTimer = 0.45;
    room.drawBoard(room.board.canvas, boardModel());
    room.board.texture.needsUpdate = true;
  }
  clockTimer -= dt;
  if (clockTimer <= 0) {
    clockTimer = 1;
    room.drawClock();
  }
  uiTimer -= dt;
  if (uiTimer <= 0) {
    uiTimer = 0.35;
    refreshCard();
    if (dashboardOpen) refreshDashboard();
  }

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  if (!started) {
    started = true;
    window.__vfBooted = true;
    const loading = $('#loading');
    if (loading) {
      loading.classList.add('done');
      setTimeout(() => loading.remove(), 800);
    }
    setTimeout(() => hint.classList.add('gone'), 9000);
  }
}

// ------------------------------------------------------------ resize
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  labelRenderer.setSize(w, h);
  if (!userMoved) {
    camTween = null;
    setPreset(currentPreset, true);
  }
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 220));

// ------------------------------------------------------------ start
setPreset('all', true);
buildDashboard();
animate();

// gentle intro camera nudge
setTimeout(() => {
  if (!camTween) setPreset('all');
}, 120);

// 모바일 브라우저는 주소창이 접히며 뷰포트가 바뀌므로 한 번 더 프레이밍을 맞춘다
[350, 1100].forEach((ms) => {
  setTimeout(() => {
    if (!userMoved) {
      camTween = null;
      setPreset(currentPreset, true);
    }
  }, ms);
});

// expose a tiny debug handle (useful when checking the deployed page)
window.__vfOffice = {
  agents,
  callMeeting,
  endMeeting,
  camera,
  controls,
  renderer,
  get meetingActive() {
    return meetingActive;
  },
  setPreset,
  openDashboard,
  closeDashboard,
};
