import * as THREE from 'three';
import {
  mat, glowMat, box, cyl, sphere, roundedBoxGeo, canvas2d, tex, canvasPlane,
  roundRect, KR_FONT, rand,
} from './lib.js';
import { MEETING, MEETING_SEATS } from './data.js';

// ---------------------------------------------------------------- textures
function woodFloorTexture() {
  const c = canvas2d(512, 512);
  const x = c.getContext('2d');
  x.fillStyle = '#c69c70';
  x.fillRect(0, 0, 512, 512);
  const rnd = rand(17);
  const plankH = 64;
  for (let row = 0; row < 8; row++) {
    const shade = 0.9 + rnd() * 0.18;
    x.fillStyle = `rgb(${Math.round(198 * shade)},${Math.round(157 * shade)},${Math.round(112 * shade)})`;
    x.fillRect(0, row * plankH, 512, plankH - 2);
    x.strokeStyle = 'rgba(120,84,54,0.30)';
    x.lineWidth = 1.6;
    x.beginPath();
    x.moveTo(0, row * plankH + plankH - 1.5);
    x.lineTo(512, row * plankH + plankH - 1.5);
    x.stroke();
    // grain
    for (let i = 0; i < 7; i++) {
      const gy = row * plankH + 6 + rnd() * (plankH - 14);
      x.strokeStyle = `rgba(${120 + rnd() * 30},${86 + rnd() * 20},${58 + rnd() * 16},${0.06 + rnd() * 0.09})`;
      x.lineWidth = 0.8 + rnd() * 1.4;
      x.beginPath();
      x.moveTo(0, gy);
      for (let px = 0; px <= 512; px += 32) {
        x.lineTo(px, gy + Math.sin((px / 512) * Math.PI * (1.5 + rnd()) + rnd()) * 2.4);
      }
      x.stroke();
    }
    // vertical joints
    const joint = Math.floor(rnd() * 512);
    x.strokeStyle = 'rgba(110,76,48,0.22)';
    x.lineWidth = 1.4;
    x.beginPath();
    x.moveTo(joint, row * plankH);
    x.lineTo(joint, row * plankH + plankH - 2);
    x.stroke();
  }
  return c;
}

function skyTexture() {
  const c = canvas2d(512, 384);
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 384);
  g.addColorStop(0, '#a9d5f2');
  g.addColorStop(0.55, '#d3ecfb');
  g.addColorStop(1, '#f6f0e2');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 384);
  // clouds
  const rnd = rand(31);
  for (let i = 0; i < 6; i++) {
    const cx = 40 + rnd() * 430;
    const cy = 40 + rnd() * 150;
    const s = 0.7 + rnd() * 0.8;
    x.fillStyle = 'rgba(255,255,255,0.85)';
    for (let k = 0; k < 5; k++) {
      x.beginPath();
      x.ellipse(cx + (k - 2) * 22 * s, cy + Math.sin(k) * 6, 26 * s, 16 * s, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  // distant hills
  x.fillStyle = '#b7cfae';
  x.beginPath();
  x.moveTo(0, 300);
  x.quadraticCurveTo(120, 250, 240, 296);
  x.quadraticCurveTo(360, 336, 512, 286);
  x.lineTo(512, 384);
  x.lineTo(0, 384);
  x.closePath();
  x.fill();
  x.fillStyle = '#9dbf9a';
  x.beginPath();
  x.moveTo(0, 330);
  x.quadraticCurveTo(160, 292, 320, 332);
  x.quadraticCurveTo(420, 356, 512, 330);
  x.lineTo(512, 384);
  x.lineTo(0, 384);
  x.closePath();
  x.fill();
  return c;
}

function uiScreenTexture(variant) {
  const c = canvas2d(320, 200);
  const x = c.getContext('2d');
  const themes = [
    ['#eef4ff', '#2e6bff', '#9fc0ff'],
    ['#fff2f6', '#e8749a', '#ffc2d6'],
    ['#f0fbf6', '#12a37f', '#a9e8d4'],
    ['#fff8ec', '#e09a26', '#ffdca6'],
  ];
  const t = themes[variant % themes.length];
  x.fillStyle = t[0];
  x.fillRect(0, 0, 320, 200);
  x.fillStyle = t[1];
  x.fillRect(0, 0, 320, 26);
  x.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 3; i++) {
    x.beginPath();
    x.arc(240 + i * 14, 13, 4, 0, Math.PI * 2);
    x.fill();
  }
  x.fillStyle = 'rgba(255,255,255,0.85)';
  x.fillRect(16, 9, 60, 8);
  const rnd = rand(50 + variant);
  x.fillStyle = t[2];
  x.fillRect(16, 42, 96, 140);
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i === 2 ? t[1] : 'rgba(120,135,160,0.28)';
    x.fillRect(28, 54 + i * 15, 40 + rnd() * 42, 6);
  }
  for (let i = 0; i < 7; i++) {
    x.fillStyle = 'rgba(120,135,160,0.24)';
    x.fillRect(126, 46 + i * 18, 80 + rnd() * 96, 7);
  }
  x.fillStyle = t[1];
  x.globalAlpha = 0.85;
  x.fillRect(126, 172, 54, 10);
  x.globalAlpha = 1;
  return c;
}

function posterTexture(kind) {
  const c = canvas2d(256, 344);
  const x = c.getContext('2d');
  if (kind === 0) {
    x.fillStyle = '#f6ead6';
    x.fillRect(0, 0, 256, 344);
    x.fillStyle = '#2f4c7e';
    x.beginPath();
    x.arc(128, 150, 74, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#f2c14e';
    x.beginPath();
    x.arc(128, 150, 38, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#8a6a4a';
    x.font = `700 20px ${KR_FONT}`;
    x.textAlign = 'center';
    x.fillText('MAKE', 128, 268);
    x.fillText('THINGS', 128, 292);
  } else {
    x.fillStyle = '#eef2f8';
    x.fillRect(0, 0, 256, 344);
    x.strokeStyle = '#2f4c7e';
    x.lineWidth = 8;
    x.beginPath();
    x.moveTo(40, 250);
    x.bezierCurveTo(80, 90, 176, 90, 216, 250);
    x.stroke();
    x.fillStyle = '#e8746a';
    x.beginPath();
    x.arc(128, 168, 26, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#5a6478';
    x.font = `700 19px ${KR_FONT}`;
    x.textAlign = 'center';
    x.fillText('VFORGE', 128, 292);
    x.font = `600 13px ${KR_FONT}`;
    x.fillText('AI WORKROOM', 128, 314);
  }
  return c;
}

function neonTexture() {
  const c = canvas2d(512, 160);
  const x = c.getContext('2d');
  x.clearRect(0, 0, 512, 160);
  x.font = `800 96px ${KR_FONT}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.shadowColor = '#7fb2ff';
  x.shadowBlur = 34;
  x.fillStyle = '#cfe0ff';
  x.fillText('VFORGE', 256, 78);
  x.shadowBlur = 14;
  x.fillStyle = '#ffffff';
  x.fillText('VFORGE', 256, 78);
  return c;
}

function plaqueTexture(text, sub, color = '#f2a93b') {
  const c = canvas2d(256, 128);
  const x = c.getContext('2d');
  x.clearRect(0, 0, 256, 128);
  x.fillStyle = 'rgba(255,253,248,0.96)';
  roundRect(x, 4, 4, 248, 120, 26);
  x.fill();
  x.fillStyle = color;
  x.beginPath();
  x.arc(46, 64, 26, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = '#fff';
  x.font = `800 30px ${KR_FONT}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('⚡', 46, 66);
  x.fillStyle = '#2a3140';
  x.textAlign = 'left';
  x.font = `800 34px ${KR_FONT}`;
  x.fillText(text, 84, 54);
  x.fillStyle = '#7b8497';
  x.font = `600 20px ${KR_FONT}`;
  x.fillText(sub, 86, 86);
  return c;
}

function namePlateTexture(title, name) {
  const c = canvas2d(256, 96);
  const x = c.getContext('2d');
  x.fillStyle = '#2f4c7e';
  roundRect(x, 2, 2, 252, 92, 16);
  x.fill();
  x.fillStyle = '#f7f1e6';
  x.font = `800 34px ${KR_FONT}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(name, 128, 40);
  x.fillStyle = 'rgba(247,241,230,0.75)';
  x.font = `600 20px ${KR_FONT}`;
  x.fillText(title, 128, 72);
  return c;
}

function signTexture(lines, accent = '#2e6bff') {
  const c = canvas2d(256, 200);
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,253,248,0.97)';
  roundRect(x, 4, 4, 248, 192, 20);
  x.fill();
  x.strokeStyle = accent;
  x.lineWidth = 3;
  roundRect(x, 8, 8, 240, 184, 17);
  x.stroke();
  x.textAlign = 'center';
  x.fillStyle = accent;
  x.font = `800 26px ${KR_FONT}`;
  x.fillText(lines[0], 128, 62);
  x.fillStyle = '#3c4557';
  x.font = `700 21px ${KR_FONT}`;
  x.fillText(lines[1], 128, 104);
  x.fillStyle = '#8b93a5';
  x.font = `600 17px ${KR_FONT}`;
  x.fillText(lines[2], 128, 140);
  return c;
}

// ---------------------------------------------------------------- pieces
function buildBase(scene) {
  const platform = box(22.6, 0.9, 18.8, '#b8895f', 0.22);
  platform.position.y = -0.45;
  platform.receiveShadow = true;
  scene.add(platform);

  const rim = box(22.9, 0.16, 19.1, '#a3764f', 0.1);
  rim.position.y = -0.82;
  scene.add(rim);

  const floorMat = new THREE.MeshStandardMaterial({
    map: tex(woodFloorTexture(), 6, 4.6),
    roughness: 0.72,
    metalness: 0,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.002;
  floor.receiveShadow = true;
  scene.add(floor);
}

function buildWalls(scene) {
  const wallColor = '#f3e7d5';
  const back = box(20.5, 4.0, 0.24, wallColor, 0.03);
  back.position.set(0.1, 2.0, -8.12);
  scene.add(back);

  const left = box(0.24, 4.0, 16.3, wallColor, 0.03);
  left.position.set(-10.12, 2.0, 0);
  scene.add(left);

  // baseboards
  const bb = box(20.4, 0.16, 0.06, '#e8d8bf', 0.02);
  bb.position.set(0, 0.08, -7.98);
  scene.add(bb);
  const bl = box(0.06, 0.16, 16.2, '#e8d8bf', 0.02);
  bl.position.set(-9.98, 0.08, 0);
  scene.add(bl);

  // top trim
  const tb = box(20.5, 0.12, 0.3, '#e9dbc5', 0.03);
  tb.position.set(0.1, 3.98, -8.12);
  scene.add(tb);
  const tl = box(0.3, 0.12, 16.3, '#e9dbc5', 0.03);
  tl.position.set(-10.12, 3.98, 0);
  scene.add(tl);
}

function buildWindow(scene) {
  const sky = canvasPlane(skyTexture(), 3.2, 2.4, { toneMapped: false });
  sky.position.set(-6.6, 2.4, -7.97);
  scene.add(sky);

  const frame = mat('#e4d3b8');
  const top = new THREE.Mesh(roundedBoxGeo(3.5, 0.16, 0.2, 0.03), frame);
  top.position.set(-6.6, 3.68, -7.92);
  scene.add(top);
  const bottom = new THREE.Mesh(roundedBoxGeo(3.5, 0.16, 0.2, 0.03), frame);
  bottom.position.set(-6.6, 1.12, -7.92);
  scene.add(bottom);
  [-8.3, -4.9].forEach((x) => {
    const side = new THREE.Mesh(roundedBoxGeo(0.16, 2.72, 0.2, 0.03), frame);
    side.position.set(x, 2.4, -7.92);
    scene.add(side);
  });
  const mullion = new THREE.Mesh(roundedBoxGeo(0.1, 2.56, 0.16, 0.02), frame);
  mullion.position.set(-6.6, 2.4, -7.9);
  scene.add(mullion);
  const cross = new THREE.Mesh(roundedBoxGeo(3.2, 0.08, 0.14, 0.02), frame);
  cross.position.set(-6.6, 2.62, -7.9);
  scene.add(cross);

  const sill = box(3.7, 0.12, 0.42, '#efdfc6', 0.03);
  sill.position.set(-6.6, 1.04, -7.82);
  scene.add(sill);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.4),
    new THREE.MeshPhysicalMaterial({
      color: '#cfe8f5', transparent: true, opacity: 0.2, roughness: 0.05,
      metalness: 0, side: THREE.DoubleSide, depthWrite: false,
    })
  );
  glass.position.set(-6.6, 2.4, -7.88);
  scene.add(glass);

  // tiny plant on the sill (scale, x, y, z)
  scene.add(makePlant(0.34, -4.98, 1.1, -7.72, '#7fb069'));
}

function buildWhiteboard(scene) {
  const group = new THREE.Group();
  group.position.set(4.6, 2.3, -7.9);
  scene.add(group);

  const frame = box(5.16, 3.06, 0.14, '#8f6748', 0.05);
  frame.position.z = 0.01;
  frame.receiveShadow = true;
  group.add(frame);

  const canvas = canvas2d(1200, 700);
  const texture = tex(canvas);
  const boardMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.62, metalness: 0 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.86), boardMat);
  board.position.z = 0.093;
  group.add(board);

  // marker tray
  const tray = box(2.4, 0.07, 0.16, '#8f6748', 0.02);
  tray.position.set(0, -1.55, 0.12);
  group.add(tray);
  const colors = ['#2e6bff', '#e8746a', '#f2a93b'];
  colors.forEach((c, i) => {
    const marker = cyl(0.032, 0.032, 0.26, c, 10);
    marker.rotation.z = Math.PI / 2;
    marker.position.set(-0.5 + i * 0.24, -1.51, 0.13);
    group.add(marker);
  });

  // invisible click target slightly bigger than the board
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 3.3),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.position.z = 0.16;
  group.add(hit);

  group.userData.pick = { type: 'board' };

  return { group, canvas, texture };
}

function buildBookshelf(scene) {
  const g = new THREE.Group();
  g.position.set(-1.9, 0, -7.66);
  scene.add(g);

  const wood = mat('#b98a62');
  const back = new THREE.Mesh(roundedBoxGeo(2.8, 2.76, 0.1, 0.03), mat('#c99b71'));
  back.position.y = 1.4;
  g.add(back);
  [-1.35, 1.35].forEach((x) => {
    const side = new THREE.Mesh(roundedBoxGeo(0.1, 2.8, 0.44, 0.03), wood);
    side.position.set(x, 1.4, 0);
    side.castShadow = true;
    side.receiveShadow = true;
    g.add(side);
  });
  const shelfYs = [0.1, 0.75, 1.4, 2.05, 2.7];
  shelfYs.forEach((y) => {
    const sh = new THREE.Mesh(roundedBoxGeo(2.6, 0.08, 0.46, 0.02), mat('#d3a97f'));
    sh.position.set(0, y, 0);
    sh.castShadow = true;
    sh.receiveShadow = true;
    g.add(sh);
  });

  const rnd = rand(91);
  const bookColors = ['#d9705f', '#e8b455', '#6f8fc4', '#7fb69a', '#b48ac4', '#e39ab0', '#f0dba8', '#5f8a8b', '#c97f4f', '#8d9bb5'];
  for (let s = 0; s < 4; s++) {
    const baseY = shelfYs[s] + 0.04;
    let x = -1.2;
    while (x < 1.15) {
      const w = 0.07 + rnd() * 0.06;
      const h = 0.3 + rnd() * 0.24;
      const d = 0.3 + rnd() * 0.08;
      const b = new THREE.Mesh(roundedBoxGeo(w, h, d, 0.012), mat(bookColors[Math.floor(rnd() * bookColors.length)]));
      b.position.set(x + w / 2, baseY + h / 2, 0.02);
      b.castShadow = true;
      b.receiveShadow = true;
      b.rotation.z = rnd() < 0.08 ? 0.16 : 0;
      g.add(b);
      x += w + 0.012;
      if (rnd() < 0.12) x += 0.1;
    }
  }

  // decor on top
  const trophy = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 0.16, 14), glowMat('#f2c14e', 0.35));
  cup.position.y = 0.13;
  trophy.add(cup);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), mat('#c9a34e'));
  stem.position.y = 0.0;
  trophy.add(stem);
  trophy.position.set(-0.85, 2.78, 0.02);
  g.add(trophy);

  g.add(makePlant(0.42, 0.7, 2.84, 0.0, '#6fa96f'));
}

function buildCoffeeBar(scene) {
  const g = new THREE.Group();
  g.position.set(-9.35, 0, -2.2);
  scene.add(g);

  const cabinet = box(0.86, 0.98, 3.0, '#d8b18a', 0.06);
  cabinet.position.y = 0.49;
  g.add(cabinet);

  const top = box(0.96, 0.1, 3.1, '#f2e6d4', 0.04);
  top.position.y = 1.02;
  g.add(top);

  // cabinet doors
  for (let i = 0; i < 3; i++) {
    const door = box(0.03, 0.72, 0.86, '#c99b71', 0.02);
    door.position.set(0.44, 0.52, -0.98 + i * 0.98);
    g.add(door);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), mat('#8d6b4c'));
    knob.position.set(0.48, 0.56, -0.98 + i * 0.98 + 0.3);
    g.add(knob);
  }

  // upper shelf
  const shelf = box(0.5, 0.06, 2.4, '#d8b18a', 0.02);
  shelf.position.set(-0.16, 2.12, 0);
  g.add(shelf);
  const cups = ['#ffffff', '#f2c14e', '#e8746a', '#ffffff', '#7fb69a'];
  cups.forEach((c, i) => {
    const cup = cyl(0.075, 0.062, 0.12, c, 14);
    cup.position.set(-0.2, 2.22, -0.92 + i * 0.44);
    g.add(cup);
  });

  // espresso machine
  const machine = box(0.56, 0.56, 0.66, '#4b515c', 0.07);
  machine.position.set(0.02, 1.36, 0.85);
  g.add(machine);
  const machineTop = box(0.5, 0.08, 0.6, '#6b7280', 0.03);
  machineTop.position.set(0.02, 1.68, 0.85);
  g.add(machineTop);
  const head = cyl(0.08, 0.08, 0.16, '#2f3540', 14);
  head.position.set(0.24, 1.36, 0.62);
  head.rotation.z = Math.PI / 2;
  g.add(head);
  const trayM = box(0.24, 0.03, 0.3, '#8d949f', 0.02);
  trayM.position.set(0.24, 1.1, 0.62);
  g.add(trayM);

  // kettle + grinder
  const kettle = cyl(0.11, 0.13, 0.24, '#e8e2d6', 16);
  kettle.position.set(0, 1.2, -0.85);
  g.add(kettle);
  const grinder = box(0.2, 0.34, 0.2, '#3c4350', 0.05);
  grinder.position.set(0, 1.28, -1.35);
  g.add(grinder);

  // menu board
  const menu = canvas2d(256, 320);
  const x = menu.getContext('2d');
  x.fillStyle = '#2f3540';
  roundRect(x, 4, 4, 248, 312, 16);
  x.fill();
  x.fillStyle = '#f7f1e6';
  x.font = `800 30px ${KR_FONT}`;
  x.textAlign = 'center';
  x.fillText('VFORGE', 128, 52);
  x.fillStyle = '#f2c14e';
  x.font = `700 18px ${KR_FONT}`;
  x.fillText('COFFEE BAR', 128, 78);
  x.textAlign = 'left';
  x.fillStyle = 'rgba(247,241,230,0.82)';
  x.font = `600 19px ${KR_FONT}`;
  ['아메리카노', '카페라떼', '바닐라라떼', '콜드브루'].forEach((t, i) => {
    x.fillText(t, 32, 124 + i * 38);
  });
  x.fillStyle = '#f7f1e6';
  x.font = `700 18px ${KR_FONT}`;
  x.textAlign = 'right';
  ['1,500', '2,500', '3,000', '3,000'].forEach((t, i) => {
    x.fillText(t, 224, 124 + i * 38);
  });
  x.fillStyle = '#f2c14e';
  x.font = `700 16px ${KR_FONT}`;
  x.textAlign = 'center';
  x.fillText('팀원은 무료 ☕', 128, 288);
  const menuMesh = canvasPlane(menu, 0.56, 0.7, { toneMapped: false });
  menuMesh.position.set(-0.06, 2.6, -0.2);
  menuMesh.rotation.y = Math.PI / 2;
  g.add(menuMesh);

  g.add(makePlant(0.5, -0.1, 1.15, -1.2, '#7fb069'));
}

function buildOwnerDesk(scene) {
  const g = new THREE.Group();
  g.position.set(-5.6, 0, -4.6);
  scene.add(g);

  const top = box(2.9, 0.1, 1.25, '#e9d9bf', 0.045);
  top.position.y = 0.73;
  g.add(top);
  const under = box(2.7, 0.06, 1.1, '#c99b71', 0.03);
  under.position.y = 0.64;
  g.add(under);
  [-1.3, 1.3].forEach((x) => {
    const leg = box(0.1, 0.7, 0.1, '#8d6b4c', 0.02);
    leg.position.set(x, 0.35, 0.5);
    g.add(leg);
    const leg2 = leg.clone();
    leg2.position.z = -0.5;
    g.add(leg2);
  });

  // dual monitors
  [-0.62, 0.62].forEach((ox, i) => {
    const mon = new THREE.Group();
    mon.position.set(ox, 0.78, -0.34);
    mon.rotation.y = ox < 0 ? 0.2 : -0.2;
    const stand = box(0.24, 0.03, 0.18, '#3b414c', 0.02);
    stand.position.y = 0.015;
    mon.add(stand);
    const neck = box(0.06, 0.24, 0.06, '#3b414c', 0.02);
    neck.position.y = 0.14;
    mon.add(neck);
    const bezel = box(1.06, 0.64, 0.05, '#2b303a', 0.03);
    bezel.position.set(0, 0.56, 0);
    bezel.rotation.x = -0.28;
    mon.add(bezel);
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.98, 0.56),
      new THREE.MeshBasicMaterial({ map: tex(uiScreenTexture(i === 0 ? 0 : 3)), toneMapped: false })
    );
    scr.position.set(0, 0.56, 0.032);
    scr.rotation.x = -0.28;
    mon.add(scr);
    g.add(mon);
  });

  // keyboard, mouse, mug, notebook, plant
  const kb = box(0.62, 0.03, 0.2, '#e9e4da', 0.02);
  kb.position.set(0, 0.8, 0.2);
  g.add(kb);
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), mat('#e9e4da'));
  mouse.position.set(0.45, 0.82, 0.22);
  mouse.scale.set(0.8, 0.55, 1.15);
  mouse.castShadow = true;
  g.add(mouse);

  const mug = new THREE.Group();
  const cup = cyl(0.07, 0.062, 0.13, '#ffffff', 16);
  cup.position.y = 0.065;
  mug.add(cup);
  const coffee = cyl(0.06, 0.06, 0.012, '#6b4227', 16);
  coffee.position.y = 0.128;
  mug.add(coffee);
  mug.position.set(-1.05, 0.78, 0.28);
  g.add(mug);

  const pad = box(0.3, 0.03, 0.22, '#fdfaf2', 0.02);
  pad.position.set(1.0, 0.79, 0.28);
  g.add(pad);

  g.add(makePlant(0.34, 1.2, 0.78, -0.4, '#6fa96f'));

  // name plate
  const plate = canvasPlane(namePlateTexture('대표 · VFORGE', '이장원'), 0.62, 0.23, { toneMapped: false });
  plate.position.set(0, 0.9, 0.52);
  plate.rotation.x = -0.12;
  g.add(plate);
  const plateStand = box(0.62, 0.2, 0.05, '#e9d9bf', 0.02);
  plateStand.position.set(0, 0.86, 0.5);
  g.add(plateStand);

  // chair
  scene.add(makeChair(-5.6, -3.5, Math.PI, '#3d4a63', true));

  // desk divider planter
  const divider = box(2.9, 0.42, 0.1, '#dcc9ab', 0.03);
  divider.position.set(-5.6, 1.02, -5.2);
  scene.add(divider);
}

function makeChair(x, z, yaw, color = '#4f5b74', executive = false) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = yaw;

  const seat = box(0.62, 0.1, 0.6, color, 0.06);
  seat.position.y = 0.44;
  g.add(seat);

  const back = box(0.6, executive ? 0.7 : 0.52, 0.11, color, 0.06);
  back.position.set(0, executive ? 0.82 : 0.72, -0.27);
  back.rotation.x = -0.08;
  g.add(back);

  const pole = cyl(0.055, 0.065, 0.36, '#7d8794', 12);
  pole.position.y = 0.24;
  g.add(pole);

  const base = cyl(0.28, 0.3, 0.05, '#5d6672', 18);
  base.position.y = 0.025;
  g.add(base);

  // armrests
  if (executive) {
    [-1, 1].forEach((s) => {
      const arm = box(0.06, 0.06, 0.42, color, 0.03);
      arm.position.set(0.3 * s, 0.62, -0.04);
      g.add(arm);
      const post = box(0.05, 0.2, 0.05, '#5d6672', 0.02);
      post.position.set(0.3 * s, 0.53, 0.12);
      g.add(post);
    });
  }

  return g;
}

function buildTeamDesk(scene, x, z, screenVariant, withChair = true) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);

  const top = box(2.2, 0.09, 1.0, '#f6efe3', 0.04);
  top.position.y = 0.72;
  g.add(top);
  [-0.95, 0.95].forEach((ox) => {
    [-0.4, 0.4].forEach((oz) => {
      const leg = box(0.07, 0.7, 0.07, '#b7a893', 0.02);
      leg.position.set(ox, 0.35, oz);
      g.add(leg);
    });
  });
  const modesty = box(2.0, 0.4, 0.05, '#e4d8c4', 0.02);
  modesty.position.set(0, 0.42, -0.36);
  g.add(modesty);

  // monitor
  const mon = new THREE.Group();
  mon.position.set(0, 0.77, -0.28);
  const stand = box(0.22, 0.03, 0.16, '#3b414c', 0.02);
  mon.add(stand);
  const neck = box(0.055, 0.2, 0.055, '#3b414c', 0.02);
  neck.position.y = 0.12;
  mon.add(neck);
  const bezel = box(0.86, 0.54, 0.05, '#2b303a', 0.03);
  bezel.position.set(0, 0.46, 0);
  bezel.rotation.x = -0.3;
  mon.add(bezel);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.79, 0.47),
    new THREE.MeshBasicMaterial({ map: tex(uiScreenTexture(screenVariant)), toneMapped: false })
  );
  scr.position.set(0, 0.46, 0.032);
  scr.rotation.x = -0.3;
  mon.add(scr);
  g.add(mon);

  const kb = box(0.56, 0.025, 0.18, '#e9e4da', 0.015);
  kb.position.set(0, 0.78, 0.18);
  g.add(kb);
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), mat('#e9e4da'));
  mouse.position.set(0.4, 0.79, 0.2);
  mouse.scale.set(0.8, 0.55, 1.1);
  g.add(mouse);

  // mug + papers
  const cup = cyl(0.06, 0.052, 0.11, '#ffffff', 14);
  cup.position.set(0.86, 0.82, 0.3);
  g.add(cup);
  const papers = box(0.26, 0.02, 0.34, '#fdfaf2', 0.01);
  papers.position.set(-0.84, 0.775, 0.24);
  papers.rotation.y = 0.2;
  g.add(papers);

  if (withChair) scene.add(makeChair(x, z + 0.95, Math.PI, '#55627b'));

  return g;
}

function buildMeeting(scene, pickables) {
  const cx = MEETING.x;
  const cz = MEETING.z;

  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.05, 48), mat('#b9cbd9', { roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(cx, 0.012, cz);
  rug.receiveShadow = true;
  scene.add(rug);
  const rugRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.78, 48), mat('#dbe7ef', { roughness: 0.95 }));
  rugRing.rotation.x = -Math.PI / 2;
  rugRing.position.set(cx, 0.016, cz);
  rugRing.receiveShadow = true;
  scene.add(rugRing);

  // table
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(MEETING.r, MEETING.r, 0.1, 44), mat('#d9b287'));
  tableTop.position.set(cx, 0.72, cz);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(MEETING.r + 0.02, MEETING.r + 0.02, 0.05, 44), mat('#c9a175'));
  edge.position.set(cx, 0.685, cz);
  scene.add(edge);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.62, 20), mat('#8d6b4c'));
  pedestal.position.set(cx, 0.37, cz);
  pedestal.castShadow = true;
  scene.add(pedestal);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.07, 28), mat('#8d6b4c'));
  foot.position.set(cx, 0.035, cz);
  foot.castShadow = true;
  scene.add(foot);

  // chairs
  MEETING_SEATS.forEach((s) => {
    const yaw = Math.atan2(cx - s.x, cz - s.z);
    scene.add(makeChair(s.x, s.z, yaw, '#5b6b8c'));
  });

  // phone
  const phone = new THREE.Group();
  phone.position.set(cx - 0.12, 0.78, cz + 0.28);
  phone.rotation.y = -0.35;

  const body = box(0.6, 0.11, 0.4, '#2f6fd0', 0.045);
  body.position.y = 0.055;
  phone.add(body);
  const deck = box(0.56, 0.02, 0.36, '#3d84ee', 0.03);
  deck.position.y = 0.115;
  phone.add(deck);

  // keypad
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = new THREE.Mesh(roundedBoxGeo(0.075, 0.016, 0.055, 0.012), mat('#eaf2ff'));
      key.position.set(-0.07 + c * 0.085, 0.126, 0.045 + r * 0.07);
      phone.add(key);
    }
  }

  // handset
  const handset = new THREE.Group();
  const bar = box(0.52, 0.07, 0.09, '#2f6fd0', 0.03);
  handset.add(bar);
  [-0.25, 0.25].forEach((ox) => {
    const end = box(0.13, 0.1, 0.13, '#2f6fd0', 0.045);
    end.position.set(ox, -0.005, 0);
    handset.add(end);
  });
  handset.position.set(0, 0.19, -0.14);
  phone.add(handset);

  // cord
  const cord = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 18, Math.PI * 1.3), mat('#2456a8'));
  cord.position.set(0.32, 0.14, -0.05);
  cord.rotation.x = Math.PI / 2;
  cord.rotation.z = 0.5;
  phone.add(cord);

  // status light
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), glowMat('#7fe3ff', 2));
  led.position.set(0.2, 0.13, 0.14);
  phone.add(led);

  // invisible generous hit area
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.55, 0.8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.position.y = 0.16;
  phone.add(hit);

  phone.userData.pick = { type: 'phone' };
  scene.add(phone);
  pickables.push(phone);

  // pulse ring
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#5f9bff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.44, 40), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(cx - 0.12, 0.785, cz + 0.28);
  scene.add(ring);

  // table props
  const plant = makePlant(0.26, cx + 0.95, 0.8, cz - 0.55, '#6fa96f');
  scene.add(plant);
  const pad = box(0.4, 0.03, 0.3, '#fdfaf2', 0.02);
  pad.position.set(cx + 0.75, 0.79, cz + 0.55);
  pad.rotation.y = 0.4;
  scene.add(pad);
  const cups = [[cx - 0.95, cz - 0.35], [cx + 0.3, cz - 0.85]];
  cups.forEach(([x, z]) => {
    const cup = cyl(0.07, 0.06, 0.12, '#ffffff', 14);
    cup.position.set(x, 0.785, z);
    scene.add(cup);
  });

  return { phone, ring, led };
}

function buildLounge(scene) {
  // rug
  const rug = box(4.6, 0.03, 3.6, '#e6cbb2', 0.3);
  rug.position.set(-5.0, 0.015, 5.2);
  rug.receiveShadow = true;
  scene.add(rug);

  // sofa against the left wall, facing +x
  const sofa = new THREE.Group();
  sofa.position.set(-8.55, 0, 2.5);
  sofa.rotation.y = Math.PI / 2;
  const base = box(3.0, 0.42, 1.25, '#f1b944', 0.12);
  base.position.y = 0.3;
  sofa.add(base);
  const back = box(3.0, 0.72, 0.28, '#f7c85c', 0.12);
  back.position.set(0, 0.62, -0.48);
  sofa.add(back);
  [-1, 1].forEach((s) => {
    const arm = box(0.28, 0.58, 1.2, '#f7c85c', 0.12);
    arm.position.set(1.42 * s, 0.52, 0);
    sofa.add(arm);
  });
  [-0.7, 0, 0.7].forEach((x) => {
    const cush = box(0.66, 0.14, 0.9, '#ffd884', 0.1);
    cush.position.set(x, 0.58, 0.04);
    sofa.add(cush);
  });
  const pillow = box(0.42, 0.42, 0.16, '#7fb69a', 0.09);
  pillow.position.set(-1.0, 0.82, -0.28);
  pillow.rotation.z = 0.2;
  sofa.add(pillow);
  scene.add(sofa);

  // coffee table
  const ct = new THREE.Group();
  ct.position.set(-6.4, 0, 2.5);
  const ctTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 28), mat('#e9d9bf'));
  ctTop.position.y = 0.44;
  ctTop.castShadow = true;
  ctTop.receiveShadow = true;
  ct.add(ctTop);
  const ctLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.4, 12), mat('#8d6b4c'));
  ctLeg.position.y = 0.22;
  ct.add(ctLeg);
  const ctFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 20), mat('#8d6b4c'));
  ctFoot.position.y = 0.02;
  ct.add(ctFoot);
  const book = box(0.24, 0.04, 0.18, '#e8746a', 0.01);
  book.position.set(0.12, 0.5, 0.05);
  book.rotation.y = 0.3;
  ct.add(book);
  const cup = cyl(0.055, 0.048, 0.1, '#ffffff', 12);
  cup.position.set(-0.2, 0.52, 0.1);
  ct.add(cup);
  scene.add(ct);

  // beanbags
  const beanColors = ['#e98a6b', '#7fb69a'];
  [[-5.9, 4.6, 0], [-4.2, 6.3, 1]].forEach(([x, z, i]) => {
    const bean = new THREE.Group();
    bean.position.set(x, 0, z);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.66, 24, 18), mat(beanColors[i], { roughness: 0.95 }));
    sack.scale.set(1, 0.62, 1);
    sack.position.y = 0.33;
    sack.castShadow = true;
    sack.receiveShadow = true;
    bean.add(sack);
    const backrest = new THREE.Mesh(new THREE.SphereGeometry(0.5, 22, 16), mat(beanColors[i], { roughness: 0.95 }));
    backrest.scale.set(0.95, 0.55, 0.62);
    backrest.position.set(0, 0.42, -0.34);
    backrest.castShadow = true;
    bean.add(backrest);
    scene.add(bean);
  });

  // massage chair
  const mc = new THREE.Group();
  mc.position.set(-2.4, 0, 6.4);
  mc.rotation.y = Math.PI;
  const seat = box(0.8, 0.18, 0.8, '#8c5a3c', 0.1);
  seat.position.y = 0.48;
  mc.add(seat);
  const mcBack = box(0.78, 1.0, 0.22, '#7b4c31', 0.1);
  mcBack.position.set(0, 0.95, -0.34);
  mcBack.rotation.x = -0.12;
  mc.add(mcBack);
  const head = box(0.4, 0.22, 0.18, '#9a6544', 0.08);
  head.position.set(0, 1.44, -0.4);
  mc.add(head);
  const legRest = box(0.7, 0.18, 0.5, '#9a6544', 0.09);
  legRest.position.set(0, 0.42, 0.52);
  legRest.rotation.x = 0.22;
  mc.add(legRest);
  [-1, 1].forEach((s) => {
    const arm = box(0.16, 0.14, 0.75, '#7b4c31', 0.06);
    arm.position.set(0.47 * s, 0.62, 0.02);
    mc.add(arm);
    const base = box(0.12, 0.36, 0.12, '#5d3a24', 0.04);
    base.position.set(0.36 * s, 0.18, 0.1);
    mc.add(base);
  });
  const foot = box(0.9, 0.08, 0.9, '#5d3a24', 0.06);
  foot.position.y = 0.04;
  mc.add(foot);
  const control = box(0.1, 0.16, 0.06, '#d8d2c6', 0.02);
  control.position.set(0.5, 0.7, 0.1);
  mc.add(control);
  scene.add(mc);

  // floor lamp
  const lamp = new THREE.Group();
  lamp.position.set(-7.5, 0, 4.9);
  const lampPole = cyl(0.035, 0.045, 1.7, '#7d8794', 10);
  lampPole.position.y = 0.87;
  lamp.add(lampPole);
  const lampBase = cyl(0.24, 0.26, 0.05, '#5d6672', 18);
  lampBase.position.y = 0.025;
  lamp.add(lampBase);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.36, 0.3, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: '#f7e6c4', roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color('#ffd89a'), emissiveIntensity: 0.35 })
  );
  shade.position.y = 1.78;
  lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), glowMat('#ffe3ae', 1.6));
  bulb.position.y = 1.7;
  lamp.add(bulb);
  scene.add(lamp);

  // charging zone plaque on the left wall
  const plaque = canvasPlane(plaqueTexture('충전 존', '에이전트 휴게실'), 0.72, 0.36, { toneMapped: false });
  plaque.position.set(-9.87, 2.5, 4.9);
  plaque.rotation.y = Math.PI / 2;
  scene.add(plaque);

  // slippers / small props
  const slippers = new THREE.Group();
  [-0.12, 0.12].forEach((ox, i) => {
    const sl = box(0.16, 0.05, 0.3, i ? '#f2a0c0' : '#f7bcd6', 0.04);
    sl.position.set(ox, 0.03, 0);
    slippers.add(sl);
  });
  slippers.position.set(-6.6, 0, 4.0);
  scene.add(slippers);
}

function buildAiCorner(scene) {
  const g = new THREE.Group();
  g.position.set(8.0, 0, 5.8);
  scene.add(g);

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.0, 40), mat('#cfd9f2', { roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.012;
  rug.receiveShadow = true;
  g.add(rug);

  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.09, 32), mat('#e4e9f7'));
  table.position.y = 0.5;
  table.castShadow = true;
  table.receiveShadow = true;
  g.add(table);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.46, 14), mat('#9aa3ae'));
  stem.position.y = 0.25;
  g.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.05, 24), mat('#9aa3ae'));
  foot.position.y = 0.025;
  g.add(foot);

  // glowing orbs on the table
  const orbColors = ['#ffb08a', '#8ff0d8', '#b3c0ff'];
  orbColors.forEach((c, i) => {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glowMat(c, 1.6));
    orb.position.set(Math.cos(a) * 0.34, 0.65, Math.sin(a) * 0.34);
    g.add(orb);
  });

  // ottomans for the three AI companions
  [[6.6, 5.0], [9.4, 5.0], [8.0, 7.4]].forEach(([x, z]) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.34, 20), mat('#dfe6f8'));
    o.position.set(x, 0.17, z);
    o.castShadow = true;
    o.receiveShadow = true;
    scene.add(o);
  });

  // small "AI" sign
  const c = canvas2d(256, 128);
  const x = c.getContext('2d');
  x.clearRect(0, 0, 256, 128);
  x.fillStyle = 'rgba(31,37,49,0.86)';
  roundRect(x, 4, 4, 248, 120, 28);
  x.fill();
  x.fillStyle = '#dfe6ff';
  x.font = `800 52px ${KR_FONT}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('AI LAB', 128, 58);
  x.fillStyle = 'rgba(223,230,255,0.65)';
  x.font = `600 20px ${KR_FONT}`;
  x.fillText('CLAUDE · GPT · GEMINI', 128, 96);
  const sign = canvasPlane(c, 1.4, 0.7, { toneMapped: false });
  sign.position.set(8.0, 2.0, 7.95);
  sign.rotation.y = Math.PI;
  scene.add(sign);
}

function makePlant(scale = 1, x = 0, y = 0, z = 0, leafColor = '#6fa96f') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.34, 18), mat('#c97f5f'));
  pot.position.y = 0.17;
  pot.castShadow = true;
  pot.receiveShadow = true;
  g.add(pot);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.05, 18), mat('#d98f6d'));
  rim.position.y = 0.33;
  g.add(rim);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), mat('#5b4636'));
  soil.position.y = 0.34;
  g.add(soil);

  const rnd = rand(Math.round((x + 10) * 37 + (z + 10) * 91 + y * 13));
  const leafMat = mat(leafColor, { roughness: 0.8 });
  const leafMat2 = mat('#8fbf7c', { roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rnd();
    const h = 0.35 + rnd() * 0.45;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, h, 6), mat('#5f8a4f'));
    stem.position.set(Math.cos(a) * 0.08, 0.34 + h / 2, Math.sin(a) * 0.08);
    stem.rotation.z = Math.cos(a) * 0.35;
    stem.rotation.x = -Math.sin(a) * 0.35;
    g.add(stem);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.17 + rnd() * 0.07, 12, 8), i % 2 ? leafMat : leafMat2);
    leaf.scale.set(1, 0.42, 0.72);
    leaf.position.set(Math.cos(a) * (0.18 + h * 0.32), 0.42 + h, Math.sin(a) * (0.18 + h * 0.32));
    leaf.rotation.y = a;
    leaf.rotation.z = 0.3 * Math.cos(a);
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

function buildDecor(scene) {
  // posters on left wall
  const poster1 = canvasPlane(posterTexture(0), 0.86, 1.16, { toneMapped: false });
  poster1.position.set(-9.86, 2.34, -5.9);
  poster1.rotation.y = Math.PI / 2;
  scene.add(poster1);
  const p1frame = box(0.06, 1.28, 0.98, '#8d6b4c', 0.02);
  p1frame.position.set(-9.9, 2.34, -5.9);
  scene.add(p1frame);

  const poster2 = canvasPlane(posterTexture(1), 0.86, 1.16, { toneMapped: false });
  poster2.position.set(-9.86, 2.34, 0.2);
  poster2.rotation.y = Math.PI / 2;
  scene.add(poster2);
  const p2frame = box(0.06, 1.28, 0.98, '#8d6b4c', 0.02);
  p2frame.position.set(-9.9, 2.34, 0.2);
  scene.add(p2frame);

  // neon sign on left wall
  const neon = canvasPlane(neonTexture(), 2.3, 0.72, { toneMapped: false, opacity: 0.98 });
  neon.position.set(-9.84, 3.1, -3.4);
  neon.rotation.y = Math.PI / 2;
  scene.add(neon);
  const neonGlow = new THREE.PointLight('#7fb2ff', 4, 6, 2);
  neonGlow.position.set(-9.2, 3.0, -3.4);
  scene.add(neonGlow);

  // string lights along the back wall
  const bulbGeo = new THREE.SphereGeometry(0.045, 8, 6);
  const bulbMat = glowMat('#ffdba1', 2.2);
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const x = -9.4 + t * 18.8;
    const y = 3.9 - Math.sin(t * Math.PI) * 0.12;
    const b = new THREE.Mesh(bulbGeo, bulbMat);
    b.position.set(x, y, -7.9);
    scene.add(b);
  }

  // pendant lamps
  addPendant(scene, MEETING.x - 0.1, MEETING.z + 0.2, '#f2c14e');
  addPendant(scene, 3.4, -3.1, '#f2c14e');
  addPendant(scene, -5.6, -4.4, '#e9d9bf');

  // plants in corners
  scene.add(makePlant(1.25, 9.2, 0, -7.1, '#6fa96f'));
  scene.add(makePlant(0.95, -9.2, 0, 7.2, '#7fb069'));
  scene.add(makePlant(0.8, 9.3, 0, -5.2, '#8fbf7c'));

  // wall clock
  const clockCanvas = canvas2d(256, 256);
  const clockTex = tex(clockCanvas);
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 40),
    new THREE.MeshBasicMaterial({ map: clockTex, toneMapped: false })
  );
  clockFace.position.set(8.8, 3.1, -7.96);
  scene.add(clockFace);
  const clockRim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 10, 40), mat('#8d6b4c'));
  clockRim.position.set(8.8, 3.1, -7.95);
  scene.add(clockRim);

  const drawClock = () => {
    const x = clockCanvas.getContext('2d');
    x.clearRect(0, 0, 256, 256);
    x.fillStyle = '#fffdf8';
    x.beginPath();
    x.arc(128, 128, 124, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = '#e6dccb';
    x.lineWidth = 6;
    x.beginPath();
    x.arc(128, 128, 118, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = '#3c4557';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      x.beginPath();
      x.arc(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96, i % 3 === 0 ? 7 : 4, 0, Math.PI * 2);
      x.fill();
    }
    const now = new Date();
    const hh = now.getHours() % 12;
    const mm = now.getMinutes();
    const ss = now.getSeconds();
    const hand = (angle, len, width, color) => {
      x.strokeStyle = color;
      x.lineWidth = width;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(128, 128);
      x.lineTo(128 + Math.sin(angle) * len, 128 - Math.cos(angle) * len);
      x.stroke();
    };
    hand(((hh + mm / 60) / 12) * Math.PI * 2, 56, 9, '#2f3540');
    hand(((mm + ss / 60) / 60) * Math.PI * 2, 82, 6, '#2f3540');
    hand((ss / 60) * Math.PI * 2, 92, 3, '#e8746a');
    x.fillStyle = '#2f3540';
    x.beginPath();
    x.arc(128, 128, 7, 0, Math.PI * 2);
    x.fill();
    clockTex.needsUpdate = true;
  };
  drawClock();

  return { drawClock };
}

function addPendant(scene, x, z, shadeColor) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const rod = cyl(0.014, 0.014, 0.86, '#5d6672', 8);
  rod.position.y = 3.6;
  g.add(rod);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), mat('#5d6672'));
  cap.position.y = 4.02;
  g.add(cap);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.18, 0.34, 26, 1, true),
    new THREE.MeshStandardMaterial({
      color: shadeColor, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide,
      emissive: new THREE.Color('#ffe0ab'), emissiveIntensity: 0.25,
    })
  );
  shade.position.y = 3.1;
  shade.castShadow = true;
  g.add(shade);
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.17, 0.33, 26, 1, true),
    new THREE.MeshStandardMaterial({ color: '#fff6e2', roughness: 0.4, side: THREE.BackSide, emissive: new THREE.Color('#ffe6bb'), emissiveIntensity: 0.6 })
  );
  inner.position.y = 3.1;
  g.add(inner);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), glowMat('#ffe9bf', 2.4));
  bulb.position.y = 3.0;
  g.add(bulb);
  const light = new THREE.PointLight('#ffe3b8', 9, 11, 2);
  light.position.y = 2.94;
  g.add(light);
  scene.add(g);
}

function buildEmptyDeskArea(scene) {
  buildTeamDesk(scene, 6.0, -1.4, 2, false);
  const c = canvas2d(256, 200);
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,253,248,0.97)';
  roundRect(x, 4, 4, 248, 192, 20);
  x.fill();
  x.strokeStyle = '#c8b393';
  x.lineWidth = 3;
  x.setLineDash([9, 7]);
  roundRect(x, 10, 10, 236, 180, 16);
  x.stroke();
  x.setLineDash([]);
  x.textAlign = 'center';
  x.fillStyle = '#8b7355';
  x.font = `800 26px ${KR_FONT}`;
  x.fillText('새 팀원 자리', 128, 78);
  x.fillStyle = '#b09a7a';
  x.font = `600 20px ${KR_FONT}`;
  x.fillText('함께할 사람을 기다리는 중', 128, 112);
  x.fillStyle = '#d9c9b2';
  x.font = `700 18px ${KR_FONT}`;
  x.fillText('NEXT SEAT ✦', 128, 146);
  const sign = canvasPlane(c, 0.62, 0.48, { toneMapped: false });
  sign.position.set(6.0, 1.02, -1.1);
  sign.rotation.x = -0.12;
  scene.add(sign);
  const stand = box(0.62, 0.4, 0.04, '#e9d9bf', 0.02);
  stand.position.set(6.0, 0.96, -1.13);
  scene.add(stand);
  const plant = makePlant(0.3, 6.85, 0.78, -1.2, '#7fb069');
  scene.add(plant);
}

// ---------------------------------------------------------------- board
function drawBoard(canvas, members) {
  const x = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  x.clearRect(0, 0, W, H);
  x.fillStyle = '#fdfdfa';
  x.fillRect(0, 0, W, H);

  // faint grid
  x.strokeStyle = 'rgba(120,140,170,0.07)';
  x.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) {
    x.beginPath();
    x.moveTo(gx, 0);
    x.lineTo(gx, H);
    x.stroke();
  }
  for (let gy = 0; gy < H; gy += 40) {
    x.beginPath();
    x.moveTo(0, gy);
    x.lineTo(W, gy);
    x.stroke();
  }

  // header
  x.fillStyle = '#1f2531';
  x.font = `800 44px ${KR_FONT}`;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  x.fillText('VFORGE 오늘의 현황', 44, 72);

  x.fillStyle = '#6a7385';
  x.font = `600 24px ${KR_FONT}`;
  x.textAlign = 'right';
  x.fillText('2026.11.27 (금)', 1156, 70);

  x.strokeStyle = 'rgba(46,107,255,0.55)';
  x.lineWidth = 4;
  x.beginPath();
  x.moveTo(44, 92);
  x.lineTo(1156, 92);
  x.stroke();

  x.fillStyle = '#2e6bff';
  x.font = `800 22px ${KR_FONT}`;
  x.textAlign = 'left';
  x.fillText('팀원 상태 · 10명', 44, 128);

  const stateColor = {
    work: '#2fc48d',
    meeting: '#f2a93b',
    charging: '#2e6bff',
    queue: '#ea6a6a',
    walk: '#9aa3ae',
    idle: '#2fc48d',
  };

  const colX = [44, 624];
  members.forEach((m, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const bx = colX[col];
    const by = 158 + row * 78;

    x.fillStyle = m.color;
    x.beginPath();
    x.arc(bx + 10, by + 10, 8, 0, Math.PI * 2);
    x.fill();

    x.fillStyle = '#1f2531';
    x.font = `700 26px ${KR_FONT}`;
    x.textAlign = 'left';
    x.fillText(m.name, bx + 28, by + 20);

    x.fillStyle = stateColor[m.state] || '#9aa3ae';
    x.font = `700 19px ${KR_FONT}`;
    x.textAlign = 'right';
    x.fillText(m.stateLabel, bx + 500, by + 19);

    // energy bar
    const barX = bx + 28;
    const barY = by + 32;
    const barW = 430;
    x.fillStyle = 'rgba(120,140,170,0.16)';
    roundRect(x, barX, barY, barW, 11, 6);
    x.fill();
    const pct = Math.max(0, Math.min(100, m.energy));
    const grad = x.createLinearGradient(barX, 0, barX + barW, 0);
    if (pct > 55) {
      grad.addColorStop(0, '#46d39b');
      grad.addColorStop(1, '#2fc48d');
    } else if (pct > 30) {
      grad.addColorStop(0, '#ffc46b');
      grad.addColorStop(1, '#f2a93b');
    } else {
      grad.addColorStop(0, '#ff9a9a');
      grad.addColorStop(1, '#ea6a6a');
    }
    x.fillStyle = grad;
    roundRect(x, barX, barY, Math.max(6, (barW * pct) / 100), 11, 6);
    x.fill();

    x.fillStyle = '#6a7385';
    x.font = `700 19px ${KR_FONT}`;
    x.textAlign = 'right';
    x.fillText(`${Math.round(pct)}%`, bx + 500, by + 44);
  });

  // stats strip
  x.fillStyle = '#2e6bff';
  x.font = `800 22px ${KR_FONT}`;
  x.textAlign = 'left';
  x.fillText('오늘 실적', 44, 566);

  const stats = [
    ['블로그', '1편', '#e4a3b1'],
    ['스레드', '4건', '#b3a2ea'],
    ['인스타', '2건', '#f0a6c0'],
    ['당근 문의', '2건', '#e8b455'],
  ];
  stats.forEach(([label, value, color], i) => {
    const bx = 44 + i * 282;
    x.fillStyle = 'rgba(46,107,255,0.06)';
    roundRect(x, bx, 586, 264, 86, 16);
    x.fill();
    x.fillStyle = color;
    roundRect(x, bx, 586, 8, 86, 4);
    x.fill();
    x.fillStyle = '#6a7385';
    x.font = `700 19px ${KR_FONT}`;
    x.textAlign = 'left';
    x.fillText(label, bx + 26, 616);
    x.fillStyle = '#1f2531';
    x.font = `800 30px ${KR_FONT}`;
    x.fillText(value, bx + 26, 654);
  });
}

// ---------------------------------------------------------------- entry
export function buildRoom(scene) {
  const pickables = [];

  buildBase(scene);
  buildWalls(scene);
  buildWindow(scene);
  const board = buildWhiteboard(scene);
  pickables.push(board.group);
  buildBookshelf(scene);
  buildCoffeeBar(scene);
  buildOwnerDesk(scene);
  buildTeamDesk(scene, 0.4, -4.8, 1);
  buildTeamDesk(scene, 3.2, -4.8, 2);
  buildTeamDesk(scene, 6.0, -4.8, 0);
  buildTeamDesk(scene, 0.4, -1.4, 3);
  buildTeamDesk(scene, 3.2, -1.4, 1);
  buildEmptyDeskArea(scene);
  const meeting = buildMeeting(scene, pickables);
  buildLounge(scene);
  buildAiCorner(scene);
  const decor = buildDecor(scene);

  return {
    pickables,
    board,
    phone: meeting.phone,
    phoneRing: meeting.ring,
    phoneLed: meeting.led,
    drawClock: decor.drawClock,
    drawBoard,
  };
}
