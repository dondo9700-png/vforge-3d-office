import * as THREE from 'three';

const matCache = new Map();

export function mat(color, opts = {}) {
  const key = color + '|' + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.86,
    metalness: 0,
    ...opts,
  });
  matCache.set(key, m);
  return m;
}

export function glowMat(color, intensity = 1.2, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.42,
    metalness: 0,
    ...opts,
  });
}

const geoCache = new Map();

function roundedRectShape(W, H, r) {
  const s = new THREE.Shape();
  const x = -W / 2;
  const y = -H / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + W - r, y);
  s.quadraticCurveTo(x + W, y, x + W, y + r);
  s.lineTo(x + W, y + H - r);
  s.quadraticCurveTo(x + W, y + H, x + W - r, y + H);
  s.lineTo(x + r, y + H);
  s.quadraticCurveTo(x, y + H, x, y + H - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * Soft-cornered box geometry (clay / miniature look).
 * Final outer size is exactly w x h x d. Extruded along Z.
 */
export function roundedBoxGeo(w, h, d, r = 0.05) {
  const key = [w, h, d, r].map((n) => n.toFixed(3)).join(',');
  if (geoCache.has(key)) return geoCache.get(key);

  const bevel = Math.max(0.004, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01));
  const W = Math.max(0.01, w - 2 * bevel);
  const H = Math.max(0.01, h - 2 * bevel);
  const rr = Math.min(bevel * 0.85, W / 2 - 0.002, H / 2 - 0.002);
  const shape = roundedRectShape(W, H, Math.max(0.001, rr));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, d - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1,
  });
  geo.center();
  geoCache.set(key, geo);
  return geo;
}

export function box(w, h, d, color, r = 0.05, opts) {
  const m = new THREE.Mesh(roundedBoxGeo(w, h, d, r), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function glowBox(w, h, d, color, intensity = 1.2, r = 0.05) {
  const m = new THREE.Mesh(roundedBoxGeo(w, h, d, r), glowMat(color, intensity));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cyl(rTop, rBot, h, color, seg = 22, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function sphere(r, color, seg = 18, opts) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg - 4)), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function tex(canvas, repeatX = 0, repeatY = 0) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeatX > 0 && repeatY > 0) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
  }
  return t;
}

/** Flat text/graphic plane using a canvas, unlit so it stays crisp. */
export function canvasPlane(canvas, w, h, opts = {}) {
  const material = new THREE.MeshBasicMaterial({
    map: tex(canvas),
    transparent: true,
    toneMapped: false,
    ...opts,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  return mesh;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export const KR_FONT = 'Pretendard, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';

export function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export function rand(seed) {
  // deterministic tiny PRNG so the room looks the same on every load
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
