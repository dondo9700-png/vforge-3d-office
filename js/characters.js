import * as THREE from 'three';
import { mat, roundedBoxGeo, cyl, sphere, glowMat } from './lib.js';

function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addPick(group, id) {
  group.userData.pick = { type: 'agent', id };
}

// ------------------------------------------------------------------ props
function buildProp(kind, color, cfg) {
  const g = new THREE.Group();
  if (!kind) return g;
  if (kind === 'mug') {
    const body = mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.1, 16), mat(color || '#ffffff'));
    body.position.y = 0.05;
    g.add(body);
    const coffee = mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 16), mat('#6b4227'));
    coffee.position.y = 0.098;
    g.add(coffee);
    const handle = mesh(new THREE.TorusGeometry(0.032, 0.01, 6, 12), mat(color || '#ffffff'));
    handle.position.set(0.055, 0.05, 0);
    handle.rotation.y = Math.PI / 2;
    g.add(handle);
  } else if (kind === 'notebook') {
    const pad = mesh(roundedBoxGeo(0.19, 0.03, 0.25, 0.012), mat('#fdfaf2'));
    g.add(pad);
    const line = mesh(roundedBoxGeo(0.03, 0.032, 0.23, 0.01), mat('#e8746a'));
    line.position.x = -0.06;
    g.add(line);
    const pen = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), mat('#2f6bd8'));
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.3;
    pen.position.set(0.02, 0.03, 0.05);
    g.add(pen);
  } else if (kind === 'phone') {
    const body = mesh(roundedBoxGeo(0.1, 0.17, 0.022, 0.018), mat('#22252e'));
    g.add(body);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.085, 0.145), new THREE.MeshBasicMaterial({ color: '#7fb2ff', toneMapped: false }));
    screen.position.z = 0.013;
    g.add(screen);
  } else if (kind === 'clipboard') {
    const board = mesh(roundedBoxGeo(0.22, 0.29, 0.022, 0.014), mat('#b98a5b'));
    g.add(board);
    const paper = mesh(roundedBoxGeo(0.19, 0.25, 0.008, 0.008), mat('#fdfaf2'));
    paper.position.z = 0.015;
    g.add(paper);
    const clip = mesh(roundedBoxGeo(0.08, 0.035, 0.03, 0.01), mat('#9aa3ae'));
    clip.position.set(0, 0.135, 0.022);
    g.add(clip);
  } else if (kind === 'camera') {
    const body = mesh(roundedBoxGeo(0.16, 0.11, 0.1, 0.025), mat('#3b414c'));
    g.add(body);
    const lens = mesh(new THREE.CylinderGeometry(0.045, 0.052, 0.07, 16), mat('#22262e'));
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.09;
    g.add(lens);
    const ring = mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), mat('#c9a34e'));
    ring.position.z = 0.11;
    g.add(ring);
  } else if (kind === 'laptop') {
    const base = mesh(roundedBoxGeo(0.34, 0.026, 0.24, 0.012), mat('#8e99a8'));
    g.add(base);
    const lid = mesh(roundedBoxGeo(0.34, 0.22, 0.02, 0.012), mat('#8e99a8'));
    lid.position.set(0, 0.1, -0.11);
    lid.rotation.x = 0.22;
    g.add(lid);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshBasicMaterial({ color: '#9fd8ff', toneMapped: false }));
    scr.position.set(0, 0.1, -0.098);
    scr.rotation.x = 0.22;
    g.add(scr);
  } else if (kind === 'book') {
    const b = mesh(roundedBoxGeo(0.2, 0.26, 0.05, 0.012), mat(color || '#d97757'));
    g.add(b);
    const pages = mesh(roundedBoxGeo(0.185, 0.24, 0.035, 0.008), mat('#fdf6e8'));
    pages.position.set(0.008, 0, 0.012);
    g.add(pages);
  } else if (kind === 'orb') {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), glowMat(color || '#a8f0e0', 1.8));
    g.add(o);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.13, 24),
      new THREE.MeshBasicMaterial({ color: color || '#a8f0e0', transparent: true, opacity: 0.35, side: THREE.DoubleSide, toneMapped: false })
    );
    halo.rotation.x = Math.PI / 2;
    g.add(halo);
  } else if (kind === 'tablet') {
    const t = mesh(roundedBoxGeo(0.26, 0.19, 0.02, 0.014), mat('#2a2f3a'));
    g.add(t);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.235, 0.165), new THREE.MeshBasicMaterial({ color: '#5f9bff', toneMapped: false }));
    s.position.z = 0.012;
    g.add(s);
  }
  return g;
}

// ------------------------------------------------------------------ human
function buildHuman(cfg, g) {
  const L = cfg.look || {};
  const skinMat = mat(L.skin || '#f2c7a1');
  const shirtMat = mat(L.body || '#6c7a96');
  const pantsMat = mat(L.pants || '#3b4557');

  const legGeo = new THREE.CapsuleGeometry(0.095, 0.15, 4, 10);
  const shoeGeo = roundedBoxGeo(0.19, 0.1, 0.3, 0.04);

  const mkLeg = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx, 0.44, 0);
    const leg = mesh(legGeo, pantsMat);
    leg.position.y = -0.17;
    pivot.add(leg);
    const shoe = mesh(shoeGeo, mat('#2b303a'));
    shoe.position.set(0, -0.35, 0.055);
    pivot.add(shoe);
    g.add(pivot);
    return pivot;
  };
  const leftLeg = mkLeg(-0.115);
  const rightLeg = mkLeg(0.115);

  const torso = mesh(new THREE.CapsuleGeometry(0.235, 0.2, 6, 16), shirtMat);
  torso.position.y = 0.86;
  g.add(torso);

  // simple collar / pocket detail
  const pocket = mesh(roundedBoxGeo(0.13, 0.1, 0.02, 0.01), mat(L.pocket || '#ffffff', { roughness: 0.9 }));
  pocket.position.set(0.075, 0.9, 0.215);
  g.add(pocket);

  const neck = mesh(new THREE.CylinderGeometry(0.07, 0.078, 0.1, 10), skinMat);
  neck.position.y = 1.21;
  g.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.37;
  g.add(head);

  const skull = mesh(new THREE.SphereGeometry(0.235, 26, 20), skinMat);
  head.add(skull);

  // eyes
  const eyeMat = mat('#22262e');
  const eyeGeo = new THREE.SphereGeometry(0.033, 10, 8);
  const eyes = [];
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(eyeGeo, eyeMat);
    e.position.set(0.082 * s, 0.015, 0.212);
    head.add(e);
    eyes.push(e);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    glint.position.set(0.082 * s + 0.012, 0.033, 0.232);
    head.add(glint);
  });

  // smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 6, 14, Math.PI), mat('#a05c46'));
  smile.position.set(0, -0.055, 0.216);
  smile.rotation.z = Math.PI;
  head.add(smile);

  // cheeks
  const cheekMat = mat('#f0a896', { roughness: 0.95 });
  [-1, 1].forEach((s) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.033, 8, 6), cheekMat);
    c.position.set(0.155 * s, -0.035, 0.18);
    c.scale.set(1, 0.65, 0.4);
    head.add(c);
  });

  // hair
  const hairMat = mat(L.hair || '#2a2018');
  const style = L.hairStyle || 'short';
  if (style !== 'cap') {
    const dome = mesh(new THREE.SphereGeometry(0.247, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.44), hairMat);
    dome.position.y = 0.006;
    head.add(dome);
    const back = mesh(new THREE.SphereGeometry(0.232, 20, 16), hairMat);
    back.position.set(0, -0.005, -0.075);
    back.scale.set(1, 0.98, 0.85);
    head.add(back);
  }

  if (style === 'bob') {
    [-1, 1].forEach((s) => {
      const side = mesh(new THREE.SphereGeometry(0.105, 14, 12), hairMat);
      side.position.set(0.196 * s, -0.035, -0.01);
      side.scale.set(0.85, 1.25, 0.95);
      head.add(side);
    });
    const fringe = mesh(roundedBoxGeo(0.3, 0.09, 0.14, 0.045), hairMat);
    fringe.position.set(0, 0.13, 0.15);
    head.add(fringe);
  } else if (style === 'ponytail') {
    const tail = mesh(new THREE.CapsuleGeometry(0.072, 0.2, 4, 10), hairMat);
    tail.position.set(0, -0.06, -0.245);
    tail.rotation.x = 0.55;
    head.add(tail);
    const band = mesh(new THREE.TorusGeometry(0.055, 0.016, 6, 14), mat('#e8746a'));
    band.position.set(0, 0.06, -0.235);
    band.rotation.x = Math.PI / 2 - 0.3;
    head.add(band);
  } else if (style === 'messy') {
    for (let i = 0; i < 4; i++) {
      const tuft = mesh(new THREE.SphereGeometry(0.062, 10, 8), hairMat);
      tuft.position.set(-0.12 + i * 0.08, 0.2 + (i % 2) * 0.03, 0.02 + (i % 2 ? 0.05 : -0.04));
      tuft.scale.set(1, 0.8, 1);
      head.add(tuft);
    }
  } else if (style === 'headphones') {
    const band = mesh(new THREE.TorusGeometry(0.255, 0.024, 8, 22, Math.PI), mat('#39404b'));
    band.position.y = 0.02;
    head.add(band);
    [-1, 1].forEach((s) => {
      const cup = mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 16), mat('#39404b'));
      cup.position.set(0.238 * s, -0.03, 0);
      cup.rotation.z = Math.PI / 2;
      head.add(cup);
    });
  } else if (style === 'cap') {
    const capMat = mat(L.capColor || '#3b5bb5');
    const dome = mesh(new THREE.SphereGeometry(0.25, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.46), capMat);
    dome.position.y = 0.01;
    head.add(dome);
    const brim = mesh(roundedBoxGeo(0.3, 0.022, 0.19, 0.02), capMat);
    brim.position.set(0, 0.045, 0.2);
    brim.rotation.x = 0.12;
    head.add(brim);
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), capMat);
    button.position.y = 0.245;
    head.add(button);
  }

  if (L.glasses) {
    const gm = mat('#2f3540');
    [-1, 1].forEach((s) => {
      const ring = mesh(new THREE.TorusGeometry(0.062, 0.008, 6, 16), gm);
      ring.position.set(0.083 * s, 0.015, 0.236);
      head.add(ring);
    });
    const bridge = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 6), gm);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.02, 0.238);
    head.add(bridge);
  }

  // arms
  const armGeo = new THREE.CapsuleGeometry(0.072, 0.19, 4, 10);
  const handGeo = new THREE.SphereGeometry(0.072, 12, 10);
  const mkArm = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx, 1.08, 0);
    const arm = mesh(armGeo, shirtMat);
    arm.position.y = -0.16;
    pivot.add(arm);
    const hand = mesh(handGeo, skinMat);
    hand.position.y = -0.305;
    pivot.add(hand);
    g.add(pivot);
    return pivot;
  };
  const leftArm = mkArm(-0.29);
  const rightArm = mkArm(0.29);
  leftArm.rotation.z = 0.13;
  rightArm.rotation.z = -0.13;

  let prop = null;
  if (L.prop) {
    prop = buildProp(L.prop, L.propColor, cfg);
    prop.position.set(0, -0.36, 0.06);
    rightArm.add(prop);
  }

  return { leftLeg, rightLeg, leftArm, rightArm, head, eyes, prop, anchorY: 1.95 };
}

// ------------------------------------------------------------------ mascot (ㅂ)
function buildMascot(cfg, g) {
  const blue = mat('#2e6bff', { roughness: 0.62 });
  const blueDark = mat('#1f4fcc', { roughness: 0.62 });
  const blueLight = mat('#4d86ff', { roughness: 0.6 });
  const panel = mat('#eaf2ff', { roughness: 0.55 });

  const legGeo = new THREE.CapsuleGeometry(0.08, 0.09, 4, 10);
  const mkLeg = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx, 0.26, 0);
    const leg = mesh(legGeo, blueDark);
    leg.position.y = -0.1;
    pivot.add(leg);
    const foot = mesh(new THREE.SphereGeometry(0.09, 12, 10), blueDark);
    foot.position.set(0, -0.2, 0.03);
    foot.scale.set(1, 0.72, 1.25);
    pivot.add(foot);
    g.add(pivot);
    return pivot;
  };
  const leftLeg = mkLeg(-0.17);
  const rightLeg = mkLeg(0.17);

  const bodyH = 0.98;
  const bodyY = 0.26 + bodyH / 2;
  const barW = 0.17;
  const bodyW = 0.74;
  const bodyD = 0.34;

  [-1, 1].forEach((s) => {
    const bar = mesh(roundedBoxGeo(barW, bodyH, bodyD, 0.055), blue);
    bar.position.set((bodyW / 2 - barW / 2) * s, bodyY, 0);
    g.add(bar);
  });
  [0.34, 0.7].forEach((hy) => {
    const bar = mesh(roundedBoxGeo(bodyW - 0.05, 0.155, bodyD - 0.02, 0.05), blueLight);
    bar.position.set(0, hy, 0);
    g.add(bar);
  });

  // inset face panel in the open top of the ㅂ
  const face = mesh(roundedBoxGeo(0.42, 0.34, 0.11, 0.05), panel);
  face.position.set(0, 0.975, 0.085);
  g.add(face);

  const eyes = [];
  [-1, 1].forEach((s) => {
    const white = mesh(new THREE.SphereGeometry(0.062, 16, 12), mat('#ffffff', { roughness: 0.42 }));
    white.position.set(0.098 * s, 1.0, 0.15);
    g.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.031, 12, 10), new THREE.MeshBasicMaterial({ color: '#16233f' }));
    pupil.position.set(0.098 * s, 0.995, 0.202);
    g.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    glint.position.set(0.098 * s + 0.013, 1.017, 0.223);
    g.add(glint);
    eyes.push(white);
  });

  [-1, 1].forEach((s) => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), mat('#ff9db5', { roughness: 0.95 }));
    blush.position.set(0.2 * s, 0.925, 0.135);
    blush.scale.set(1, 0.8, 0.35);
    g.add(blush);
  });

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.011, 6, 14, Math.PI), mat('#1b3f8f'));
  smile.position.set(0, 0.93, 0.155);
  smile.rotation.z = Math.PI;
  g.add(smile);

  // little arms + mitten hands
  const armGeo = new THREE.CapsuleGeometry(0.058, 0.14, 4, 10);
  const mkArm = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(0.4 * sx, 0.78, 0);
    const arm = mesh(armGeo, blue);
    arm.position.y = -0.11;
    pivot.add(arm);
    const hand = mesh(new THREE.SphereGeometry(0.075, 12, 10), mat('#ffffff', { roughness: 0.5 }));
    hand.position.y = -0.225;
    pivot.add(hand);
    g.add(pivot);
    return pivot;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);
  leftArm.rotation.z = 0.3;
  rightArm.rotation.z = -0.3;

  return { leftLeg, rightLeg, leftArm, rightArm, head: null, eyes, prop: null, anchorY: 1.85 };
}

// ------------------------------------------------------------------ ai companions
function buildAi(cfg, g) {
  const L = cfg.look || {};
  const bodyMat = mat(L.body || '#7d8cff', { roughness: 0.55, metalness: 0.05 });

  const legGeo = new THREE.CapsuleGeometry(0.07, 0.06, 4, 10);
  const mkLeg = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx, 0.24, 0);
    const leg = mesh(legGeo, mat(L.belly || '#eee6ff', { roughness: 0.6 }));
    leg.position.y = -0.09;
    pivot.add(leg);
    const foot = mesh(new THREE.SphereGeometry(0.085, 12, 10), mat(L.belly || '#eee6ff', { roughness: 0.6 }));
    foot.position.set(0, -0.18, 0.02);
    foot.scale.set(1, 0.7, 1.2);
    pivot.add(foot);
    g.add(pivot);
    return pivot;
  };
  const leftLeg = mkLeg(-0.13);
  const rightLeg = mkLeg(0.13);

  const torso = mesh(new THREE.CapsuleGeometry(0.3, 0.26, 8, 20), bodyMat);
  torso.position.y = 0.62;
  g.add(torso);

  const belly = mesh(roundedBoxGeo(0.26, 0.3, 0.06, 0.03), mat(L.belly || '#f2ecff', { roughness: 0.5 }));
  belly.position.set(0, 0.6, 0.255);
  g.add(belly);

  const head = new THREE.Group();
  head.position.y = 1.16;
  g.add(head);

  const skull = mesh(new THREE.SphereGeometry(0.265, 26, 20), bodyMat);
  head.add(skull);

  const eyes = [];
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), new THREE.MeshBasicMaterial({ color: '#1d2230' }));
    e.position.set(0.09 * s, 0.02, 0.245);
    head.add(e);
    eyes.push(e);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    glint.position.set(0.09 * s + 0.012, 0.04, 0.268);
    head.add(glint);
  });

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.011, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: '#2a2f3d' }));
  smile.position.set(0, -0.055, 0.25);
  smile.rotation.z = Math.PI;
  head.add(smile);

  if (cfg.id === 'chatgpt') {
    const ring = mesh(new THREE.TorusGeometry(0.1, 0.028, 8, 22), glowMat('#e8fff8', 0.9));
    ring.position.y = 0.28;
    ring.rotation.x = Math.PI / 2.4;
    head.add(ring);
  } else if (cfg.id === 'gemini') {
    const star = new THREE.Group();
    const m1 = new THREE.Mesh(roundedBoxGeo(0.05, 0.26, 0.05, 0.02), glowMat('#dfe6ff', 1.6));
    const m2 = new THREE.Mesh(roundedBoxGeo(0.05, 0.26, 0.05, 0.02), glowMat('#dfe6ff', 1.6));
    m2.rotation.z = Math.PI / 2;
    star.add(m1, m2);
    star.position.y = 0.33;
    head.add(star);
  } else if (cfg.id === 'claude') {
    const spark = new THREE.Group();
    const a = new THREE.Mesh(roundedBoxGeo(0.03, 0.17, 0.02, 0.012), glowMat('#fdf2e6', 0.9));
    const b = new THREE.Mesh(roundedBoxGeo(0.03, 0.17, 0.02, 0.012), glowMat('#fdf2e6', 0.9));
    b.rotation.z = Math.PI / 2;
    spark.add(a, b);
    spark.position.set(0, 0.68, 0.3);
    g.add(spark);
  }

  const armGeo = new THREE.CapsuleGeometry(0.06, 0.14, 4, 10);
  const mkArm = (sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(0.31 * sx, 0.8, 0);
    const arm = mesh(armGeo, bodyMat);
    arm.position.y = -0.11;
    pivot.add(arm);
    pivot.rotation.z = 0.24 * sx;
    g.add(pivot);
    return pivot;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);

  let prop = null;
  if (L.prop) {
    prop = buildProp(L.prop, L.propColor, cfg);
    prop.position.set(0, -0.24, 0.08);
    rightArm.add(prop);
  }

  return { leftLeg, rightLeg, leftArm, rightArm, head, eyes, prop, anchorY: 1.9 };
}

// ------------------------------------------------------------------ entry
export function buildCharacter(cfg) {
  const group = new THREE.Group();
  addPick(group, cfg.id);
  let parts;
  if (cfg.kind === 'mascot') parts = buildMascot(cfg, group);
  else if (cfg.kind === 'ai') parts = buildAi(cfg, group);
  else parts = buildHuman(cfg, group);
  return { group, parts, anchorY: parts.anchorY };
}
