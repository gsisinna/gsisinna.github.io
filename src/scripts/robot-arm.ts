// Interactive hero scene: a minimal 6-axis robot arm doing pick and place, drawn in
// perspective on a 2D canvas (no 3D library).
//
// - Kinematics: yaw/shoulder/elbow position the wrist centre (analytic IK); a spherical wrist
//   (q4 roll, q5 pitch, q6 roll) keeps the gripper pointing down and turns it to match the box.
// - Physics: boxes fall with gravity, rest on the highest surface below them, stack, slide off
//   edges when placed off-centre, and push each other apart instead of overlapping.
// - Interaction: point at the floor or a box; click a box to pick it, click again to place it
//   (on the floor or on top of a stack), click the floor to add a box. When idle the robot
//   moves the tower between two spots on its own.

type Vec3 = [number, number, number];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec3): Vec3 => mul(a, 1 / (len(a) || 1));
const hdist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const UP: Vec3 = [0, 1, 0];

// Arm geometry (metres, roughly)
const L0 = 0.55; // base column
const L1 = 1.0; // upper arm
const L2 = 0.85; // forearm
const D5 = 0.12; // wrist to flange
const D6 = 0.18; // gripper fingers
const TOOL = D5 + D6;
const REACH_MIN = 0.45;
const REACH_MAX = 1.7;

// Boxes
const S = 0.2;
const H = S / 2;
const MAX_BOXES = 7;
const GRIP_OPEN = 0.15;
const GRIP_CLOSED = H + 0.004;
// The held box sits between the fingers: its bottom is 2 cm below the finger tips.
const HOLD_DROP = 0.02;

// Camera
const PITCH = 0.42;
const DIST = 5.2;
const AZIMUTH = 2.2;
const FLOOR_RADIUS = 1.9;

type Joints = [number, number, number, number, number, number];

interface Pose {
  base: Vec3;
  shoulder: Vec3;
  elbow: Vec3;
  roll: Vec3; // q4 joint along the forearm
  wrist: Vec3;
  flange: Vec3;
  tip: Vec3;
  e: Vec3; // arm plane direction
  n: Vec3; // shoulder/elbow axis
  a: Vec3; // forearm axis (q4)
  zp: Vec3; // q5 axis
  t: Vec3; // tool axis (q6)
  g: Vec3; // finger direction
}

/** Forward kinematics for the 6-axis arm. */
function forward(q: Joints): Pose {
  const [q1, q2, q3, q4, q5, q6] = q;
  const e: Vec3 = [Math.cos(q1), 0, Math.sin(q1)];
  const n = cross(e, UP);
  const shoulder: Vec3 = [0, L0, 0];
  const elbow = add(shoulder, mul(add(mul(e, Math.cos(q2)), mul(UP, Math.sin(q2))), L1));
  const a = add(mul(e, Math.cos(q2 + q3)), mul(UP, Math.sin(q2 + q3)));
  const wrist = add(elbow, mul(a, L2));
  const y3 = cross(n, a);
  const zp = add(mul(n, Math.cos(q4)), mul(y3, Math.sin(q4)));
  const w = cross(zp, a);
  const t = add(mul(a, Math.cos(q5)), mul(w, Math.sin(q5)));
  const g = add(mul(zp, Math.cos(q6)), mul(cross(t, zp), Math.sin(q6)));
  return {
    base: [0, 0, 0],
    shoulder,
    elbow,
    roll: add(elbow, mul(a, L2 * 0.35)),
    wrist,
    flange: add(wrist, mul(t, D5)),
    tip: add(wrist, mul(t, TOOL)),
    e,
    n,
    a,
    zp,
    t,
    g
  };
}

/**
 * Inverse kinematics: tool tip at `tip`, tool axis pointing straight down, fingers along the
 * horizontal direction `psi`. Position from q1..q3 (wrist centre), orientation from q4..q6.
 */
function inverse(tip: Vec3, psi: number): Joints {
  const wristTarget: Vec3 = [tip[0], tip[1] + TOOL, tip[2]];
  const q1 = Math.atan2(wristTarget[2], wristTarget[0]);
  const r = Math.hypot(wristTarget[0], wristTarget[2]);
  const h = wristTarget[1] - L0;
  const reach = clamp(Math.hypot(r, h), 0.25, L1 + L2 - 0.001);
  const q3 = -Math.acos(clamp((reach * reach - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
  const q2 = Math.atan2(h, r) - Math.atan2(L2 * Math.sin(q3), L1 + L2 * Math.cos(q3));

  const e: Vec3 = [Math.cos(q1), 0, Math.sin(q1)];
  const n = cross(e, UP);
  const a = add(mul(e, Math.cos(q2 + q3)), mul(UP, Math.sin(q2 + q3)));
  const y3 = cross(n, a);
  const t: Vec3 = [0, -1, 0];
  const tx = dot(t, a);
  const tp = sub(t, mul(a, tx));
  const tpl = len(tp);
  let q4 = 0;
  let q5 = 0;
  let zp = n;
  if (tpl > 1e-6) {
    const w = mul(tp, 1 / tpl);
    zp = cross(a, w);
    q4 = Math.atan2(dot(zp, y3), dot(zp, n));
    q5 = Math.atan2(tpl, tx);
    // Two wrist solutions exist; prefer the non-flipped one (|q4| <= 90 deg), as a real robot would.
    if (Math.abs(q4) > Math.PI / 2) {
      q4 = wrapAngle(q4 + Math.PI);
      q5 = -q5;
      zp = mul(zp, -1);
    }
  }
  const g: Vec3 = [Math.cos(psi), 0, Math.sin(psi)];
  const q6 = Math.atan2(dot(cross(zp, g), t), dot(zp, g));
  return [q1, q2, q3, q4, q5, q6];
}

interface Box {
  p: Vec3; // centre
  yaw: number;
  v: Vec3;
  held: boolean;
}

type Step =
  | { kind: "move"; to: Vec3; psi?: number; speed?: number }
  | { kind: "grip"; close: boolean; box?: Box }
  | { kind: "wait"; time: number };

interface Palette {
  accent: string;
  warm: string;
  ink: string;
  muted: string;
  line: string;
  bg: string;
  surface: string;
}

function readPalette(el: Element): Palette {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    accent: get("--accent", "#5ee6a0"),
    warm: get("--accent-warm", "#f2c46d"),
    ink: get("--ink-strong", "#f2f5f3"),
    muted: get("--muted", "#8e9993"),
    line: get("--line-strong", "rgba(255,255,255,0.14)"),
    bg: get("--bg", "#0b0d0f"),
    surface: get("--surface", "#111417")
  };
}

export function mountRobotScene(root: HTMLElement): () => void {
  const maybeCanvas = root.querySelector("canvas");
  const maybeCtx = maybeCanvas?.getContext("2d");
  if (!maybeCanvas || !maybeCtx) return () => {};
  const canvas: HTMLCanvasElement = maybeCanvas;
  const ctx: CanvasRenderingContext2D = maybeCtx;
  const readout = root.querySelector<HTMLElement>("[data-robot-readout]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Camera -------------------------------------------------------------------------
  let width = 0;
  let height = 0;
  let focal = 1;
  let azimuth = AZIMUTH;
  let cam = { pos: [0, 0, 0] as Vec3, f: [0, 0, 1] as Vec3, r: [1, 0, 0] as Vec3, u: [0, 1, 0] as Vec3 };

  const horizontalRight = (az: number): Vec3 => [-Math.sin(az), 0, Math.cos(az)];
  const horizontalForward = (az: number): Vec3 => [Math.cos(az), 0, Math.sin(az)];

  const updateCamera = () => {
    const look = add(mul(horizontalRight(azimuth), 0.8), [0, 0.7, 0]);
    const f = norm([Math.cos(PITCH) * Math.cos(azimuth), -Math.sin(PITCH), Math.cos(PITCH) * Math.sin(azimuth)]);
    const r = norm(cross(f, UP));
    cam = { pos: sub(look, mul(f, DIST)), f, r, u: cross(r, f) };
  };

  const project = (p: Vec3): [number, number, number] => {
    const d = sub(p, cam.pos);
    const z = Math.max(0.1, dot(d, cam.f));
    return [width / 2 + (dot(d, cam.r) * focal) / z, height * 0.52 - (dot(d, cam.u) * focal) / z, z];
  };

  const rayFrom = (sx: number, sy: number): Vec3 =>
    norm(add(cam.f, add(mul(cam.r, (sx - width / 2) / focal), mul(cam.u, (height * 0.52 - sy) / focal))));

  // ---- World state ----------------------------------------------------------------------
  const spotA = add(mul(horizontalRight(AZIMUTH), 0.85), mul(horizontalForward(AZIMUTH), -0.35));
  const spotB = add(mul(horizontalRight(AZIMUTH), 1.25), mul(horizontalForward(AZIMUTH), 0.4));
  const boxes: Box[] = [0, 1, 2].map((i) => ({
    p: [spotA[0], H + i * S, spotA[2]],
    yaw: 0.35 + (i - 1) * 0.04,
    v: [0, 0, 0],
    held: false
  }));
  let goal = spotB;

  let palette = readPalette(root);
  let psi = 0.35; // gripper finger direction (smoothed through q6)
  let target: Vec3 = add(spotA, [0, 0.9, 0]);
  let joints: Joints = inverse(target, psi);
  let grip = GRIP_OPEN;
  let held: Box | null = null;
  let holdOffset = 0;
  let queue: Step[] = [];
  let stepTime = 0;
  let pointer: { x: number; y: number } | null = null;
  let hover: { point: Vec3; reachable: boolean } | null = null;
  let lastInteraction = -Infinity;
  let mode: "auto" | "manual" = "auto";

  let frame = 0;
  let running = false;
  let visible = true;
  let lastTime = performance.now();
  let lastReadout = 0;
  let lastPalette = 0;

  // ---- Queries --------------------------------------------------------------------------
  const freeBoxes = () => boxes.filter((b) => !b.held);
  /** Highest surface (floor or box top) within `radius` of (x, z). */
  const surfaceAt = (p: Vec3, radius: number, exclude?: Box) =>
    freeBoxes().reduce((top, b) => (b !== exclude && hdist(b.p, p) < radius ? Math.max(top, b.p[1] + H) : top), 0);
  const isTop = (b: Box) => !freeBoxes().some((o) => o !== b && hdist(o.p, b.p) < S * 0.6 && o.p[1] > b.p[1] + 0.05);
  const topBoxNear = (p: Vec3, radius: number) =>
    freeBoxes()
      .filter((b) => hdist(b.p, p) < radius && isTop(b))
      .sort((a, b) => b.p[1] - a.p[1])[0];
  const safeHeight = () => Math.min(1.45, Math.max(0, ...freeBoxes().map((b) => b.p[1] + H)) + S + 0.3);
  const alignPsi = (yaw: number) => {
    // Boxes are symmetric every 90 degrees: choose the closest equivalent to minimise wrist roll.
    let best = yaw;
    for (let k = -4; k <= 4; k++) {
      const candidate = yaw + (k * Math.PI) / 2;
      if (Math.abs(wrapAngle(candidate - psi)) < Math.abs(wrapAngle(best - psi))) best = candidate;
    }
    return psi + wrapAngle(best - psi);
  };
  const clampReach = (p: Vec3): { point: Vec3; reachable: boolean } => {
    const r = Math.hypot(p[0], p[2]);
    const clamped = clamp(r, REACH_MIN, REACH_MAX);
    const reachable = Math.abs(clamped - r) < 1e-6;
    const k = r > 1e-6 ? clamped / r : 0;
    return { point: [p[0] * k, p[1], p[2] * k], reachable };
  };

  /** Distance along the ray to a (yaw-rotated) box, or Infinity (slab test in box space). */
  const rayBox = (origin: Vec3, dir: Vec3, b: Box) => {
    const c = Math.cos(-b.yaw);
    const s = Math.sin(-b.yaw);
    const rel = sub(origin, b.p);
    const o: Vec3 = [rel[0] * c - rel[2] * s, rel[1], rel[0] * s + rel[2] * c];
    const d: Vec3 = [dir[0] * c - dir[2] * s, dir[1], dir[0] * s + dir[2] * c];
    let tMin = 0;
    let tMax = Infinity;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-9) {
        if (Math.abs(o[i]) > H) return Infinity;
        continue;
      }
      const t1 = (-H - o[i]) / d[i];
      const t2 = (H - o[i]) / d[i];
      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));
      if (tMin > tMax) return Infinity;
    }
    return tMin;
  };

  /** Ray from the cursor: the nearest box it hits (any face), otherwise the floor. */
  const pick = (sx: number, sy: number) => {
    const dir = rayFrom(sx, sy);
    let best: { point: Vec3; box?: Box; t: number } | null = null;
    for (const b of freeBoxes()) {
      const t = rayBox(cam.pos, dir, b);
      // Report the box's own footprint so hovering any face targets that stack.
      if (t < Infinity && (!best || t < best.t)) best = { point: [b.p[0], b.p[1] + H, b.p[2]], box: b, t };
    }
    if (!best) {
      const t = dir[1] < -1e-6 ? -cam.pos[1] / dir[1] : 40;
      best = { point: add(cam.pos, mul(dir, t)), t };
    }
    return best;
  };

  // ---- Task planning ----------------------------------------------------------------------
  /** Rise to a safe height, travel above the goal, then descend. `from` is where the tool starts. */
  const moveVia = (to: Vec3, psiGoal?: number, from: Vec3 = forward(joints).tip): Step[] => {
    const safe = safeHeight();
    const tip = from;
    const steps: Step[] = [];
    if (tip[1] < safe - 0.05) steps.push({ kind: "move", to: [tip[0], safe, tip[2]] });
    steps.push({ kind: "move", to: [to[0], safe, to[2]], psi: psiGoal });
    steps.push({ kind: "move", to, psi: psiGoal, speed: 0.9 });
    return steps;
  };

  const planPick = (b: Box): Step[] => {
    const psiGoal = alignPsi(b.yaw);
    return [
      ...moveVia([b.p[0], b.p[1] - H + HOLD_DROP, b.p[2]], psiGoal),
      { kind: "grip", close: true, box: b },
      { kind: "move", to: [b.p[0], safeHeight() + S, b.p[2]], speed: 0.9 }
    ];
  };

  const planPlace = (at: Vec3, boxYaw?: number, from?: Vec3): Step[] => {
    const surface = surfaceAt(at, S * 0.95);
    const psiGoal = boxYaw === undefined ? undefined : alignPsi(boxYaw - holdOffset);
    return [
      ...moveVia([at[0], surface + 0.004 + HOLD_DROP, at[2]], psiGoal, from),
      { kind: "grip", close: false },
      { kind: "move", to: [at[0], surface + S + 0.3, at[2]], speed: 0.9 }
    ];
  };

  /** Idle demo: move every box onto the goal tower, then switch towers. */
  const planDemo = (): Step[] => {
    const goalTop = topBoxNear(goal, S * 0.5);
    const goalYaw = goalTop ? goalTop.yaw : 0.35;
    if (held) return planPlace(goal, goalYaw);
    const candidates = freeBoxes()
      .filter((b) => isTop(b) && hdist(b.p, goal) > 0.08 && Math.abs(b.v[1]) < 0.01)
      .filter((b) => {
        const r = Math.hypot(b.p[0], b.p[2]);
        return r > REACH_MIN && r < REACH_MAX;
      })
      .sort((a, b) => b.p[1] - a.p[1]);
    if (candidates.length === 0) {
      goal = goal === spotA ? spotB : spotA;
      return [{ kind: "wait", time: 0.8 }];
    }
    const pickSteps = planPick(candidates[0]);
    const lift = pickSteps[pickSteps.length - 1];
    return [...pickSteps, ...planPlace(goal, goalYaw, lift.kind === "move" ? lift.to : undefined)];
  };

  // ---- Simulation -------------------------------------------------------------------------
  const stepPhysics = (dt: number) => {
    const free = freeBoxes().sort((a, b) => a.p[1] - b.p[1]);
    for (const b of free) {
      // Supported only when the centre is over the top face of a box below (or the floor).
      let support = 0;
      for (const o of free) {
        if (o !== b && hdist(o.p, b.p) < S * 0.55 && o.p[1] < b.p[1] - S * 0.5) support = Math.max(support, o.p[1] + H);
      }
      const bottom = b.p[1] - H;
      if (bottom > support + 1e-4 || b.v[1] > 0) {
        b.v[1] -= 9.8 * dt;
        b.p[1] += b.v[1] * dt;
        if (b.p[1] - H <= support) {
          b.p[1] = support + H;
          b.v[1] = b.v[1] < -1.2 ? -b.v[1] * 0.18 : 0;
        }
      }
      const resting = b.p[1] - H <= support + 1e-3;
      b.p[0] += b.v[0] * dt;
      b.p[2] += b.v[2] * dt;
      const friction = Math.exp(-dt * (resting ? 7 : 0.4));
      b.v[0] *= friction;
      b.v[2] *= friction;
    }
    // Side contacts: push overlapping boxes apart (a carried box shoves free ones).
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (Math.abs(a.p[1] - b.p[1]) > S * 0.95) continue;
        const d = hdist(a.p, b.p);
        const minDist = S * 0.98;
        if (d >= minDist) continue;
        const dir: Vec3 = d > 1e-5 ? norm([b.p[0] - a.p[0], 0, b.p[2] - a.p[2]]) : [1, 0, 0];
        const push = minDist - d;
        if (a.held && !b.held) {
          b.p = add(b.p, mul(dir, push));
        } else if (b.held && !a.held) {
          a.p = add(a.p, mul(dir, -push));
        } else if (!a.held && !b.held) {
          a.p = add(a.p, mul(dir, -push / 2));
          b.p = add(b.p, mul(dir, push / 2));
          a.v = add(a.v, mul(dir, -push * 2));
          b.v = add(b.v, mul(dir, push * 2));
        }
      }
    }
    // Keep everything on the floor disc.
    for (const b of boxes) {
      const r = Math.hypot(b.p[0], b.p[2]);
      if (r > FLOOR_RADIUS - H) {
        b.p[0] *= (FLOOR_RADIUS - H) / r;
        b.p[2] *= (FLOOR_RADIUS - H) / r;
      }
    }
  };

  const runStep = (dt: number) => {
    const step = queue[0];
    if (!step) return;
    stepTime += dt;
    let done = false;
    if (step.kind === "move") {
      if (step.psi !== undefined) psi += (step.psi - psi) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 6));
      const delta = sub(step.to, target);
      const distance = len(delta);
      const maxStep = (step.speed ?? 1.6) * dt;
      target = dt === 0 || distance <= maxStep ? step.to : add(target, mul(delta, maxStep / distance));
      const tip = forward(joints).tip;
      const psiDone = step.psi === undefined || Math.abs(step.psi - psi) < 0.03;
      done = (len(sub(tip, step.to)) < 0.02 && psiDone) || stepTime > 3.5 || dt === 0;
    } else if (step.kind === "grip") {
      if (step.close && step.box && !held) {
        held = step.box;
        held.held = true;
        held.v = [0, 0, 0];
        holdOffset = held.yaw - psi;
      } else if (!step.close && held) {
        held.held = false;
        held.v = [0, 0, 0];
        held = null;
      }
      done = stepTime > 0.25 || dt === 0;
    } else {
      done = stepTime > step.time || dt === 0;
    }
    if (done) {
      queue.shift();
      stepTime = 0;
    }
  };

  const update = (time: number, dt: number) => {
    if (time - lastPalette > 500) {
      lastPalette = time;
      palette = readPalette(root);
    }
    azimuth = AZIMUTH + Math.sin(time / 11000) * 0.06;
    updateCamera();

    // Hover target from the pointer
    hover = null;
    if (pointer) {
      const hit = pick(pointer.x, pointer.y);
      const clamped = clampReach(hit.point);
      const radius = held ? S * 0.95 : S * 0.6;
      const surface = surfaceAt(clamped.point, radius, held ?? undefined);
      hover = { point: [clamped.point[0], surface, clamped.point[2]], reachable: clamped.reachable };
    }

    if (queue.length > 0) {
      runStep(dt);
    } else if (hover && mode === "manual") {
      const aim: Vec3 = [hover.point[0], hover.point[1] + (held ? HOLD_DROP + 0.22 : 0.24), hover.point[2]];
      const box = held ? undefined : topBoxNear(hover.point, S * 0.6);
      if (box) psi += (alignPsi(box.yaw) - psi) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 5));
      const delta = sub(aim, target);
      const distance = len(delta);
      const maxStep = 2.6 * dt;
      target = dt === 0 || distance <= maxStep ? aim : add(target, mul(delta, maxStep / distance));
    } else if (!reduceMotion && time - lastInteraction > 2500) {
      mode = "auto";
      queue = planDemo();
      stepTime = 0;
    }

    // Servo-like joint tracking toward the IK solution
    const goalJoints = inverse(target, psi);
    const k = dt === 0 ? 1 : 1 - Math.exp(-dt * 10);
    joints = joints.map((q, i) => q + wrapAngle(goalJoints[i] - q) * k) as Joints;
    grip += ((held ? GRIP_CLOSED : GRIP_OPEN) - grip) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 14));

    const pose = forward(joints);
    if (held) {
      held.p = add(pose.tip, [0, H - HOLD_DROP, 0]);
      held.yaw = psi + holdOffset;
    }
    stepPhysics(dt);
  };

  /** Reduced motion: run queued work instantly and let the boxes settle. */
  const settleInstantly = () => {
    const now = performance.now();
    for (let guard = 0; queue.length > 0 && guard < 50; guard++) update(now, 0);
    update(now, 0);
    for (let i = 0; i < 240; i++) stepPhysics(1 / 60);
  };

  // ---- Drawing -----------------------------------------------------------------------------
  const strokeLine = (a: Vec3, b: Vec3, color: string, widthPx: number, alpha = 1) => {
    const [ax, ay] = project(a);
    const [bx, by] = project(b);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  /** Circle of `radius` around `center`, perpendicular to `axis`. */
  const ring = (center: Vec3, axis: Vec3, radius: number, color: string, alpha: number, widthPx = 1, segments = 40) => {
    const ax = norm(axis);
    const helper: Vec3 = Math.abs(ax[1]) < 0.9 ? UP : [1, 0, 0];
    const u = norm(cross(ax, helper));
    const v = cross(ax, u);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const [x, y] = project(add(center, add(mul(u, Math.cos(angle) * radius), mul(v, Math.sin(angle) * radius))));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const dotAt = (p: Vec3, radius: number, stroke: string) => {
    const [x, y] = project(p);
    ctx.fillStyle = palette.bg;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const polygon = (points: Vec3[], fill: string, alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach((p, i) => {
      const [x, y] = project(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawBox = (b: Box, scale: number) => {
    const c = Math.cos(b.yaw);
    const s = Math.sin(b.yaw);
    const corner = (dx: number, dy: number, dz: number): Vec3 => [
      b.p[0] + dx * c - dz * s,
      b.p[1] + dy,
      b.p[2] + dx * s + dz * c
    ];
    const v = [
      corner(-H, -H, -H), corner(H, -H, -H), corner(H, -H, H), corner(-H, -H, H),
      corner(-H, H, -H), corner(H, H, -H), corner(H, H, H), corner(-H, H, H)
    ];
    // Contact shadow on whatever is below
    const below = surfaceAt(b.p, S * 0.55, b);
    if (b.p[1] - H > below + 0.01) {
      const lift = b.p[1] - H - below;
      polygon([v[0], v[1], v[2], v[3]].map(([x, , z]) => [x, below + 0.002, z] as Vec3), palette.muted, clamp(0.3 - lift * 0.2, 0.05, 0.3));
    }
    const faces = [
      { idx: [4, 5, 6, 7], tint: 0.22 },
      { idx: [0, 1, 5, 4], tint: 0.08 },
      { idx: [1, 2, 6, 5], tint: 0.12 },
      { idx: [2, 3, 7, 6], tint: 0.08 },
      { idx: [3, 0, 4, 7], tint: 0.12 }
    ];
    for (const face of faces) {
      const pts = face.idx.map((i) => v[i]);
      const centre = mul(pts.reduce((acc, p) => add(acc, p), [0, 0, 0] as Vec3), 0.25);
      const normal = norm(sub(centre, b.p));
      if (dot(normal, sub(cam.pos, centre)) <= 0) continue;
      polygon(pts, palette.surface, 1);
      polygon(pts, palette.warm, face.tint);
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = palette.warm;
      ctx.lineWidth = 1.4 * scale;
      ctx.lineJoin = "round";
      ctx.beginPath();
      pts.forEach((p, i) => {
        const [x, y] = project(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  const drawArm = (pose: Pose, scale: number) => {
    // Shadow
    const shadow = [pose.base, pose.shoulder, pose.elbow, pose.wrist, pose.tip].map(([x, , z]) => [x, 0.001, z] as Vec3);
    for (let i = 1; i < shadow.length; i++) strokeLine(shadow[i - 1], shadow[i], palette.muted, 6 * scale, 0.14);

    ctx.lineCap = "round";
    // Base and links
    ring([0, 0.001, 0], UP, 0.26, palette.muted, 0.8, 1.5);
    strokeLine(pose.base, pose.shoulder, palette.muted, 15 * scale);
    strokeLine(pose.shoulder, pose.elbow, palette.ink, 11 * scale);
    strokeLine(pose.elbow, pose.wrist, palette.ink, 8.5 * scale);
    strokeLine(pose.wrist, pose.flange, palette.ink, 6 * scale);

    // Joint axes: one ring per axis, drawn perpendicular to its rotation axis
    const r = 0.085;
    ring([0, L0 * 0.55, 0], UP, 0.16, palette.accent, 0.55, 1.5 * scale); // q1
    ring(pose.shoulder, pose.n, r * 1.1, palette.accent, 0.8, 2 * scale); // q2
    ring(pose.elbow, pose.n, r, palette.accent, 0.8, 2 * scale); // q3
    ring(pose.roll, pose.a, r * 0.75, palette.accent, 0.8, 2 * scale); // q4
    ring(pose.wrist, pose.zp, r * 0.7, palette.accent, 0.8, 2 * scale); // q5
    ring(pose.flange, pose.t, r * 0.7, palette.accent, 0.8, 2 * scale); // q6
    dotAt(pose.shoulder, 4 * scale, palette.ink);
    dotAt(pose.elbow, 3.5 * scale, palette.ink);
    dotAt(pose.wrist, 3 * scale, palette.accent);

    // Parallel gripper: palm across the flange, two fingers down the tool axis
    const offset = mul(pose.g, grip);
    const palmA = sub(pose.flange, offset);
    const palmB = add(pose.flange, offset);
    strokeLine(palmA, palmB, palette.accent, 3.5 * scale);
    strokeLine(palmA, add(palmA, mul(pose.t, D6)), palette.accent, 3 * scale);
    strokeLine(palmB, add(palmB, mul(pose.t, D6)), palette.accent, 3 * scale);
  };

  function draw(time: number) {
    ctx.clearRect(0, 0, width, height);
    if (width === 0) return;
    const scale = clamp(Math.min(width, height) / 420, 0.7, 1.4);

    // Round floor grid
    for (let c = -1.5; c <= 1.5; c += 0.5) {
      const half = Math.sqrt(Math.max(0, FLOOR_RADIUS * FLOOR_RADIUS - c * c));
      const fade = 0.5 - Math.abs(c) * 0.2;
      strokeLine([c, 0, -half], [c, 0, half], palette.line, 1, fade);
      strokeLine([-half, 0, c], [half, 0, c], palette.line, 1, fade);
    }
    ring([0, 0, 0], UP, FLOOR_RADIUS, palette.line, 0.6, 1, 80);
    ring([0, 0, 0], UP, REACH_MAX, palette.accent, 0.12, 1, 80);

    // Demo tower spots
    for (const spot of [spotA, spotB]) ring([spot[0], 0.002, spot[2]], UP, H * 1.3, palette.muted, 0.35, 1, 28);

    const pose = forward(joints);

    // Hover marker on the surface under the cursor
    if (hover && queue.length === 0) {
      const color = hover.reachable ? palette.accent : palette.warm;
      ring([hover.point[0], hover.point[1] + 0.003, hover.point[2]], UP, held ? H * 1.25 : 0.09, color, 0.85, 1.5);
      strokeLine([hover.point[0], hover.point[1], hover.point[2]], pose.tip, color, 1, 0.25);
    }

    // Painter's order: boxes behind the wrist, the arm, then boxes in front.
    const depthOf = (p: Vec3) => dot(sub(p, cam.pos), cam.f);
    const armDepth = depthOf(pose.wrist);
    const sorted = [...boxes].sort((a, b) => depthOf(b.p) - depthOf(a.p));
    for (const b of sorted) if (depthOf(b.p) >= armDepth || b.held) drawBox(b, scale);
    drawArm(pose, scale);
    for (const b of sorted) if (depthOf(b.p) < armDepth && !b.held) drawBox(b, scale);

    if (readout && time - lastReadout > 120) {
      lastReadout = time;
      const deg = (a: number) => {
        const d = (a * 180) / Math.PI;
        return `${d >= 0 ? "+" : "-"}${Math.abs(d).toFixed(1).padStart(5, "0")}°`;
      };
      const num = (v: number) => `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(2)}`;
      const [q1, q2, q3, q4, q5, q6] = joints;
      const tallest = Math.round(Math.max(0, ...freeBoxes().map((b) => b.p[1] + H)) / S);
      readout.textContent =
        `q1 ${deg(q1)}  q2 ${deg(q2)}  q3 ${deg(q3)}\n` +
        `q4 ${deg(q4)}  q5 ${deg(q5)}  q6 ${deg(q6)}\n` +
        `tcp ${num(pose.tip[0])} ${num(pose.tip[1])} ${num(pose.tip[2])}\n` +
        `${mode === "auto" ? "auto  " : "manual"}  grip ${held ? "closed" : "open  "}  boxes ${boxes.length}  stack ${tallest}`;
    }
  }

  // ---- Loop and input --------------------------------------------------------------------
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    focal = DIST * Math.min((0.9 * width) / 3.1, (0.88 * height) / 2.5);
    updateCamera();
    if (!running) draw(performance.now());
  };

  const step = (time: number) => {
    frame = 0;
    const dt = Math.min(0.04, (time - lastTime) / 1000);
    lastTime = time;
    update(time, dt);
    draw(time);
    if (running) frame = requestAnimationFrame(step);
  };

  const redrawStatic = () => {
    settleInstantly();
    draw(performance.now());
  };

  const start = () => {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const toCanvas = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const takeControl = () => {
    lastInteraction = performance.now();
    if (mode === "auto") {
      // Finish nothing half-way: drop the demo plan, keep any box in the gripper.
      queue = [];
      mode = "manual";
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointer = toCanvas(event);
    takeControl();
    if (reduceMotion) redrawStatic();
  };

  const onPointerLeave = () => {
    pointer = null;
    lastInteraction = performance.now();
    if (reduceMotion) redrawStatic();
  };

  /** Click or tap: pick the box under the cursor, place the carried one, or add a box. */
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const at = toCanvas(event);
    takeControl();
    if (queue.length > 0) return;
    updateCamera();
    const hit = pick(at.x, at.y);
    const { point, reachable } = clampReach(hit.point);
    if (!reachable && event.pointerType !== "touch") return;
    if (held) {
      queue = planPlace(point);
    } else {
      const box = (hit.box && isTop(hit.box) ? hit.box : undefined) ?? topBoxNear(point, S * 0.6);
      if (box) queue = planPick(box);
      else if (boxes.length < MAX_BOXES) {
        boxes.push({ p: [point[0], 1.4, point[2]], yaw: Math.random() * Math.PI, v: [0, 0, 0], held: false });
      }
    }
    stepTime = 0;
    if (event.pointerType === "touch") pointer = null;
    if (reduceMotion) redrawStatic();
  };

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  const onVisibilityChange = () => (document.hidden ? stop() : start());
  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(canvas);
  visibility.observe(canvas);
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  updateCamera();
  resize();
  redrawStatic();
  start();

  return () => {
    stop();
    resizeObserver.disconnect();
    visibility.disconnect();
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
