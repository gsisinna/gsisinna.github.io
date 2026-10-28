// Interactive hero scene: a minimal 3-DOF robot arm drawn in perspective on a 2D canvas.
// Hover the scene and the gripper goes exactly under the cursor (the pointer is unprojected
// onto the arm's working plane, then solved with analytic inverse kinematics). Click or tap
// to pick up a part and click again to drop it. When idle the arm traces a figure-eight.
// No 3D library: a small camera transform and line drawing.

type Vec3 = [number, number, number];

// Arm geometry (metres, roughly): base column, upper arm, forearm, tool.
const L0 = 0.55;
const L1 = 1.0;
const L2 = 0.85;
const TOOL = 0.2;
const CUBE = 0.18;
const MAX_PARTS = 6;
const FLOOR_RADIUS = 1.6;

// Camera
const PITCH = 0.36;
const DIST = 5;
const LOOK_Y = 0.9;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

interface Joints {
  yaw: number;
  shoulder: number;
  elbow: number;
}

interface Part {
  p: Vec3;
  vy: number;
  spin: number;
  held: boolean;
}

/** Analytic IK for a yaw + 2-link planar arm (elbow-up), targeting the wrist position. */
function solveIk([x, y, z]: Vec3): Joints {
  const yaw = Math.atan2(z, x);
  const r = Math.hypot(x, z);
  const h = y - L0;
  const reach = clamp(Math.hypot(r, h), 0.3, L1 + L2 - 0.001);
  const cosElbow = clamp((reach * reach - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
  const elbow = -Math.acos(cosElbow);
  const shoulder = Math.atan2(h, r) - Math.atan2(L2 * Math.sin(elbow), L1 + L2 * Math.cos(elbow));
  return { yaw, shoulder, elbow };
}

/** Forward kinematics: floor, shoulder, elbow, wrist, tool tip in world coordinates. */
function forward({ yaw, shoulder, elbow }: Joints): Vec3[] {
  const toWorld = (r: number, h: number): Vec3 => [r * Math.cos(yaw), L0 + h, r * Math.sin(yaw)];
  const ex = L1 * Math.cos(shoulder);
  const ey = L1 * Math.sin(shoulder);
  const wx = ex + L2 * Math.cos(shoulder + elbow);
  const wy = ey + L2 * Math.sin(shoulder + elbow);
  // The tool always points straight down, like a pick-and-place gripper.
  return [[0, 0, 0], [0, L0, 0], toWorld(ex, ey), toWorld(wx, wy), toWorld(wx, wy - TOOL)];
}

interface Palette {
  accent: string;
  warm: string;
  ink: string;
  muted: string;
  line: string;
  bg: string;
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
    bg: get("--bg", "#0b0d0f")
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

  let width = 0;
  let height = 0;
  let focal = 1;
  let anchorX = 0;
  let anchorY = 0;
  let palette = readPalette(root);
  let camYaw = -0.35;
  let pointer: { x: number; y: number; touch: boolean; at: number } | null = null;
  let target: Vec3 = [1, 0.8, 0];
  let joints: Joints = solveIk([1, 0.8 + TOOL, 0]);
  let grip = 0.6; // finger opening angle
  let reachable = true;
  const parts: Part[] = [];
  const trail: Vec3[] = [];
  let frame = 0;
  let running = false;
  let visible = true;
  let lastTime = performance.now();
  let lastReadout = 0;
  let lastPalette = 0;

  const held = () => parts.find((part) => part.held);

  /** Fit the arm's workspace to the canvas: base on the left third, floor near the bottom. */
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Workspace: ~2 units to the right of the base, ~2.3 units tall.
    focal = DIST * Math.min((0.62 * width) / 2.0, (0.8 * height) / 2.3);
    anchorX = width * 0.32;
    anchorY = height * 0.47;
    if (!running) draw(performance.now());
  };

  const project = ([x, y, z]: Vec3): [number, number, number] => {
    const c = Math.cos(camYaw);
    const s = Math.sin(camYaw);
    const x1 = x * c - z * s;
    const z1 = x * s + z * c;
    const y1 = y - LOOK_Y;
    const y2 = y1 * Math.cos(PITCH) - z1 * Math.sin(PITCH);
    const z2 = y1 * Math.sin(PITCH) + z1 * Math.cos(PITCH);
    const depth = z2 + DIST;
    return [anchorX + (x1 * focal) / depth, anchorY - (y2 * focal) / depth, depth];
  };

  /** Pointer (canvas px) -> point on the vertical plane through the base that faces the camera. */
  const unproject = (sx: number, sy: number): Vec3 => {
    const dx = (sx - anchorX) / focal;
    const dy = (anchorY - sy) / focal;
    const cp = Math.cos(PITCH);
    const sp = Math.sin(PITCH);
    const t = (DIST * cp) / Math.max(0.2, cp - dy * sp);
    const x1 = dx * t;
    const y1 = dy * t * cp + (t - DIST) * sp;
    const c = Math.cos(camYaw);
    const s = Math.sin(camYaw);
    return [x1 * c, y1 + LOOK_Y, -x1 * s];
  };

  /** Where the tool tip should go: under the cursor, or along the idle figure-eight. */
  const computeTarget = (time: number): Vec3 => {
    let p: Vec3;
    // A touch target stays for a few seconds after the finger lifts, then the arm goes idle.
    if (pointer?.touch && time - pointer.at > 4000) pointer = null;
    if (pointer) {
      p = unproject(pointer.x, pointer.y);
    } else {
      const t = time / 1000;
      const lateral = 1.05 + 0.45 * Math.sin(t * 0.6);
      const depth = 0.4 * Math.cos(t * 0.6);
      const c = Math.cos(camYaw);
      const s = Math.sin(camYaw);
      p = [lateral * c + depth * s, 0.7 + 0.4 * Math.sin(t * 1.2), -lateral * s + depth * c];
    }
    // Keep the tip above the floor (and above a carried part) and out of the base column.
    const floor = held() ? CUBE + 0.02 : 0.03;
    p[1] = clamp(p[1], floor, 2.1);
    const r = Math.hypot(p[0], p[2]);
    if (r < 0.4) {
      const angle = r > 1e-3 ? Math.atan2(p[2], p[0]) : -camYaw;
      p[0] = Math.cos(angle) * 0.4;
      p[2] = Math.sin(angle) * 0.4;
    }
    return p;
  };

  const line = (a: Vec3, b: Vec3, color: string, widthPx: number, alpha = 1) => {
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

  const ring = (center: Vec3, radius: number, color: string, alpha: number, segments = 48) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const [x, y] = project([center[0] + Math.cos(a) * radius, center[1], center[2] + Math.sin(a) * radius]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const joint = (p: Vec3, radius: number, stroke: string) => {
    const [x, y] = project(p);
    ctx.fillStyle = palette.bg;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const drawPart = (part: Part, scale: number) => {
    const h = CUBE / 2;
    const c = Math.cos(part.spin);
    const s = Math.sin(part.spin);
    const corner = (dx: number, dy: number, dz: number): Vec3 => [
      part.p[0] + dx * c - dz * s,
      part.p[1] + dy,
      part.p[2] + dx * s + dz * c
    ];
    const v = [
      corner(-h, -h, -h), corner(h, -h, -h), corner(h, -h, h), corner(-h, -h, h),
      corner(-h, h, -h), corner(h, h, -h), corner(h, h, h), corner(-h, h, h)
    ];
    // Shadow under the part
    const shadow = [v[0], v[1], v[2], v[3]].map(([x, , z]) => project([x, 0.001, z]));
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = palette.muted;
    ctx.beginPath();
    shadow.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.fill();
    // Top face, then edges
    const top = [v[4], v[5], v[6], v[7]].map(project);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = palette.warm;
    ctx.beginPath();
    top.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.fill();
    ctx.globalAlpha = 1;
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (const [a, b] of edges) line(v[a], v[b], palette.warm, 1.5 * scale, 0.95);
  };

  function draw(time: number) {
    ctx.clearRect(0, 0, width, height);
    if (width === 0) return;
    const scale = clamp(Math.min(width, height) / 420, 0.7, 1.4);

    // Round floor grid
    for (let c = -1.5; c <= 1.5; c += 0.5) {
      const half = Math.sqrt(Math.max(0, FLOOR_RADIUS * FLOOR_RADIUS - c * c));
      const fade = 0.55 - Math.abs(c) * 0.22;
      line([c, 0, -half], [c, 0, half], palette.line, 1, fade);
      line([-half, 0, c], [half, 0, c], palette.line, 1, fade);
    }
    ring([0, 0, 0], FLOOR_RADIUS, palette.line, 0.6, 72);
    ring([0, 0, 0], 0.3, palette.muted, 0.7);

    const points = forward(joints);
    const tip = points[4];

    // Arm shadow on the floor
    const shadow = points.map(([x, , z]) => [x, 0, z] as Vec3);
    for (let i = 1; i < shadow.length; i++) line(shadow[i - 1], shadow[i], palette.muted, 6 * scale, 0.16);

    // Parts on the floor (and the one being carried)
    for (const part of parts) drawPart(part, scale);

    // Target: crosshair at the cursor, drop line and footprint on the floor
    const targetColor = reachable ? palette.accent : palette.warm;
    line(target, [target[0], 0, target[2]], targetColor, 1, 0.3);
    ring([target[0], 0, target[2]], 0.09, targetColor, 0.5, 24);
    const [tx, ty] = project(target);
    ctx.strokeStyle = targetColor;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 7 * scale, 0, Math.PI * 2);
    ctx.moveTo(tx - 13 * scale, ty);
    ctx.lineTo(tx - 4 * scale, ty);
    ctx.moveTo(tx + 4 * scale, ty);
    ctx.lineTo(tx + 13 * scale, ty);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Tool path
    for (let i = 1; i < trail.length; i++) {
      line(trail[i - 1], trail[i], palette.accent, 2 * scale, (i / trail.length) * 0.45);
    }

    // Arm links
    ctx.lineCap = "round";
    line(points[0], points[1], palette.muted, 13 * scale);
    line(points[1], points[2], palette.ink, 10 * scale);
    line(points[2], points[3], palette.ink, 8 * scale);
    line(points[3], points[4], palette.accent, 4 * scale);

    // Gripper fingers, opening and closing
    const [wx, wy] = project(points[3]);
    const [px, py] = project(tip);
    const angle = Math.atan2(py - wy, px - wx);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3 * scale;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(angle + side * grip) * 13 * scale, py + Math.sin(angle + side * grip) * 13 * scale);
      ctx.stroke();
    }

    joint(points[1], 7 * scale, palette.muted);
    joint(points[2], 6 * scale, palette.ink);
    joint(points[3], 5 * scale, palette.accent);

    if (readout && time - lastReadout > 120) {
      lastReadout = time;
      const deg = (a: number) => {
        const d = (a * 180) / Math.PI;
        return `${d >= 0 ? "+" : "-"}${Math.abs(d).toFixed(1).padStart(5, "0")}°`;
      };
      const num = (v: number) => `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(2)}`;
      const resting = parts.filter((part) => !part.held).length;
      readout.textContent =
        `q0 ${deg(joints.yaw)}  q1 ${deg(joints.shoulder)}  q2 ${deg(joints.elbow)}\n` +
        `tcp ${num(tip[0])} ${num(tip[1])} ${num(tip[2])}\n` +
        `grip ${held() ? "closed" : "open  "}  parts ${resting}${reachable ? "" : "  · out of reach"}`;
    }
  }

  const update = (time: number, dt: number) => {
    if (time - lastPalette > 500) {
      lastPalette = time;
      palette = readPalette(root);
    }

    camYaw += (-0.35 + Math.sin(time / 9000) * 0.12 - camYaw) * (1 - Math.exp(-dt * 2));

    target = computeTarget(time);
    // IK places the wrist above the target so the tool tip lands on it.
    const wristGoal: Vec3 = [target[0], target[1] + TOOL, target[2]];
    reachable = Math.hypot(Math.hypot(wristGoal[0], wristGoal[2]), wristGoal[1] - L0) <= L1 + L2;
    const goal = solveIk(wristGoal);
    // Critically damped joint-space motion, like servos following setpoints.
    const k = dt === 0 ? 1 : 1 - Math.exp(-dt * 6);
    joints = {
      yaw: joints.yaw + wrapAngle(goal.yaw - joints.yaw) * k,
      shoulder: joints.shoulder + (goal.shoulder - joints.shoulder) * k,
      elbow: joints.elbow + (goal.elbow - joints.elbow) * k
    };
    grip += ((held() ? 0.2 : 0.6) - grip) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 12));

    const tip = forward(joints)[4];
    for (const part of parts) {
      if (part.held) {
        part.p = [tip[0], tip[1] - CUBE / 2 - 0.01, tip[2]];
        part.spin = joints.yaw;
      } else if (part.p[1] > CUBE / 2) {
        part.vy -= 6 * dt;
        part.p[1] = Math.max(CUBE / 2, part.p[1] + part.vy * dt);
        if (dt === 0) part.p[1] = CUBE / 2;
      }
    }

    trail.push(tip);
    if (trail.length > 40) trail.shift();
  };

  const step = (time: number) => {
    frame = 0;
    const dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    update(time, dt);
    draw(time);
    if (running) frame = requestAnimationFrame(step);
  };

  /** Static redraw for reduced motion: jump straight to the solved pose. */
  const redrawStatic = () => {
    const now = performance.now();
    update(now, 0);
    trail.length = 0;
    draw(now);
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
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      touch: event.pointerType === "touch",
      at: performance.now()
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    pointer = toCanvas(event);
    if (reduceMotion) redrawStatic();
  };

  const onPointerLeave = (event: PointerEvent) => {
    // Touch "leaves" right after lifting the finger; keep the last target briefly visible.
    if (event.pointerType === "touch") return;
    pointer = null;
    if (reduceMotion) redrawStatic();
  };

  /** Click or tap: grab a nearby part (or a new one), or drop the one being carried. */
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    pointer = toCanvas(event);
    const carrying = held();
    if (carrying) {
      carrying.held = false;
      carrying.vy = 0;
    } else {
      const tip = forward(joints)[4];
      const nearby = parts
        .filter((part) => Math.hypot(part.p[0] - tip[0], part.p[2] - tip[2]) < 0.3 && tip[1] - part.p[1] < 0.45)
        .sort((a, b) => Math.hypot(a.p[0] - tip[0], a.p[2] - tip[2]) - Math.hypot(b.p[0] - tip[0], b.p[2] - tip[2]))[0];
      if (nearby) nearby.held = true;
      else {
        if (parts.length >= MAX_PARTS) parts.shift();
        parts.push({ p: [tip[0], tip[1] - CUBE / 2, tip[2]], vy: 0, spin: joints.yaw, held: true });
      }
    }
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
