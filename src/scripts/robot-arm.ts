// Interactive hero scene: a minimal 3-DOF robot arm drawn in perspective on a 2D canvas.
// The end effector follows the pointer (solved with analytic inverse kinematics); when idle
// it traces a figure-eight. No 3D library: a small camera transform and line drawing.

type Vec3 = [number, number, number];

// Arm geometry (metres, roughly): base column, upper arm, forearm, tool.
const L0 = 0.55;
const L1 = 1.0;
const L2 = 0.85;
const TOOL = 0.2;
const FLOOR_RADIUS = 1.9;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

interface Joints {
  yaw: number;
  shoulder: number;
  elbow: number;
}

/** Analytic IK for a yaw + 2-link planar arm (elbow-up solution). */
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

/** Forward kinematics: base, shoulder, elbow, wrist, tool tip in world coordinates. */
function forward({ yaw, shoulder, elbow }: Joints): Vec3[] {
  const toWorld = (r: number, h: number): Vec3 => [r * Math.cos(yaw), L0 + h, r * Math.sin(yaw)];
  const ex = L1 * Math.cos(shoulder);
  const ey = L1 * Math.sin(shoulder);
  const wx = ex + L2 * Math.cos(shoulder + elbow);
  const wy = ey + L2 * Math.sin(shoulder + elbow);
  // Keep the tool pointing straight down, like a pick-and-place gripper.
  return [[0, 0, 0], [0, L0, 0], toWorld(ex, ey), toWorld(wx, wy), toWorld(wx, wy - TOOL)];
}

interface Palette {
  accent: string;
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

  const pointerArea = root.closest<HTMLElement>("[data-robot-area]") ?? root;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let palette = readPalette(root);
  let joints: Joints = solveIk([0.9, 1.0, 0.5]);
  let target: Vec3 = [0.9, 1.0, 0.5];
  let pointer: { nx: number; ny: number } | null = null;
  let lastPointerAt = -Infinity;
  let camYaw = -0.35;
  let frame = 0;
  let running = false;
  let visible = true;
  let lastTime = performance.now();
  let lastReadout = 0;
  let lastPalette = 0;
  const trail: Vec3[] = [];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) draw(performance.now());
  };

  const project = ([x, y, z]: Vec3): [number, number, number] => {
    const pitch = 0.36;
    const dist = 4.6;
    const focal = Math.min(width, height) * 1.35;
    const cy0 = Math.cos(camYaw);
    const sy0 = Math.sin(camYaw);
    const x1 = x * cy0 - z * sy0;
    const z1 = x * sy0 + z * cy0;
    const y1 = y - 0.8;
    const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
    const depth = z2 + dist;
    // Base sits left of centre because the arm always reaches to the right.
    return [width * 0.34 + (x1 * focal) / depth, height * 0.5 - (y2 * focal) / depth, depth];
  };

  /**
   * Target point, driven by the pointer or an idle figure-eight. The arm always works to the
   * right of its base so it is seen in profile: pointer x sets the reach, y the height, and
   * x also swings the target slightly in depth to show the base rotating.
   */
  const computeTarget = (time: number): Vec3 => {
    let reach: number;
    let lift: number;
    let depth: number;
    if (pointer && time - lastPointerAt < 2500) {
      reach = 1.0 + pointer.nx * 0.5;
      lift = clamp(0.95 - pointer.ny * 0.65, 0.15, 1.65);
      depth = -pointer.nx * 0.45;
    } else {
      const t = time / 1000;
      reach = 1.05 + 0.4 * Math.sin(t * 0.6);
      lift = 0.9 + 0.35 * Math.sin(t * 1.2);
      depth = 0.45 * Math.cos(t * 0.6);
    }
    const right: Vec3 = [Math.cos(camYaw), 0, -Math.sin(camYaw)];
    const away: Vec3 = [Math.sin(camYaw), 0, Math.cos(camYaw)];
    return [right[0] * reach + away[0] * depth, lift, right[2] * reach + away[2] * depth];
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

  function draw(time: number) {
    ctx.clearRect(0, 0, width, height);
    if (width === 0) return;
    const scale = Math.min(width, height) / 400;

    // Round floor grid
    for (let c = -1.5; c <= 1.5; c += 0.5) {
      const half = Math.sqrt(Math.max(0, FLOOR_RADIUS * FLOOR_RADIUS - c * c));
      const fade = 0.55 - Math.abs(c) * 0.18;
      line([c, 0, -half], [c, 0, half], palette.line, 1, fade);
      line([-half, 0, c], [half, 0, c], palette.line, 1, fade);
    }
    ring([0, 0, 0], FLOOR_RADIUS, palette.line, 0.6, 72);
    ring([0, 0, 0], 0.32, palette.muted, 0.7);

    const points = forward(joints);
    const tip = points[4];

    // Shadow on the floor
    const shadow = points.map(([x, , z]) => [x, 0, z] as Vec3);
    for (let i = 1; i < shadow.length; i++) line(shadow[i - 1], shadow[i], palette.muted, 6 * scale, 0.18);

    // Target marker with a drop line to the floor
    line(target, [target[0], 0, target[2]], palette.accent, 1, 0.35);
    ring([target[0], 0, target[2]], 0.08, palette.accent, 0.5, 24);
    const [tx, ty] = project(target);
    ctx.strokeStyle = palette.accent;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 7 * scale, 0, Math.PI * 2);
    ctx.moveTo(tx - 12 * scale, ty);
    ctx.lineTo(tx - 4 * scale, ty);
    ctx.moveTo(tx + 4 * scale, ty);
    ctx.lineTo(tx + 12 * scale, ty);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Tool path
    for (let i = 1; i < trail.length; i++) {
      line(trail[i - 1], trail[i], palette.accent, 2 * scale, (i / trail.length) * 0.5);
    }

    // Arm links
    line(points[0], points[1], palette.muted, 12 * scale);
    line(points[1], points[2], palette.ink, 9 * scale);
    line(points[2], points[3], palette.ink, 7 * scale);
    line(points[3], points[4], palette.accent, 4 * scale);

    // Gripper fingers
    const [wx, wy] = project(points[3]);
    const [px, py] = project(tip);
    const angle = Math.atan2(py - wy, px - wx);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(angle + side * 0.55) * 12 * scale, py + Math.sin(angle + side * 0.55) * 12 * scale);
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
      const num = (v: number) => `${v >= 0 ? " " : "-"}${Math.abs(v).toFixed(2)}`;
      readout.textContent =
        `q0 ${deg(joints.yaw)}  q1 ${deg(joints.shoulder)}  q2 ${deg(joints.elbow)}\n` +
        `tcp x${num(tip[0])}  y${num(tip[1])}  z${num(tip[2])}`;
    }
  }

  const step = (time: number) => {
    frame = 0;
    const dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    if (time - lastPalette > 500) {
      lastPalette = time;
      palette = readPalette(root);
    }

    // Slow camera drift plus a little parallax from the pointer.
    const parallax = pointer ? pointer.nx * 0.12 : 0;
    camYaw += (-0.35 + Math.sin(time / 9000) * 0.15 + parallax - camYaw) * (1 - Math.exp(-dt * 2));

    target = computeTarget(time);
    const goal = solveIk(target);
    // Critically damped joint-space motion, like a servo following setpoints.
    const k = 1 - Math.exp(-dt * 5);
    joints = {
      yaw: joints.yaw + wrapAngle(goal.yaw - joints.yaw) * k,
      shoulder: joints.shoulder + (goal.shoulder - joints.shoulder) * k,
      elbow: joints.elbow + (goal.elbow - joints.elbow) * k
    };

    trail.push(forward(joints)[4]);
    if (trail.length > 48) trail.shift();

    draw(time);
    if (running) frame = requestAnimationFrame(step);
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

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const areaRect = pointerArea.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pointer = {
      nx: clamp((event.clientX - cx) / Math.max(rect.width * 0.75, areaRect.width / 2), -1, 1),
      ny: clamp((event.clientY - cy) / (rect.height / 2), -1, 1)
    };
    lastPointerAt = performance.now();
    if (reduceMotion) {
      // No animation loop: jump straight to the solved pose.
      target = computeTarget(lastPointerAt);
      joints = solveIk(target);
      draw(lastPointerAt);
    }
  };

  const onLeave = () => {
    lastPointerAt = performance.now() - 2000;
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
  pointerArea.addEventListener("pointermove", onPointerMove, { passive: true });
  pointerArea.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);
  resize();
  target = computeTarget(performance.now());
  joints = solveIk(target);
  draw(performance.now());
  start();

  return () => {
    stop();
    resizeObserver.disconnect();
    visibility.disconnect();
    pointerArea.removeEventListener("pointermove", onPointerMove);
    pointerArea.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
