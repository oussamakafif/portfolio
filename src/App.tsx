import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import {
  MapPin,
  Smartphone,
  Send,
  Sun,
  Moon,
  Lock,
  Database,
  ArrowRight,
  Mail,
  ExternalLink,
  GraduationCap,
  Award,
  Rocket,
  ChevronRight,
  ImagePlus,
  Wallet,
  QrCode,
  FileText,
  Phone,
  MessageCircle,
  CheckCircle2,
  Shield,
  Users,
  FolderOpen,
  Copy,
  Check,
  Play,
} from "lucide-react";

/* Custom SVG icons for Github & Linkedin (removed from lucide-react v1.x) */
const Github = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ============================================================================
 * 0. SPLASH CURSOR (Lightweight Desktop-Only WebGL2 Fluid Simulation)
 * ============================================================================ */

const SPLASH_QUALITY: Record<string, { sim: number; dye: number; iterations: number }> = {
  low: { sim: 48, dye: 384, iterations: 8 },
  medium: { sim: 72, dye: 768, iterations: 12 },
  high: { sim: 96, dye: 1024, iterations: 16 },
};

const SPLASH_VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
uniform vec2 texelSize;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const SPLASH_HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

const SPLASH_SHADERS: Record<string, string> = {
  copy: `uniform sampler2D uTexture; void main() { outColor = texture(uTexture, vUv); }`,
  clear: `uniform sampler2D uTexture; uniform float value; void main() { outColor = value * texture(uTexture, vUv); }`,
  splat: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 pointA; uniform vec2 pointB; uniform float radius; void main() { vec2 scale = vec2(aspectRatio, 1.0); vec2 pa = (vUv - pointA) * scale; vec2 ba = (pointB - pointA) * scale; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0); vec2 d = pa - ba * h; vec3 base = texture(uTarget, vUv).xyz; outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0); }`,
  burst: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec2 point; uniform float radius; uniform float strength; uniform float seed; void main() { vec2 d = (vUv - point) * vec2(aspectRatio, 1.0); float distance = length(d); vec2 direction = d / max(distance, 0.00001); float angle = atan(d.y, d.x); float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7); vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3); float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius); outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0); }`,
  crown: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec2 point; uniform float radius; uniform vec3 colorA; uniform vec3 colorB; uniform float seed; void main() { vec2 d = (vUv - point) * vec2(aspectRatio, 1.0); vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA; for (int i = 0; i < 7; i++) { float index = float(i); float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35; float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7)); float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9)); vec2 q = d - vec2(cos(angle), sin(angle)) * reach; ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2)); } outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0); }`,
  advection: `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation; void main() { vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize; outColor = texture(uSource, coord) / (1.0 + dissipation * dt); }`,
  divergence: `uniform sampler2D uVelocity; void main() { float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x; float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y; vec2 C = texture(uVelocity, vUv).xy; if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y; outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`,
  curl: `uniform sampler2D uVelocity; void main() { float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y; float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x; outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }`,
  vorticity: `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt; void main() { float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x; float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x; float C = texture(uCurl, vUv).x; vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0; vec2 velocity = texture(uVelocity, vUv).xy + force * dt; outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0); }`,
  pressure: `uniform sampler2D uPressure; uniform sampler2D uDivergence; void main() { float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x; float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x; float divergence = texture(uDivergence, vUv).x; outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0); }`,
  gradient: `uniform sampler2D uPressure; uniform sampler2D uVelocity; void main() { float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x; float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x; vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B); outColor = vec4(velocity, 0.0, 1.0); }`,
  display: `uniform sampler2D uTexture; uniform vec2 texelSize; uniform float shading; uniform float light; float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); } void main() { vec3 c = texture(uTexture, vUv).rgb; if (shading > 0.0) { float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb); float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb); vec3 n = normalize(vec3(dx, dy, length(texelSize))); c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading); } c = max(c, 0.0); float peak = max(c.r, max(c.g, c.b)); float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak); if (light > 0.5) { vec3 transmit = exp(-2.4 * c); float low = min(transmit.r, min(transmit.g, transmit.b)); float alpha = clamp(1.0 - low + grain, 0.0, 1.0); outColor = vec4(min(transmit - low, vec3(alpha)), alpha); } else { c = max(c + grain, 0.0); float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0); outColor = vec4(min(c, vec3(alpha)), alpha); } }`,
};

const clampVal = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseColor = (value: string): [number, number, number] => {
  let hex = String(value).replace("#", "").trim();
  if (hex.length === 3) hex = [...hex].map((char) => char + char).join("");
  const number = parseInt(hex.slice(0, 6), 16);
  if (Number.isNaN(number)) return [1, 1, 1];
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

const hsv = (h: number, s: number, v: number): [number, number, number] => {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const sector = ((i % 6) + 6) % 6;
  if (sector === 0) return [v, t, p];
  if (sector === 1) return [q, v, p];
  if (sector === 2) return [p, v, t];
  if (sector === 3) return [p, q, v];
  if (sector === 4) return [t, p, v];
  return [v, p, q];
};

function SplashCursor({
  colors = ["#EF4444", "#FB7185", "#DC2626"],
  rainbow = true,
  colorSpeed = 1,
  intensity = 1,
  size = 1,
  force = 1,
  swirl = 3,
  trail = 1,
  momentum = 1,
  shading = 0.8,
  quality = "low",
  clickSplash = true,
  intro = false,
  contained = false,
  theme = "dark",
  zIndex = 35,
  className = "",
  style = {},
}: {
  colors?: string[];
  rainbow?: boolean;
  colorSpeed?: number;
  intensity?: number;
  size?: number;
  force?: number;
  swirl?: number;
  trail?: number;
  momentum?: number;
  shading?: number;
  quality?: "low" | "medium" | "high";
  clickSplash?: boolean;
  intro?: boolean;
  contained?: boolean;
  theme?: "dark" | "light";
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isTouchOrMobile =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator?.maxTouchPoints ?? 0) > 0 || window.innerWidth < 768);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generation, setGeneration] = useState(0);

  const settings = {
    palette: (Array.isArray(colors) && colors.length ? colors : ["#ffffff"]).map(parseColor),
    rainbow,
    colorSpeed: Math.max(0, colorSpeed),
    intensity: Math.max(0, intensity),
    size: Math.max(0.05, size),
    force: Math.max(0, force),
    swirl: Math.max(0, swirl),
    trail: Math.max(0.05, trail),
    momentum: Math.max(0.05, momentum),
    shading: clampVal(shading, 0, 1),
    quality: SPLASH_QUALITY[quality] ? quality : "low",
    clickSplash,
    contained,
    light: theme === "light",
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const introRef = useRef(intro);

  useEffect(() => {
    if (isTouchOrMobile) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
    } catch {
      return undefined;
    }
    if (!gl) return undefined;
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");

    const renderable = (internal: number, format: number) => {
      if (!gl) return false;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(texture);
      return complete;
    };
    const rgba = { internal: gl.RGBA16F, format: gl.RGBA };
    if (!renderable(rgba.internal, rgba.format)) return undefined;
    const rg = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;
    const r = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;

    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, SPLASH_VERTEX);
    const programs: Record<string, { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }> = {};
    let broken = false;
    Object.entries(SPLASH_SHADERS).forEach(([name, body]) => {
      const fragment = compile(gl!.FRAGMENT_SHADER, SPLASH_HEADER + body);
      const program = gl!.createProgram()!;
      gl!.attachShader(program, vertex);
      gl!.attachShader(program, fragment);
      gl!.bindAttribLocation(program, 0, "aPosition");
      gl!.linkProgram(program);
      gl!.deleteShader(fragment);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) broken = true;
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl!.getActiveUniform(program, i);
        if (info) uniforms[info.name] = gl!.getUniformLocation(program, info.name);
      }
      programs[name] = { program, uniforms };
    });
    gl.deleteShader(vertex);

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const targets = new Set<any>();
    let disposed = false;
    let lost = false;

    const release = () => {
      if (!gl || gl.isContextLost()) return;
      targets.forEach((target) => {
        gl!.deleteFramebuffer(target.fbo);
        gl!.deleteTexture(target.texture);
      });
      targets.clear();
      Object.values(programs).forEach((item) => gl!.deleteProgram(item.program));
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };

    if (broken) {
      release();
      return undefined;
    }

    const use = (name: string) => {
      const item = programs[name];
      gl!.useProgram(item.program);
      return item.uniforms;
    };

    const blit = (target: any) => {
      if (target) {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      } else {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    };

    const createTarget = (width: number, height: number, format: { internal: number; format: number }, filter: number) => {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl!.HALF_FLOAT, null);
      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, width, height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      const target = {
        texture,
        fbo,
        width,
        height,
        texelX: 1 / width,
        texelY: 1 / height,
        attach: (unit: number) => {
          gl!.activeTexture(gl!.TEXTURE0 + unit);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return unit;
        },
      };
      targets.add(target);
      return target;
    };

    const destroyTarget = (target: any) => {
      if (!target) return;
      gl!.deleteFramebuffer(target.fbo);
      gl!.deleteTexture(target.texture);
      targets.delete(target);
    };

    const reshape = (target: any, width: number, height: number, format: { internal: number; format: number }) => {
      gl!.bindTexture(gl!.TEXTURE_2D, target.texture);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl!.HALF_FLOAT, null);
      target.width = width;
      target.height = height;
      target.texelX = 1 / width;
      target.texelY = 1 / height;
    };

    const createDouble = (width: number, height: number, format: { internal: number; format: number }, filter: number) => {
      const pair: any = {
        read: createTarget(width, height, format, filter),
        write: createTarget(width, height, format, filter),
        width,
        height,
        texelX: 1 / width,
        texelY: 1 / height,
        swap: () => {
          const current = pair.read;
          pair.read = pair.write;
          pair.write = current;
        },
      };
      return pair;
    };

    const resizeDouble = (pair: any, width: number, height: number, format: { internal: number; format: number }, filter: number, keep: boolean) => {
      if (keep) {
        const next = createTarget(width, height, format, filter);
        const u = use("copy");
        gl!.uniform1i(u.uTexture, pair.read.attach(0));
        blit(next);
        destroyTarget(pair.read);
        pair.read = next;
      } else {
        reshape(pair.read, width, height, format);
      }
      reshape(pair.write, width, height, format);
      pair.width = width;
      pair.height = height;
      pair.texelX = 1 / width;
      pair.texelY = 1 / height;
    };

    const resolution = (base: number) => {
      const width = gl!.drawingBufferWidth;
      const height = gl!.drawingBufferHeight;
      const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
      const short = Math.round(base);
      const long = Math.round(base * aspect);
      return width > height ? { width: long, height: short } : { width: short, height: long };
    };

    const fit = () => {
      const ratio = 1;
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
    };

    const sizes = () => {
      const q = SPLASH_QUALITY[settingsRef.current.quality];
      const shortSide = Math.min(gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };
    };

    fit();
    const initial = sizes();
    const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);
    const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);
    const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);
    const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);
    const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);

    const resize = () => {
      fit();
      const next = sizes();
      if (dye.width !== next.ink.width || dye.height !== next.ink.height) {
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);
      }
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);
        reshape(divergence, next.sim.width, next.sim.height, r);
        reshape(curl, next.sim.width, next.sim.height, r);
      }
    };

    const radiusFor = (scale: number) => {
      const aspect = canvas.width / canvas.height;
      return ((0.2 * settingsRef.current.size * scale) / 100) * (aspect > 1 ? aspect : 1);
    };

    const splat = (ax: number, ay: number, bx: number, by: number, vx: number, vy: number, color: number[], radius: number) => {
      const u = use("splat");
      gl!.uniform1i(u.uTarget, velocity.read.attach(0));
      gl!.uniform1f(u.aspectRatio, canvas.width / canvas.height);
      gl!.uniform2f(u.pointA, ax, ay);
      gl!.uniform2f(u.pointB, bx, by);
      gl!.uniform3f(u.color, vx, vy, 0);
      gl!.uniform1f(u.radius, radius);
      blit(velocity.write);
      velocity.swap();
      gl!.uniform1i(u.uTarget, dye.read.attach(0));
      gl!.uniform3f(u.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    const colorAt = (offset: number, now: number) => {
      const s = settingsRef.current;
      const phase = (((offset + (now / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;
      if (s.rainbow) return hsv(phase, 1, 1);
      const palette = s.palette;
      if (palette.length === 1) return palette[0];
      const position = phase * palette.length;
      const from = palette[Math.floor(position) % palette.length];
      const to = palette[(Math.floor(position) + 1) % palette.length];
      const t = position - Math.floor(position);
      const blend = t * t * (3 - 2 * t);
      return [
        from[0] + (to[0] - from[0]) * blend,
        from[1] + (to[1] - from[1]) * blend,
        from[2] + (to[2] - from[2]) * blend,
      ];
    };

    const inkFor = (color: number[], amount: number) =>
      color.map((channel) => (settingsRef.current.light ? 1 - channel : channel) * amount);

    const flush = (pointer: any, dt: number, now: number) => {
      const s = settingsRef.current;
      const aspect = canvas.width / canvas.height;
      const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);
      if (length > 0.35) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        return;
      }
      let dx = pointer.x - pointer.px;
      let dy = pointer.y - pointer.py;
      if (aspect < 1) dx *= aspect;
      else dy /= aspect;
      const radius = radiusFor(1);
      const spread = 1 + length / (1.77 * Math.sqrt(radius));
      const push = (6000 * s.force) / Math.sqrt(spread);
      const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);
      const color = inkFor(colorAt(pointer.offset, now), amount);
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);
      pointer.px = pointer.x;
      pointer.py = pointer.y;
    };

    const burst = (x: number, y: number, now: number) => {
      const s = settingsRef.current;
      const seed = Math.random() * Math.PI * 2;
      const aspect = canvas.width / canvas.height;
      let u = use("burst");
      gl!.uniform1i(u.uTarget, velocity.read.attach(0));
      gl!.uniform1f(u.aspectRatio, aspect);
      gl!.uniform2f(u.point, x, y);
      gl!.uniform1f(u.radius, radiusFor(3));
      gl!.uniform1f(u.strength, 1100 * s.force);
      gl!.uniform1f(u.seed, seed);
      blit(velocity.write);
      velocity.swap();
      const offset = Math.random();
      const amount = 1.6 * s.intensity;
      const first = inkFor(colorAt(offset, now), amount);
      const second = inkFor(colorAt(offset + 0.3, now), amount);
      u = use("crown");
      gl!.uniform1i(u.uTarget, dye.read.attach(0));
      gl!.uniform1f(u.aspectRatio, aspect);
      gl!.uniform2f(u.point, x, y);
      gl!.uniform1f(u.radius, radiusFor(1.6));
      gl!.uniform3f(u.colorA, first[0], first[1], first[2]);
      gl!.uniform3f(u.colorB, second[0], second[1], second[2]);
      gl!.uniform1f(u.seed, seed);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number) => {
      const s = settingsRef.current;
      const iterations = SPLASH_QUALITY[s.quality].iterations;
      gl!.disable(gl!.BLEND);

      let u = use("curl");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(curl);

      u = use("vorticity");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uCurl, curl.attach(1));
      gl!.uniform1f(u.curl, s.swirl);
      gl!.uniform1f(u.dt, dt);
      blit(velocity.write);
      velocity.swap();

      u = use("divergence");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(divergence);

      u = use("clear");
      gl!.uniform1i(u.uTexture, pressure.read.attach(0));
      gl!.uniform1f(u.value, 0.1);
      blit(pressure.write);
      pressure.swap();

      u = use("pressure");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uDivergence, divergence.attach(0));
      for (let i = 0; i < iterations; i++) {
        gl!.uniform1i(u.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      u = use("gradient");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uPressure, pressure.read.attach(0));
      gl!.uniform1i(u.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      u = use("advection");
      gl!.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uSource, velocity.read.attach(0));
      gl!.uniform1f(u.dt, dt);
      gl!.uniform1f(u.dissipation, 2 / s.momentum);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uSource, dye.read.attach(1));
      gl!.uniform1f(u.dissipation, 3.5 / s.trail);
      blit(dye.write);
      dye.swap();
    };

    const render = () => {
      const s = settingsRef.current;
      gl!.disable(gl!.BLEND);
      const u = use("display");
      gl!.uniform2f(u.texelSize, 1 / gl!.drawingBufferWidth, 1 / gl!.drawingBufferHeight);
      gl!.uniform1i(u.uTexture, dye.read.attach(0));
      gl!.uniform1f(u.shading, s.shading);
      gl!.uniform1f(u.light, s.light ? 1 : 0);
      blit(null);
    };

    const clearScreen = () => {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
    };

    const pointers = new Map<string, any>();
    const bursts: { x: number; y: number }[] = [];
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const introPointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };
    let introStart = introRef.current && !reduced ? performance.now() + 150 : -1;
    let raf = 0;
    let last = 0;
    let lastActivity = performance.now();

    const advanceIntro = (now: number) => {
      if (introStart < 0) return;
      const progress = (now - introStart) / 1100;
      if (progress < 0) return;
      const t = Math.min(progress, 1);
      const eased = t * t * (3 - 2 * t);
      const x = 0.2 + 0.6 * eased;
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);
      if (!introPointer.ready) {
        introPointer.x = introPointer.px = x;
        introPointer.y = introPointer.py = y;
        introPointer.ready = true;
      } else {
        introPointer.x = x;
        introPointer.y = y;
        introPointer.moved = true;
      }
      if (t >= 1) introStart = -1;
      lastActivity = now;
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || lost) return;
      const s = settingsRef.current;
      const dt = clampVal((now - last) / 1000, 0, 1 / 60);
      last = now;
      resize();
      advanceIntro(now);
      if (introPointer.moved) {
        introPointer.moved = false;
        flush(introPointer, dt, now);
      }
      pointers.forEach((pointer) => {
        if (!pointer.moved) return;
        pointer.moved = false;
        flush(pointer, dt, now);
      });
      bursts.splice(0).forEach((point) => burst(point.x, point.y, now));
      step(dt);
      render();
      const quiet = (2.2 * s.trail + 0.4) * 1000;
      if (introStart >= 0 || now - lastActivity < quiet) raf = requestAnimationFrame(frame);
      else clearScreen();
    };

    const wake = () => {
      lastActivity = performance.now();
      if (raf || disposed || lost) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const locate = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      if (settingsRef.current.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;
      return { x, y };
    };

    const track = (id: string, clientX: number, clientY: number) => {
      const point = locate(clientX, clientY);
      let pointer = pointers.get(id);
      if (!point) {
        if (pointer) pointer.ready = false;
        return;
      }
      if (!pointer) {
        pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };
        pointers.set(id, pointer);
      }
      if (!pointer.ready) {
        pointer.x = pointer.px = point.x;
        pointer.y = pointer.py = point.y;
        pointer.ready = true;
        return;
      }
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.moved = true;
      wake();
    };

    const press = (clientX: number, clientY: number) => {
      if (!settingsRef.current.clickSplash) return;
      const point = locate(clientX, clientY);
      if (!point) return;
      bursts.push(point);
      wake();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch") track(`p${event.pointerId}`, event.clientX, event.clientY);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") press(event.clientX, event.clientY);
    };
    const onLeave = () => {
      pointers.forEach((pointer) => {
        pointer.ready = false;
      });
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration((value) => value + 1);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    resize();
    if (introStart >= 0) wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      release();
    };
  }, [generation, isTouchOrMobile]);

  if (isTouchOrMobile) return null;

  return (
    <div
      ref={rootRef}
      className={["splash-cursor", className].filter(Boolean).join(" ")}
      style={{ zIndex, position: "fixed", inset: 0, pointerEvents: "none", ...style }}
      data-contained={contained ? "" : undefined}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

/* ============================================================================
 * 1A. LIQUID GLASS NAVBAR (Zero-Overhead CSS Mode Enabled by Default)
 * ============================================================================ */

export type NimbusFx = "plane" | "drop" | "spin" | "glow" | "wave" | "pop" | "none";

export type LiquidNavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  fx?: NimbusFx;
};

export type LiquidNavbarProps = {
  items?: LiquidNavItem[];
  defaultActive?: number;
  active?: number;
  onChange?: (index: number, item: LiquidNavItem) => void;
  tone?: "light" | "dark";
  compact?: boolean;
  sound?: boolean;
  forceCss?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const I = (d: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

export const NimbusIcons = {
  home: I(
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path className="nv-door" d="M10 20v-5h4v5Z" />
    </>
  ),
  globe: I(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </>
  ),
  plane: I(<path d="M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13" />),
  drop: I(<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />),
  user: I(
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" />
    </>
  ),
};

const DEFAULT_ITEMS: LiquidNavItem[] = [
  { label: "Home", icon: NimbusIcons.home, fx: "glow" },
  { label: "About", icon: NimbusIcons.user, fx: "wave" },
  { label: "Experience", icon: NimbusIcons.drop, fx: "pop" },
  { label: "Work", icon: NimbusIcons.drop, fx: "pop" },
  { label: "Skills", icon: NimbusIcons.globe, fx: "spin" },
  { label: "Contact", icon: NimbusIcons.plane, fx: "plane" },
];

const PAD = 14;

const NIMBUS_CSS = `
.nimbus-nav{--n-tint:rgba(255,255,255,.78);--n-fg:#09090B;--n-fg-soft:rgba(9,9,11,.65);--n-rim:rgba(239,68,68,.42);
  position:relative;display:inline-flex;align-items:center;gap:4px;padding:8px 10px;border-radius:999px;isolation:isolate;
  font-family:'Plus Jakarta Sans',ui-sans-serif,-apple-system,system-ui,sans-serif;-webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.nimbus-nav[data-tone="dark"]{--n-tint:rgba(15,15,20,.84);--n-fg:#FFF1F2;--n-fg-soft:rgba(241,247,255,.66);--n-rim:rgba(239,68,68,.55)}
.nimbus-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--n-tint);
  -webkit-backdrop-filter:blur(16px) saturate(1.4) brightness(1.06);backdrop-filter:blur(16px) saturate(1.4) brightness(1.06);
  box-shadow:inset 0 1px 1px var(--n-rim),inset 0 0 0 1px rgba(239,68,68,.28),0 16px 40px -12px rgba(220,38,38,.48),0 4px 10px rgba(0,0,0,.25)}
.nimbus-nav[data-refract="on"] .nimbus-glass{-webkit-backdrop-filter:url(#nimbus-refract) blur(4px) saturate(1.3) brightness(1.06);backdrop-filter:url(#nimbus-refract) blur(4px) saturate(1.3) brightness(1.06)}
.nimbus-water{position:absolute;left:${-PAD}px;top:${-PAD}px;z-index:-1;pointer-events:none}
.nimbus-nav[data-gl="off"] .nimbus-water{display:none}
.nimbus-drop{display:none;position:absolute;top:7px;bottom:7px;left:0;border-radius:999px;z-index:-1;pointer-events:none;will-change:transform,width;
  background:radial-gradient(120% 140% at 30% 0%,rgba(254,202,202,.85),rgba(239,68,68,0) 55%),rgba(239,68,68,.38);
  box-shadow:inset 0 1px 1px rgba(255,241,242,.95),inset 0 -2px 6px rgba(220,38,38,.45),inset 0 0 0 1px rgba(239,68,68,.55),0 6px 16px -6px rgba(220,38,38,.55)}
.nimbus-nav[data-gl="off"] .nimbus-drop{display:block}
.nimbus-item{position:relative;z-index:1;display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 22px;border:0;border-radius:999px;background:none;color:var(--n-fg-soft);
  font-family:inherit;font-weight:700;font-size:15.5px;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .25s}
.nimbus-item:hover,.nimbus-item[aria-current="page"]{color:var(--n-fg)}
.nimbus-item:focus-visible{outline:2px solid #EF4444;outline-offset:2px}
.nv-ico{position:relative;display:inline-flex;flex:none}
.nv-ico svg{transition:transform .45s cubic-bezier(.3,1.6,.5,1)}
.nimbus-item[aria-current="page"] .nv-ico svg{transform:translateY(-1px) scale(1.08);color:#EF4444}
.nv-door{fill:transparent}
.nv-ico[data-fx="pop"] svg{animation:nvPop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes nvPop{0%{transform:scale(.72)}60%{transform:scale(1.22)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="plane"] svg{animation:nvPlane 1.15s cubic-bezier(.55,0,.3,1) both}
@keyframes nvPlane{0%{transform:none}12%{transform:translate(-3px,2px) rotate(7deg)}42%{transform:translate(64px,-26px) rotate(-24deg) scale(.9);opacity:0}43%{transform:translate(-60px,16px) rotate(-12deg) scale(.9);opacity:0}58%{opacity:1}80%{transform:translate(3px,-1px) rotate(2deg)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="drop"] svg{animation:nvDrop .95s cubic-bezier(.4,0,.3,1) both;transform-origin:50% 100%}
@keyframes nvDrop{0%{transform:translateY(-1px)}26%{transform:translateY(-13px) scale(.88,1.12)}46%{transform:translateY(3px) scale(1.3,.68)}62%{transform:translateY(-3px) scale(.92,1.08)}80%{transform:translateY(0) scale(1.04,.97)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="spin"] svg{animation:nvSpin 1s cubic-bezier(.2,.75,.25,1) both}
@keyframes nvSpin{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg) translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] svg{animation:nvHop .8s cubic-bezier(.3,1.4,.5,1) both;transform-origin:50% 100%}
@keyframes nvHop{0%{transform:none}30%{transform:translateY(-5px) scale(1.04,.96)}55%{transform:translateY(0) scale(1.12,.88)}75%{transform:translateY(-2px) scale(.98,1.04)}100%{transform:translateY(-1px) scale(1.08)}}
.nv-ico[data-fx="glow"] .nv-door{animation:nvDoor 1.3s ease both}
@keyframes nvDoor{0%{fill:transparent}30%{fill:#FCA5A5}100%{fill:rgba(239,68,68,.75)}}
.nv-ico[data-fx="wave"] svg{animation:nvWave .9s ease-in-out both;transform-origin:50% 92%}
@keyframes nvWave{0%{transform:none}20%{transform:rotate(-15deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(4deg)}100%{transform:translateY(-1px) scale(1.08)}}
@media (max-width:640px){.nimbus-nav:not([data-compact="false"]) .nimbus-item{height:42px;padding:0 14px;gap:7px}.nimbus-nav:not([data-compact="false"]) .nimbus-label{font-size:13px}}
`;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.12,.22)+fres*.55+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.14+.09*uDark);
 vec3 c=vec3(.45,.04,.08)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.,.9,.9),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(1.,.78,.80),vec3(.96,.25,.32),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

type Body = { x: number; v: number };
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number };
type Rip = { x: number; y: number; age: number; amp: number };

function makeState() {
  return {
    a: { x: 0, v: 0 } as Body,
    b: { x: 0, v: 0 } as Body,
    sy: { s: 1, v: 0 },
    lead: 0 as 0 | 1,
    lagFrom: 0,
    sats: [] as Sat[],
    rips: [] as Rip[],
    t: { x: 0, cy: 0, q: 0, r: 21 },
    q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null as null | { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> },
  };
}

function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.useProgram(p);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of ["uRes", "uDpr", "uTime", "uPill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb"]) {
    u[n] = gl.getUniformLocation(p, n);
  }
  return { gl, u };
}

function supportsRefraction() {
  if (typeof window === "undefined" || typeof CSS === "undefined") return false;
  const ua = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua) && !!(CSS as any).supports?.("backdrop-filter", "url(#a)");
}

export function LiquidNavbar({
  items = DEFAULT_ITEMS,
  defaultActive = 0,
  active,
  onChange,
  tone = "light",
  compact,
  sound = false,
  className,
  style,
}: LiquidNavbarProps) {
  const [inner, setInner] = useState(defaultActive);
  const current = active ?? inner;
  const navRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const st = useRef(makeState());
  const [gl, setGl] = useState<"on" | "off">("on");
  const [refract, setRefract] = useState(false);
  const [fx, setFx] = useState({ i: -1, n: 0 });
  const dark = tone === "dark" ? 1 : 0;
  const darkRef = useRef(dark);
  darkRef.current = dark;

  const draw = useCallback(() => {
    const s = st.current;
    const T = s.t;
    const sep = Math.abs(s.a.x - s.b.x);
    const thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1);
    const r = T.r * (1 - 0.3 * thin);
    if (s.glc) {
      const { gl: g, u } = s.glc;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2);
      g.uniform1f(u.uDpr, dpr);
      g.uniform1f(u.uTime, s.time);
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
      const blobs = new Float32Array(24);
      const sy = new Float32Array(6).fill(1);
      const head = s.lead === 0 ? s.a : s.b;
      const tail = s.lead === 0 ? s.b : s.a;
      blobs.set([head.x, T.cy, s.q * (1 - 0.25 * thin), T.r * (1 - 0.12 * thin), tail.x, T.cy, s.q * (1 - 0.8 * thin), T.r * (1 - 0.5 * thin)], 0);
      sy[0] = sy[1] = s.sy.s;
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4));
      g.uniform4fv(u.uBlob, blobs);
      g.uniform1fv(u.uSy, sy);
      const rips = new Float32Array(24);
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
      g.uniform4fv(u.uRip, rips);
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
      g.uniform1f(u.uDark, darkRef.current);
      g.uniform1f(u.uAmb, s.reduce ? 0 : 1);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    } else if (dropRef.current) {
      const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD;
      const width = sep + 2 * (s.q + r);
      dropRef.current.style.width = `${width}px`;
      dropRef.current.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`;
    }
  }, []);

  const step = useCallback((dt: number, now: number) => {
    const s = st.current;
    const T = s.t;
    s.time += dt;
    s.q += (T.q - s.q) * Math.min(1, dt * 12);
    const bodies = [s.a, s.b];
    let still = true;
    if (s.reduce) {
      s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = [];
    } else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead;
        const k = lead ? 210 : 72;
        const c = lead ? 25 : 13;
        const f = !lead && now < s.lagFrom ? 0.08 : 1;
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f;
        B.x += B.v * dt;
        const lo = PAD + 6 + s.q + T.r - 3, hi = PAD + s.w - 6 - s.q - T.r + 3;
        if (B.x < lo || B.x > hi) {
          s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016;
          B.x = Math.max(lo, Math.min(hi, B.x));
          B.v *= -0.25;
        }
        if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false;
      });
      const L = bodies[s.lead];
      const syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1);
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt;
      s.sy.s += s.sy.v * dt;
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false;

      const sep = Math.abs(s.a.x - s.b.x);
      const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1));
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        s.split = true;
        const lo = bodies[1 - s.lead], hi = bodies[s.lead];
        [0.3, 0.5, 0.72].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            y: T.cy + (Math.random() - 0.5) * 10,
            vx: (lo.v + hi.v) * 0.45,
            vy: (Math.random() - 0.5) * 60,
            r: 5 + Math.random() * 3 - j * 0.5,
            k: 70 + Math.random() * 90,
          });
        });
      }
      s.sats = s.sats.filter((d) => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt;
        d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x));
        d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y));
        if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26;
        return d.r > 0.6;
      });
      if (s.sats.length) still = false;
    }
    if (s.moving && still) {
      s.moving = false;
      if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 });
    }
    s.rips.forEach((p) => (p.age += dt));
    s.rips = s.rips.filter((p) => p.age < 2.4);
    const target = s.mouse.on ? 1 : 0;
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7);
  }, []);

  const loop = useCallback(() => {
    const s = st.current;
    if (s.raf) return;
    s.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      step(dt, now);
      draw();
      const busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01;
      if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick);
      else s.raf = 0;
    };
    s.raf = requestAnimationFrame(tick);
  }, [draw, step]);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = itemRefs.current[current];
    if (!nav || !el) return;
    const s = st.current;
    s.w = nav.offsetWidth;
    s.h = nav.offsetHeight;
    const T = s.t;
    T.r = el.offsetHeight / 2;
    T.q = Math.max(0, el.offsetWidth / 2 - T.r);
    T.cy = PAD + el.offsetTop + el.offsetHeight / 2;
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2;
    if (!s.ready) {
      s.a.x = s.b.x = nx;
      s.q = T.q;
      s.ready = true;
    } else if (Math.abs(nx - T.x) > 0.5) {
      s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1;
      s.lagFrom = performance.now() + 70;
      s.moving = true;
      s.split = false;
    }
    T.x = nx;
    const cv = canvasRef.current;
    if (cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = s.w + PAD * 2, Hh = s.h + PAD * 2;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hh * dpr);
        cv.style.width = `${W}px`;
        cv.style.height = `${Hh}px`;
      }
    }
    loop();
  }, [current, loop]);

  useEffect(() => {
    setRefract(supportsRefraction());
    const s = st.current;
    s.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const cv = canvasRef.current;
    s.glc = cv ? initGL(cv) : null;
    if (!s.glc) setGl("off");
    const lost = (e: Event) => { e.preventDefault(); s.glc = null; setGl("off"); };
    cv?.addEventListener("webglcontextlost", lost);
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop(); });
    if (navRef.current) io.observe(navRef.current);
    const vis = () => { s.visible = document.visibilityState === "visible"; if (s.visible) loop(); };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cv?.removeEventListener("webglcontextlost", lost);
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [loop]);

  useLayoutEffect(() => { measure(); }, [measure, items.length, compact]);
  const measureRef = useRef(measure);
  measureRef.current = measure;
  useEffect(() => {
    let lastW = -1;
    const ro = new ResizeObserver(() => {
      const w = navRef.current?.offsetWidth ?? 0;
      if (w !== lastW) { lastW = w; st.current.ready = false; measureRef.current(); }
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { loop(); }, [tone, loop]);

  const local = (clientX: number, clientY: number) => {
    const r = navRef.current!.getBoundingClientRect();
    return { x: clientX - r.left + PAD, y: clientY - r.top + PAD };
  };
  const ripple = (x: number, y: number, amp: number) => {
    const s = st.current;
    if (s.reduce) return;
    s.rips.push({ x, y, age: 0, amp });
    loop();
  };
  const iconCenter = (i: number) => {
    const el = iconRefs.current[i];
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return local(b.left + b.width / 2, b.top + b.height / 2);
  };
  const plip = () => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (audio.current ||= new AC());
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(420 + Math.random() * 80, t);
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.18);
    } catch {}
  };

  const select = (i: number) => {
    const kind = items[i]?.fx ?? (items[i]?.icon ? "pop" : "none");
    setFx((f) => ({ i, n: f.n + 1 }));
    plip();
    const c = iconCenter(i);
    if (c && kind === "drop") setTimeout(() => ripple(c.x, st.current.t.cy, 1.4), 430);
    if (c && kind === "plane") ripple(c.x, c.y, 0.6);
    if (i !== current) {
      if (active === undefined) setInner(i);
      onChange?.(i, items[i]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (current + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    select(n);
    itemRefs.current[n]?.focus();
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = local(e.clientX, e.clientY);
    const s = st.current;
    s.mouse.x = p.x;
    s.mouse.y = p.y;
    s.mouse.on = true;
    loop();
  };

  return (
    <nav
      ref={navRef as any}
      className={["nimbus-nav", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-gl={gl}
      data-compact={compact === undefined ? undefined : String(compact)}
      data-refract={refract ? "on" : "off"}
      aria-label="Main"
      onKeyDown={onKeyDown}
      onPointerMove={onMove}
      onPointerLeave={() => { st.current.mouse.on = false; loop(); }}
      onPointerDown={(e) => { const p = local(e.clientX, e.clientY); ripple(p.x, p.y, 0.8); }}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: NIMBUS_CSS }} />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="nimbus-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="60" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />
      {items.map((it, i) => {
        const kind = it.fx ?? "pop";
        const playing = fx.i === i && kind !== "none";
        const props = {
          ref: (el: HTMLElement | null) => { itemRefs.current[i] = el; },
          className: "nimbus-item",
          "aria-current": i === current ? ("page" as const) : undefined,
          onClick: () => select(i),
        };
        const content = (
          <>
            {it.icon && (
              <span className="nv-ico" key={playing ? fx.n : 0} data-fx={playing ? kind : undefined} ref={(el) => { iconRefs.current[i] = el; }}>
                {it.icon}
              </span>
            )}
            <span className="nimbus-label">{it.label}</span>
          </>
        );
        return it.href ? (
          <a key={it.label + i} {...(props as any)} href={it.href} aria-label={it.label}>{content}</a>
        ) : (
          <button key={it.label + i} {...(props as any)} type="button" aria-label={it.label}>{content}</button>
        );
      })}
    </nav>
  );
}

/* ============================================================================
 * 1B. /components/ui/timeline.tsx
 *     Scroll-linked animated timeline powered by framer-motion with laser beam
 * ============================================================================ */



/* ============================================================================
 * 1B. /components/ui/timeline.tsx
 * ============================================================================ */

export interface TimelineEntry {
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function Timeline({
  data,
  isDark = true,
  titleFirst = "Experience &",
  titleHighlight = "Journey",
  sectionSubtitle = "My journey through engineering, student leadership and mobile dev.",
}: {
  data: TimelineEntry[];
  isDark?: boolean;
  sectionTag?: string;
  titleFirst?: string;
  titleHighlight?: string;
  sectionSubtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateH = () => {
      if (ref.current) {
        setHeight(ref.current.getBoundingClientRect().height);
      }
    };
    updateH();
    window.addEventListener("resize", updateH);
    return () => window.removeEventListener("resize", updateH);
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 15%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className={`relative z-10 w-full transition-colors duration-500 py-20 px-4 sm:px-6 md:px-10 border-t ${
        isDark ? "border-white/5 bg-[#070709]/60" : "border-zinc-300/80 bg-[#DFE1E8]/70"
      }`}
    >
      <div className="max-w-6xl mx-auto mb-14 text-center sm:text-left">
        <SectionAnimatedHeading firstPart={titleFirst} highlightPart={titleHighlight} isDark={isDark} />
        <p className={`text-sm sm:text-base max-w-2xl leading-relaxed mt-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          {sectionSubtitle}
        </p>
      </div>

      <div ref={ref} className="relative max-w-6xl mx-auto pb-12">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col md:flex-row justify-start pt-8 md:pt-16 md:gap-10">
            <div className="relative md:sticky flex flex-row z-40 items-center md:top-28 self-start md:w-[320px] shrink-0 mb-4 md:mb-0">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-md shrink-0 ${
                  isDark
                    ? "bg-[#0B0B10] border-red-500/40 text-red-500 shadow-red-950/40"
                    : "bg-[#ECEEF3] border-red-500/40 text-red-600 shadow-zinc-300"
                }`}
              >
                {item.icon}
              </div>

              <div className="pl-3 md:pl-4">
                <span className="font-mono-code text-[11px] font-bold text-red-500 block uppercase tracking-wider">
                  {item.badge}
                </span>
                <h3
                  className={`font-sans font-bold text-lg sm:text-xl tracking-tight leading-snug ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {item.title}
                </h3>
                <span className={`text-xs block mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {item.subtitle}
                </span>
              </div>
            </div>

            <div className="relative pl-6 md:pl-4 w-full">{item.content}</div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute left-[17px] top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-red-500/20 to-transparent pointer-events-none"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-red-600 via-rose-500 to-amber-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.9)]"
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 1C. HERO ANIMATED NAME & UNIFIED SECTION HEADINGS
 * ============================================================================ */

function SectionAnimatedHeading({
  firstPart,
  highlightPart,
  isDark,
  centered = false,
}: {
  firstPart: string;
  highlightPart: string;
  isDark: boolean;
  centered?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${centered ? "flex justify-center" : ""}`}
    >
      <h2
        className={`font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] flex flex-wrap items-baseline gap-x-3 ${
          centered ? "justify-center text-center" : ""
        }`}
      >
        <span className={isDark ? "text-white" : "text-zinc-950 font-black"}>
          {firstPart}
        </span>

        <span className="relative inline-block">
          <span
            className={
              isDark
                ? "name-crimson-shimmer-dark inline-block"
                : "name-crimson-shimmer-light font-black inline-block"
            }
          >
            {highlightPart}
          </span>

          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-1.5 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-transparent origin-left shadow-[0_0_12px_rgba(239,68,68,0.8)]"
          />
        </span>
      </h2>
    </motion.div>
  );
}

function HeroAnimatedName({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative mb-3">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] flex flex-wrap items-baseline gap-x-3 sm:gap-x-4"
      >
        <span className={isDark ? "text-white" : "text-zinc-950 font-black"}>
          Oussama
        </span>
        <span
          className={
            isDark
              ? "name-crimson-shimmer-dark inline-block"
              : "name-crimson-shimmer-light font-black inline-block"
          }
        >
          Kafif
        </span>
      </motion.h1>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="h-[3px] w-44 sm:w-64 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-transparent origin-left shadow-[0_0_12px_rgba(239,68,68,0.8)]"
      />
    </div>
  );
}

/* ============================================================================
 * 1D. SECTION 3: GPU-ACCELERATED 1-INTO-3 EMULATOR SPLIT (#work)
 * ============================================================================ */

interface WorkEmulatorItem {
  id: "masarif" | "datahack" | "usthb";
  name: string;
  accentGlow: string;
  shortDesc: string;
  stack: string;
  repoUrl: string;
  screens: { title: string; subtitle: string; icon: any }[];
}

const MASARIF_GALLERY = [
  { src: "./masarif-dashboard.png", title: "Dashboard DZD ⇄ SAR" },
  { src: "./masarif-analytics.png", title: "Family Analytics" },
  { src: "./masarif-welcome.png", title: "Welcome Oasis" },
  { src: "./masarif-transfers.png", title: "Cross-Border Transfers" },
  { src: "./masarif-expense.png", title: "New Expense Entry" },
];

const USTHB_GALLERY = [
  { src: "./usthb-home.jpg", title: "Departments & Hub" },
  { src: "./usthb-cycles.jpg", title: "LMD & Ingénieur Cycles" },
  { src: "./usthb-specialties.png", title: "Specialties & Levels" },
  { src: "./usthb-courses.png", title: "Semester Courses" },
  { src: "./usthb-search.png", title: "Live Search & EMDs" },
  { src: "./usthb-roles.png", title: "3-Role Permission Engine" },
  { src: "./usthb-profile.jpg", title: "Student Profile & Dark Mode" },
  { src: "./usthb-welcome.png", title: "Welcome Screen" },
];

function WorkPhoneSplitSection({
  isDark,
  lang,
  clock,
  onOpenProjectModal,
}: {
  isDark: boolean;
  lang: "EN" | "FR";
  clock: string;
  onOpenProjectModal: (id: "masarif" | "datahack" | "usthb") => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [masarifGalleryIdx, setMasarifGalleryIdx] = useState(0);
  const [usthbGalleryIdx, setUsthbGalleryIdx] = useState(0);
  const [customScreens, setCustomScreens] = useState<Record<string, string>>({
    masarif: "",
    usthb: "",
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center 42%"],
  });

  const handleScreenUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomScreens((prev) => ({ ...prev, [id]: url }));
    }
  };

  const workItems: WorkEmulatorItem[] = [
    {
      id: "masarif",
      name: "Masarif (مصاريف)",
      accentGlow: "from-red-600/20 via-rose-500/10 to-transparent",
      shortDesc:
        lang === "EN"
          ? "Cross-border family budget & analytics tracker (Algeria ⇄ Saudi Arabia)."
          : "Application de suivi de budget familial transfrontalier (Algérie ⇄ Arabie Saoudite).",
      stack: "Flutter • Supabase • PostgreSQL",
      repoUrl: "https://github.com/oussamakafif/masarif",
      screens: [
        { title: "Dashboard Financier", subtitle: "Double devise DZD ⇄ SAR", icon: Wallet },
        { title: "Analytics Gauche", subtitle: "Filtre par membre familial", icon: Database },
        { title: "RLS Policies", subtitle: "Sécurisation Supabase", icon: Shield },
      ],
    },
    {
      id: "usthb",
      name: "USTHB Docs",
      accentGlow: "from-blue-600/20 via-sky-500/10 to-transparent",
      shortDesc:
        lang === "EN"
          ? "Academic document sharing platform with a 3-role permission engine."
          : "Plateforme de partage de ressources académiques USTHB à 3 rôles.",
      stack: "Flutter • Supabase • React",
      repoUrl: "https://github.com/oussamakafif/USTHB-SRC",
      screens: [
        { title: "Espace Étudiant", subtitle: "Modules CS & CyberSec", icon: FileText },
        { title: "Validation Délégué", subtitle: "Modération de cours", icon: CheckCircle2 },
        { title: "Super Admin", subtitle: "Gestion stockage Supabase", icon: Lock },
      ],
    },
  ];

  const dotTop = useTransform(scrollYProgress, (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    const travel = Math.min(1, clamped / 0.38);
    return `${Math.round(travel * 85)}%`;
  });

  const card0Transform = useTransform(scrollYProgress, (v) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return "none";
    const clamped = Math.max(0, Math.min(1, v));
    const travel = Math.min(1, clamped / 0.38);
    const split = Math.max(0, Math.min(1, (clamped - 0.28) / 0.72));
    const collapseOffsetPercent = (1 - split) * 48;
    const descendOffsetPx = (1 - travel) * -50;
    const rotateYDeg = (1 - split) * 12 + split * 2;
    const scaleVal = 0.92 + split * 0.08;
    return `translate3d(${collapseOffsetPercent}%, ${descendOffsetPx}px, 0px) rotateY(${rotateYDeg}deg) scale(${scaleVal})`;
  });
  const card0Opacity = useTransform(scrollYProgress, (v) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return 1;
    const clamped = Math.max(0, Math.min(1, v));
    const split = Math.max(0, Math.min(1, (clamped - 0.28) / 0.72));
    return 0.4 + split * 0.6;
  });

  const card1Transform = useTransform(scrollYProgress, (v) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return "none";
    const clamped = Math.max(0, Math.min(1, v));
    const travel = Math.min(1, clamped / 0.38);
    const split = Math.max(0, Math.min(1, (clamped - 0.28) / 0.72));
    const collapseOffsetPercent = -(1 - split) * 48;
    const descendOffsetPx = (1 - travel) * -50;
    const rotateYDeg = -(1 - split) * 12 - split * 2;
    const scaleVal = 0.92 + split * 0.08;
    return `translate3d(${collapseOffsetPercent}%, ${descendOffsetPx}px, 0px) rotateY(${rotateYDeg}deg) scale(${scaleVal})`;
  });
  const card1Opacity = useTransform(scrollYProgress, (v) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return 1;
    const clamped = Math.max(0, Math.min(1, v));
    const split = Math.max(0, Math.min(1, (clamped - 0.28) / 0.72));
    return 0.4 + split * 0.6;
  });

  const cardStyles = [
    { transform: card0Transform, opacity: card0Opacity, zIndex: 20 },
    { transform: card1Transform, opacity: card1Opacity, zIndex: 20 },
  ];

  return (
    <section id="work" ref={sectionRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-32">
      <div className="flex flex-col items-center mb-12">
        <div className="relative h-20 w-[2px] bg-gradient-to-b from-transparent via-red-500/40 to-red-600 overflow-visible mb-6">
          <motion.div
            style={{
              top: dotTop,
            }}
            className="absolute -left-[5px] w-3 h-3 rounded-full bg-red-500 shadow-[0_0_16px_3px_rgba(239,68,68,0.85)]"
          />
        </div>

        <SectionAnimatedHeading
          firstPart={lang === "EN" ? "Selected" : "Mes"}
          highlightPart={lang === "EN" ? "Work" : "Projets"}
          isDark={isDark}
          centered={true}
        />
      </div>

      <div className="relative mt-6">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 max-w-4xl mx-auto items-start relative z-10"
          style={{ perspective: "1600px" }}
        >
          {workItems.map((item, idx) => {
            return (
              <motion.div
                key={item.id}
                style={{
                  transform: cardStyles[idx].transform,
                  opacity: cardStyles[idx].opacity,
                  zIndex: cardStyles[idx].zIndex,
                }}
                className="flex flex-col items-center"
              >
                {/* Clickable Mobile Chassis */}
                <div
                  onClick={() => onOpenProjectModal(item.id)}
                  className="relative group/phone w-full max-w-[285px] sm:max-w-[305px] cursor-pointer"
                >
                  <div
                    className={`absolute -inset-3 rounded-[48px] bg-gradient-to-b ${item.accentGlow} blur-xl opacity-50 group-hover/phone:opacity-95 transition-opacity pointer-events-none`}
                  />

                  <div className="absolute top-4 inset-x-0 z-30 flex justify-center opacity-0 group-hover/phone:opacity-100 transition-all pointer-events-none -translate-y-1 group-hover/phone:translate-y-0">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white font-mono-code text-[10px] font-bold shadow-lg flex items-center gap-1.5">
                      <span>{lang === "EN" ? "Click to Expand" : "Cliquer pour Agrandir"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>

                  <div
                    className={`relative rounded-[40px] p-2.5 border-2 transition-all duration-300 group-hover/phone:-translate-y-2 group-hover/phone:scale-[1.02] ${
                      isDark
                        ? "bg-[#121218] border-white/15 group-hover/phone:border-red-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] group-hover/phone:shadow-[0_25px_60px_-10px_rgba(239,68,68,0.35)]"
                        : "bg-zinc-900 border-zinc-700 group-hover/phone:border-red-500 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.28)]"
                    }`}
                  >
                    <div
                      className={`w-full h-[420px] rounded-[31px] overflow-hidden flex flex-col justify-between relative border ${
                        isDark ? "bg-[#08080C] border-white/5 text-white" : "bg-[#F8FAFC] border-zinc-200 text-zinc-950"
                      }`}
                    >
                      <div
                        className={`px-4 pt-2.5 pb-2 flex items-center justify-between text-[10px] font-mono-code border-b ${
                          isDark ? "border-white/5 text-zinc-400" : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        <span>{clock}</span>
                        <div className="w-14 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-end pr-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </div>
                        <label
                          onClick={(e) => e.stopPropagation()}
                          title={lang === "EN" ? "Upload screenshot" : "Insérer capture d'écran"}
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          <ImagePlus className="w-3 h-3" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleScreenUpload(item.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {item.id === "masarif" ? (
                        <div className="relative flex-1 w-full h-full overflow-hidden group/masarifpic flex flex-col justify-between">
                          <img
                            src={MASARIF_GALLERY[masarifGalleryIdx].src}
                            alt={MASARIF_GALLERY[masarifGalleryIdx].title}
                            className="w-full h-full object-cover object-top transition-all duration-300"
                          />

                          {/* Top indicator tag */}
                          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 font-mono-code text-[9px] font-bold border border-emerald-500/30">
                              {MASARIF_GALLERY[masarifGalleryIdx].title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono-code text-[9px] border border-white/10">
                              {masarifGalleryIdx + 1}/{MASARIF_GALLERY.length}
                            </span>
                          </div>

                          {/* Gallery controls */}
                          <div className="absolute inset-x-0 bottom-2 flex items-center justify-between px-3 pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMasarifGalleryIdx((prev) => (prev > 0 ? prev - 1 : MASARIF_GALLERY.length - 1));
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm transition-colors border border-white/20 cursor-pointer shadow-md"
                              title="Previous Screen"
                            >
                              ‹
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex items-center gap-1.5 bg-black/65 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                              {MASARIF_GALLERY.map((_, gIdx) => (
                                <span
                                  key={gIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMasarifGalleryIdx(gIdx);
                                  }}
                                  className={`cursor-pointer rounded-full transition-all ${
                                    masarifGalleryIdx === gIdx ? "w-4 h-1.5 bg-emerald-400" : "w-1.5 h-1.5 bg-white/40 hover:bg-white"
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMasarifGalleryIdx((prev) => (prev + 1) % MASARIF_GALLERY.length);
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm transition-colors border border-white/20 cursor-pointer shadow-md"
                              title="Next Screen"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      ) : customScreens[item.id] ? (
                        <div className="relative flex-1 w-full h-full overflow-hidden group/scr">
                          <img
                            src={customScreens[item.id]}
                            alt={`${item.name} screenshot`}
                            className="w-full h-full object-cover object-top"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomScreens((prev) => ({ ...prev, [item.id]: "" }));
                            }}
                            className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/75 text-white font-mono-code text-[10px] opacity-0 group-hover/scr:opacity-100 transition-opacity cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      ) : item.id === "usthb" ? (
                        <div className="relative flex-1 w-full h-full overflow-hidden group/usthbpic flex flex-col justify-between">
                          <img
                            src={USTHB_GALLERY[usthbGalleryIdx].src}
                            alt={USTHB_GALLERY[usthbGalleryIdx].title}
                            className="w-full h-full object-cover object-top transition-all duration-300"
                          />

                          {/* Top indicator tag */}
                          <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-blue-950/85 backdrop-blur-md text-sky-300 font-mono-code text-[9px] font-bold border border-sky-400/35">
                              {USTHB_GALLERY[usthbGalleryIdx].title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono-code text-[9px] border border-white/10">
                              {usthbGalleryIdx + 1}/{USTHB_GALLERY.length}
                            </span>
                          </div>

                          {/* Gallery controls */}
                          <div className="absolute inset-x-0 bottom-2 flex items-center justify-between px-3 pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUsthbGalleryIdx((prev) => (prev > 0 ? prev - 1 : USTHB_GALLERY.length - 1));
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 hover:bg-blue-600 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm transition-colors border border-white/20 cursor-pointer shadow-md"
                              title="Previous Screen"
                            >
                              ‹
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex items-center gap-1 bg-black/65 px-2 py-1 rounded-full backdrop-blur-md border border-white/10 max-w-[150px] overflow-x-auto">
                              {USTHB_GALLERY.map((_, gIdx) => (
                                <span
                                  key={gIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUsthbGalleryIdx(gIdx);
                                  }}
                                  className={`cursor-pointer rounded-full transition-all shrink-0 ${
                                    usthbGalleryIdx === gIdx ? "w-3.5 h-1.5 bg-sky-400" : "w-1.5 h-1.5 bg-white/40 hover:bg-white"
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUsthbGalleryIdx((prev) => (prev + 1) % USTHB_GALLERY.length);
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 hover:bg-blue-600 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm transition-colors border border-white/20 cursor-pointer shadow-md"
                              title="Next Screen"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex-1 flex flex-col justify-between items-center text-center">
                          <div className="my-auto space-y-2">
                            <Smartphone className="w-10 h-10 mx-auto text-zinc-500 opacity-60" />
                            <div className="font-sans font-bold text-sm">{item.name}</div>
                            <div className="text-xs font-mono-code text-zinc-400">{item.stack}</div>
                          </div>
                          <div
                            className={`pt-2 w-full border-t flex items-center justify-center text-[10px] font-mono-code ${
                              isDark ? "border-white/10 text-zinc-500" : "border-zinc-200 text-zinc-500"
                            }`}
                          >
                            <span>{item.screens.length} Features</span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`py-2 flex justify-center border-t ${
                          isDark ? "border-white/5 bg-[#111116]/60" : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="w-20 h-1 rounded-full bg-zinc-500/40" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 w-full max-w-[295px] text-center flex flex-col items-center">
                  <h3
                    onClick={() => onOpenProjectModal(item.id)}
                    className="font-sans font-bold text-lg tracking-tight cursor-pointer hover:text-red-500 transition-colors"
                  >
                    {item.name}
                  </h3>
                  <p className={`text-xs leading-relaxed mt-1 mb-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {item.shortDesc}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenProjectModal(item.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-code text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      <span>Screenshots</span>
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono-code text-xs font-semibold border transition-all hover:border-red-500 hover:text-red-500 ${
                        isDark
                          ? "bg-white/[0.03] border-white/10 text-zinc-200"
                          : "bg-white border-zinc-200 text-zinc-800 shadow-2xs"
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 1D-B. INTERACTIVE FULL-PAGE / MODAL PROJECT SHOWCASE (Emulators & Captures)
 * ============================================================================ */

function ProjectModalViewer({
  projectId,
  onClose,
  isDark,
  lang,
  clock,
}: {
  projectId: "masarif" | "datahack" | "usthb" | null;
  onClose: () => void;
  isDark: boolean;
  lang: "EN" | "FR";
  clock: string;
}) {
  if (!projectId) return null;

  const projectDetails: Record<
    "masarif" | "datahack" | "usthb",
    {
      title: string;
      category: string;
      summary: string;
      repo: string;
      stack: string[];
      emulators: {
        title: string;
        tag: string;
        description: string;
        accent: string;
        image?: string;
        stats: { label: string; value: string }[];
      }[];
    }
  > = {
    masarif: {
      title: "Masarif (مصاريف)",
      category: lang === "EN" ? "Cross-Border Fintech & Family Budget Tracker" : "Fintech Familiale & Budget Transfrontalier",
      summary:
        lang === "EN"
          ? "Architected for real-time dual-currency tracking between Algeria (DZD) and Saudi Arabia (SAR). Built using Flutter with Supabase Row-Level Security (RLS) ensuring strict personal and family data privacy."
          : "Conçu pour le suivi instantané en double devise entre l'Algérie (DZD) et l'Arabie Saoudite (SAR). Développé sous Flutter avec la sécurité Supabase Row-Level Security (RLS) pour un cloisonnement étanche des dépenses.",
      repo: "https://github.com/oussamakafif/masarif",
      stack: ["Flutter", "Dart", "Supabase", "PostgreSQL", "RLS Engine", "Provider"],
      emulators: [
        {
          title: "Screen 01: Realtime Multi-Currency Dashboard",
          tag: "DZD ⇄ SAR Dashboard",
          description: "Live conversion engine, monthly family ledger, dual currency balance (DZD & SAR), and recent household purchase history.",
          accent: "#EF4444",
          image: "./masarif-dashboard.png",
          stats: [
            { label: "Active Currencies", value: "DZD & SAR" },
            { label: "Exchange Precision", value: "Realtime API" },
          ],
        },
        {
          title: "Screen 02: Family Member Analytics",
          tag: "Family Breakdown",
          description: "Interactive visual charts, breakdown per family member (Fatima, Yasmine, Ahmed), percentage shares, and category distributions.",
          accent: "#F97316",
          image: "./masarif-analytics.png",
          stats: [
            { label: "Tracked Members", value: "Multi-Role" },
            { label: "Charts Engine", value: "Custom Canvas" },
          ],
        },
        {
          title: "Screen 03: Welcome & Family Oasis",
          tag: "بوابة العائلة المشتركة",
          description: "Dual-currency welcome hub, biometric login, and secure Supabase Row-Level Security family onboarding.",
          accent: "#10B981",
          image: "./masarif-welcome.png",
          stats: [
            { label: "Authentication", value: "Supabase Auth" },
            { label: "Access Policy", value: "Strict RLS" },
          ],
        },
        {
          title: "Screen 04: International Transfers",
          tag: "Algeria ⇄ Saudi Arabia",
          description: "Incoming transfer logs from Saudi Arabia to Algeria with automatic exchange parity calculation.",
          accent: "#3B82F6",
          image: "./masarif-transfers.png",
          stats: [
            { label: "Transfer Corridor", value: "KSA ⇄ DZD" },
            { label: "Parity Calculator", value: "1 SAR ≈ 35.8 DZD" },
          ],
        },
        {
          title: "Screen 05: Categorized Expense Entry",
          tag: "Quick Category Logging",
          description: "Instant expense logging with category chips (Groceries, Fuel, Pharmacy, Bills, Dining) and payer attribution.",
          accent: "#8B5CF6",
          image: "./masarif-expense.png",
          stats: [
            { label: "Categories", value: "6 Presets" },
            { label: "Payer Attribution", value: "Family Roster" },
          ],
        },
      ],
    },
    datahack: {
      title: "DataHack Operations App",
      category: lang === "EN" ? "CSE Flagship Datathon Management Platform" : "Plateforme Opérationnelle du Grand Datathon CSE",
      summary:
        lang === "EN"
          ? "Sole developer for CSE's largest datathon operations: instant participant check-in via camera QR codes, cloud schedule broadcasts, and real-time mentor queue management."
          : "Développeur solo de l'application de gestion du plus grand datathon du CSE : check-in instantané des participants par QR Code, synchronisation du planning et gestion de la file d'attente des mentors.",
      repo: "https://github.com/oussamakafif/Organizer-App-DH",
      stack: ["Flutter", "Dart", "Firebase Auth", "Cloud Firestore", "Mobile Scanner QR"],
      emulators: [
        {
          title: "Screen 01: Sub-Second QR Scanner",
          tag: "Participant Check-In",
          description: "Instant barcode and QR hardware scan with real-time Firestore verification.",
          accent: "#EF4444",
          stats: [
            { label: "Scan Latency", value: "< 250ms" },
            { label: "Participants", value: "150+ Verified" },
          ],
        },
        {
          title: "Screen 02: Live Datathon Schedule",
          tag: "Realtime Broadcast",
          description: "Timeline synchronization, live event announcements, and dynamic phase updates.",
          accent: "#3B82F6",
          stats: [
            { label: "Sync Protocol", value: "Firestore Stream" },
            { label: "Notification", value: "Cloud Messaging" },
          ],
        },
        {
          title: "Screen 03: Mentor Dispatch Desk",
          tag: "Role-Based Guard",
          description: "Ticket dispatching, organizer approvals, and mentor room allocation.",
          accent: "#8B5CF6",
          stats: [
            { label: "Queue Logic", value: "FIFO Priority" },
            { label: "Role Guard", value: "Admin / Mentor" },
          ],
        },
      ],
    },
    usthb: {
      title: "USTHB Docs Ecosystem",
      category: lang === "EN" ? "University Academic Hub & Course Repository" : "Portail Académique & Hub de Ressources USTHB",
      summary:
        lang === "EN"
          ? "Centralizing academic computer science & cybersecurity engineering documents for USTHB students with a granular 3-tier permission engine (Student, Delegate, and Administrator)."
          : "Centralisation des cours et archives académiques en informatique et cybersécurité de l'USTHB avec un moteur de permissions à 3 niveaux (Étudiant, Délégué et Administrateur).",
      repo: "https://github.com/oussamakafif/USTHB-SRC",
      stack: ["Flutter", "Supabase Storage", "PostgreSQL", "React Admin", "PDF Viewer"],
      emulators: [
        {
          title: "Screen 01: Departments & Academic Hub",
          tag: "Trouvez vos documents académiques",
          description: "Department portal (Informatique, Mathématiques, Physique, Génie Civil, Biologie) with clean neumorphic navigation cards.",
          accent: "#3B82F6",
          image: "./usthb-home.jpg",
          stats: [
            { label: "Faculties", value: "5 Departments" },
            { label: "Interface", value: "Modern Flutter" },
          ],
        },
        {
          title: "Screen 02: Cycle Selector (LMD & Ingénieur)",
          tag: "Choisissez le cycle",
          description: "Hierarchical pathway selector: Système LMD (Licence - Master - Doctorat) and Cycle Ingénieur (Prépa & Spécialités).",
          accent: "#10B981",
          image: "./usthb-cycles.jpg",
          stats: [
            { label: "Cycle Routes", value: "LMD / Ingénieur" },
            { label: "Hierarchy", value: "Dynamic Routing" },
          ],
        },
        {
          title: "Screen 03: Specialties & Year Directory",
          tag: "Année et Spécialité",
          description: "Granular level filters: L1 Tronc Commun, L2 ISIL, L2 ACAD, L3 ISIL, L3 ACAD, M1 Génie Logiciel, and M1 Réseaux.",
          accent: "#6366F1",
          image: "./usthb-specialties.png",
          stats: [
            { label: "USTHB Specialties", value: "7+ Branches" },
            { label: "Level Depth", value: "L1 to M2" },
          ],
        },
        {
          title: "Screen 04: Semester Modules & Document Vault",
          tag: "Modules Semestre 1 & 2",
          description: "Module archives for Algorithmique 1, Analyse 1, Algèbre 1, Architecture des ordinateurs (24 documents per subject).",
          accent: "#06B6D4",
          image: "./usthb-courses.png",
          stats: [
            { label: "Documents", value: "24+ per Module" },
            { label: "Storage", value: "Supabase CDN" },
          ],
        },
        {
          title: "Screen 05: Realtime Search & EMD Finder",
          tag: "Moteur de Recherche Instantané",
          description: "Live search by module, exam subject (EMD), tutorial (TD), lab (TP), and popular search tags.",
          accent: "#F59E0B",
          image: "./usthb-search.png",
          stats: [
            { label: "Search Index", value: "Full-Text Search" },
            { label: "Popular Tags", value: "Algorithmique, EMD" },
          ],
        },
        {
          title: "Screen 06: 3-Role Permission Selector",
          tag: "Choisissez votre rôle",
          description: "Granular access management between Étudiant (view/download) and Étudiant Contributeur (upload & share).",
          accent: "#8B5CF6",
          image: "./usthb-roles.png",
          stats: [
            { label: "Role Control", value: "RBAC Engine" },
            { label: "Security", value: "Supabase Auth" },
          ],
        },
        {
          title: "Screen 07: Contributor Profile & Dark Mode",
          tag: "Profil & Paramètres",
          description: "User dashboard displaying university credentials (@usthb.edu.dz), contribution manager, alerts, and system dark mode toggle.",
          accent: "#EC4899",
          image: "./usthb-profile.jpg",
          stats: [
            { label: "University Mail", value: "@usthb.edu.dz" },
            { label: "Theme", value: "Dark / Light" },
          ],
        },
        {
          title: "Screen 08: Welcome & Onboarding",
          tag: "Welcome to USTHB DOCS",
          description: "Welcome screen introducing the collaborative student document sharing platform for exam and lecture preparation.",
          accent: "#EF4444",
          image: "./usthb-welcome.png",
          stats: [
            { label: "Platform", value: "Flutter Mobile" },
            { label: "Flow", value: "Animated Onboard" },
          ],
        },
      ],
    },
  };

  const project = projectDetails[projectId];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="font-mono-code text-[11px] uppercase tracking-wider text-red-500 font-bold block">
                {project.category}
              </span>
              <h2 className="font-sans font-extrabold text-xl sm:text-3xl text-white">{project.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono-code text-xs font-bold bg-white/10 text-white hover:bg-red-600 border border-white/15 transition-all"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border border-white/15"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">{project.summary}</p>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="font-mono-code text-[11px] font-bold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-6 flex-1 items-start">
          {project.emulators.map((emu, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex flex-col items-center"
            >
              <div
                className="relative w-full max-w-[275px] sm:max-w-[295px] rounded-[40px] p-2.5 bg-[#101016] border-2 border-white/15 shadow-[0_25px_60px_-15px_rgba(239,68,68,0.22)] transition-transform hover:scale-[1.02]"
                style={{ borderColor: `${emu.accent}66` }}
              >
                <div className="w-full h-[460px] rounded-[30px] bg-[#07070B] overflow-hidden flex flex-col justify-between text-white relative border border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400 border-b border-white/10 px-3.5 py-2.5 z-10 bg-black/60 backdrop-blur-sm">
                    <span>{clock}</span>
                    <div className="w-14 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-end pr-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <span className="font-bold text-red-400">FLUTTER</span>
                  </div>

                  {emu.image ? (
                    <div className="relative flex-1 w-full h-full overflow-hidden">
                      <img
                        src={emu.image}
                        alt={emu.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 my-auto p-4">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <span className="font-mono-code text-[10px] font-bold uppercase" style={{ color: emu.accent }}>
                          {emu.tag}
                        </span>
                        <h4 className="font-sans font-bold text-sm leading-tight text-white">{emu.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed pt-1">{emu.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {emu.stats.map((st, sIdx) => (
                          <div key={sIdx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="text-[10px] text-zinc-400 font-mono-code">{st.label}</div>
                            <div className="font-sans font-extrabold text-xs text-white mt-0.5">{st.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex justify-between text-[10px] font-mono-code text-zinc-400">
                          <span>Architecture Pipeline</span>
                          <span style={{ color: emu.accent }}>Ready</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${80 + idx * 8}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="py-2 flex justify-center border-t border-white/5 bg-black/60 z-10">
                    <div className="w-20 h-1 rounded-full bg-zinc-600" />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center max-w-[270px]">
                <h4 className="font-sans font-bold text-sm text-white">{emu.title}</h4>
                <span className="font-mono-code text-xs text-red-400 block mt-0.5">{emu.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-sans font-bold text-sm transition-all cursor-pointer shadow-lg shadow-red-600/30"
          >
            {lang === "EN" ? "Close Project Gallery" : "Fermer la Galerie"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================================
 * 1D-C. 3D TUNNEL INTRO DATA & SUBCOMPONENTS (On-Demand Replay)
 * ============================================================================ */

interface TunnelCardData {
  item: { title: string; category: string; accent: string };
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

const TUNNEL_ITEMS = [
  { title: "Flutter & Dart", category: "Core Mobile SDK", accent: "#EF4444" },
  { title: "Masarif App", category: "Cross-Border Fintech", accent: "#F97316" },
  { title: "DataHack App", category: "CSE Flagship Datathon", accent: "#DC2626" },
  { title: "USTHB CyberSec", category: "Engineering Specialization", accent: "#10B981" },
  { title: "Supabase & RLS", category: "PostgreSQL Security", accent: "#3B82F6" },
  { title: "CSE RELEV", category: "Ex-Department Lead", accent: "#8B5CF6" },
  { title: "USTHB Docs", category: "3-Tier Permission Hub", accent: "#EC4899" },
  { title: "CTFs & Networking", category: "Offensive & Defensive", accent: "#EAB308" },
];

const TUNNEL_CARDS: TunnelCardData[] = TUNNEL_ITEMS.map((item, i) => {
  const goldenAngle = i * 137.5 * (Math.PI / 180);
  const radiusFactorX = 0.28 + (i % 3) * 0.08;
  const radiusFactorY = 0.26 + (i % 2) * 0.09;

  return {
    item,
    angleCos: Math.cos(goldenAngle),
    angleSin: Math.sin(goldenAngle),
    radiusFactorX,
    radiusFactorY,
    rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
    index: i,
  };
});

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
}: {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
}) {
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1100 : -1600;
  const nearZ = stage.isMobile ? 320 : 480;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile
    ? Math.max(140, Math.min(190, stage.width * 0.42))
    : Math.max(190, Math.min(280, stage.width * 0.2));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 18 : 40;

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const offsetX = baseX - px * panStrength;
    const offsetY = baseY - py * panStrength;
    return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
  });

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        zIndex: card.index + 1,
      }}
      className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
    >
      <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-[#111118]/95 border border-white/10 p-5 flex flex-col justify-between shadow-2xl shadow-black/80 hover:border-red-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="font-mono-code text-[10px] uppercase font-bold text-red-500">0{card.index + 1} //</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.item.accent }} />
        </div>

        <div>
          <span className="text-[11px] font-mono-code text-zinc-400 block mb-1">{card.item.category}</span>
          <h3 className="font-sans font-extrabold text-lg sm:text-xl text-white leading-tight">{card.item.title}</h3>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-code text-zinc-500">
          <span>Oussama Kafif</span>
          <span style={{ color: card.item.accent }}>Active</span>
        </div>
      </div>
    </motion.div>
  );
}

export function PerspectiveTunnelIntro({ onEnter, lang }: { onEnter: () => void; lang: "EN" | "FR" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);

  const [stage, setStage] = useState<StageDimensions>({
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const rawProgress = useMotionValue(0.02);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 70,
    damping: 26,
    restDelta: 0.0001,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const curr = rawProgress.get();
      if (curr < 1) {
        rawProgress.set(Math.min(1, curr + 0.018));
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [rawProgress]);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (v) => {
      setPct(Math.min(100, Math.round(v * 100)));
      if (v >= 0.97) {
        onEnter();
      }
    });
    return () => unsub();
  }, [smoothProgress, onEnter]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = rawProgress.get();
      const delta = e.deltaY * 0.0011;
      const next = Math.min(1, Math.max(0, current + delta));
      rawProgress.set(next);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchStartY - y;
      touchStartY = y;
      const current = rawProgress.get();
      const next = Math.min(1, Math.max(0, current + dy * 0.0028));
      rawProgress.set(next);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [rawProgress]);

  const pointer = useCameraParallax(!reduce && !stage.isMobile);

  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.82, 1, 1.38]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.4, 1, 1, 0]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[90] h-[100svh] w-screen overflow-hidden bg-[#060609] text-white select-none flex items-center justify-center"
      style={{
        perspective: stage.isMobile ? "900px" : "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ef444428_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-75" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.22)_0%,transparent_72%)]" />

      <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-red-500/20" />
      <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

      <div className="absolute top-6 inset-x-6 z-40 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-mono-code text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>3D SPATIAL SEQUENCE</span>
        </div>
        <button
          type="button"
          onClick={onEnter}
          className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono-code text-xs font-bold bg-white/10 hover:bg-red-600 text-white border border-white/15 transition-all cursor-pointer"
        >
          <span>{lang === "EN" ? "Skip Intro" : "Passer l'Intro"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <motion.div
        style={{ scale: titleScale, opacity: titleOpacity }}
        className="pointer-events-none z-10 flex flex-col items-center text-center px-6 max-w-2xl"
      >
        <p className="text-xs font-mono-code uppercase tracking-[0.38em] text-red-500 mb-4">
          {lang === "EN" ? "Flutter Mobile & CyberSec Engineer" : "Ingénieur Mobile Flutter & CyberSec"}
        </p>
        <h1 className="text-4xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.94] bg-gradient-to-b from-white via-white to-red-500/70 bg-clip-text text-transparent">
          OUSSAMA
          <br />
          KAFIF.
        </h1>

        <div className="mt-7 pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onEnter}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-sans font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.65)] transition-all cursor-pointer"
          >
            <span>{lang === "EN" ? "Enter Portfolio Now" : "Entrer Maintenant"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-8 z-30 flex flex-col items-center gap-2.5 text-xs font-mono-code uppercase tracking-[0.25em] text-zinc-400">
        <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-100 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span>{lang === "EN" ? `Loading Experience • ${pct}%` : `Chargement du Portfolio • ${pct}%`}</span>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        {TUNNEL_CARDS.map((card, i) => (
          <TunnelCard
            key={i}
            card={card}
            progress={smoothProgress}
            pointer={pointer}
            total={TUNNEL_CARDS.length}
            stage={stage}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================================================
 * 0C. LIGHTWEIGHT 3D GLASS FOLDER CARDS (Zero CPU Fractal Generation)
 * ============================================================================ */

export type ArtPreset = "aurora" | "ember" | "dusk" | "glacier" | "verdant";

export type FolderFile = {
  name: string;
  meta?: string;
  art?: ArtPreset;
  image?: string;
  href?: string;
};

export type FolderMenuItem = {
  label: string;
  onSelect?: () => void;
  danger?: boolean;
};

export type GlassFolderProps = {
  label?: string;
  meta?: string;
  tone?: "light" | "dark";
  art?: ArtPreset | "none";
  image?: string;
  files?: FolderFile[];
  action?: "add" | "more" | "none";
  onAdd?: (files: FolderFile[]) => FolderFile | void;
  onFilesChange?: (files: FolderFile[]) => void;
  menu?: FolderMenuItem[];
  labelPlacement?: "bottom-left" | "top-left" | "top-right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFileSelect?: (file: FolderFile, index: number) => void;
  width?: number;
  appear?: boolean;
  appearDelay?: number;
  className?: string;
  style?: React.CSSProperties;
};

const FOLDER_BACK_GRADIENTS: Record<string, string> = {
  ember: "radial-gradient(circle at 25% 20%, #ef4a2b 0%, #7f1d1d 45%, #090b10 100%)",
  aurora: "radial-gradient(circle at 75% 20%, #c2433f 0%, #22395e 52%, #111827 100%)",
  dusk: "radial-gradient(circle at 30% 25%, #b3502f 0%, #3e2850 55%, #120c18 100%)",
  verdant: "radial-gradient(circle at 70% 25%, #a7843a 0%, #173024 55%, #070b08 100%)",
  glacier: "radial-gradient(circle at 30% 20%, #9fb4c7 0%, #334155 58%, #0f172a 100%)",
};

const FILE_GRADIENTS: Record<string, string> = {
  ember: "linear-gradient(135deg, #1a1416 0%, #7f1d1d 50%, #dc2626 100%)",
  aurora: "linear-gradient(135deg, #111827 0%, #1e3a8a 50%, #c2433f 100%)",
  dusk: "linear-gradient(135deg, #120c18 0%, #3e2850 50%, #b3502f 100%)",
  verdant: "linear-gradient(135deg, #070b08 0%, #173024 50%, #a7843a 100%)",
  glacier: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)",
};

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function fanSlot(index: number, count: number): number {
  return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
}

const GF_W = 340;
const GF_H = 272;
const HEADROOM = 54;
const FRONT_TOP = 74;
const FRONT_H = GF_H - FRONT_TOP;
const SHEET_W = 272;
const SHEET_H = 184;

const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z";
const FRONT_PATH =
  "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 " +
  (FRONT_H - 22) +
  "A22 22 0 0 1 318 " +
  FRONT_H +
  "L22 " +
  FRONT_H +
  "A22 22 0 0 1 0 " +
  (FRONT_H - 22) +
  "Z";

const MAX_VISIBLE = 4;

const SAMPLE_FILES: FolderFile[] = [
  { name: "Cover — final", meta: "PNG · 4.8 MB", art: "ember" },
  { name: "Moodboard", meta: "24 images", art: "dusk" },
  { name: "Brief.pdf", meta: "PDF · 1.2 MB" },
];

export function GlassFolder({
  label = "My Files",
  meta,
  tone = "light",
  art = "aurora",
  image,
  files: initialFiles = SAMPLE_FILES,
  action = "add",
  onAdd,
  onFilesChange,
  menu = [],
  labelPlacement = "bottom-left",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onFileSelect,
  width = 305,
  appear = true,
  appearDelay = 0,
  className,
  style,
}: GlassFolderProps) {
  const uid = React.useId().replace(/:/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const filesRef = React.useRef<HTMLDivElement>(null);
  const hitRef = React.useRef<HTMLButtonElement>(null);
  const keyRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [files, setFiles] = React.useState<FolderFile[]>(initialFiles);
  const ids = React.useRef<number[]>(initialFiles.map((_, i) => i));
  const nextId = React.useRef(initialFiles.length);
  const [dropped, setDropped] = React.useState<number | null>(null);
  const [bump, setBump] = React.useState(0);

  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [entered, setEntered] = React.useState(!appear);

  const k = width / GF_W;

  React.useEffect(() => {
    if (!appear) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    let t = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        t = window.setTimeout(() => setEntered(true), appearDelay);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [appear, appearDelay]);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty("--gf-px", px.toFixed(3));
      el.style.setProperty("--gf-py", py.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  React.useEffect(() => {
    filesRef.current?.toggleAttribute("inert", !open);
  }, [open]);

  React.useEffect(() => {
    if (!open && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        keyRef.current?.focus();
      } else {
        setOpen(false);
        hitRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(t) && !keyRef.current?.contains(t)) setMenuOpen(false);
      if (open && !menuOpen && !rootRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, menuOpen, setOpen]);

  React.useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
  }, [menuOpen]);

  const addFile = () => {
    const made = onAdd?.(files);
    const file: FolderFile = made || { name: "Module_" + (files.length + 1) + ".dart", meta: "Flutter · Ready" };
    const next = [...files, file];
    const id = nextId.current++;
    ids.current = [...ids.current, id];
    setFiles(next);
    setDropped(id);
    setBump((b) => b + 1);
    onFilesChange?.(next);
  };

  const menuItems: FolderMenuItem[] = [
    { label: open ? "Close folder" : "Open folder", onSelect: () => setOpen(!open) },
    ...menu,
  ];

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => {
      e.preventDefault();
      items[(i + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") setMenuOpen(false);
  };

  const start = Math.max(0, files.length - MAX_VISIBLE);
  const visible = files.slice(start);
  const count = files.length;
  const metaLine = meta ?? count + (count === 1 ? " file" : " files");

  return (
    <div
      ref={rootRef}
      className={"gf-root" + (className ? " " + className : "")}
      data-tone={tone}
      data-open={open || undefined}
      data-entered={entered || undefined}
      data-place={labelPlacement}
      style={{ width, height: (GF_H + HEADROOM) * k, ...style }}
    >
      <style>{GF_CSS}</style>
      <div className="gf-stage" style={{ transform: "translateY(" + HEADROOM * k + "px) scale(" + k + ")" }}>
        <div className="gf-tilt">
          <div className="gf-shadow" aria-hidden="true" />

          {/* GPU CSS Gradient Back Panel (Zero CPU Canvas Lag) */}
          <div className="gf-back" style={{ clipPath: "path('" + BACK_PATH + "')" }} aria-hidden="true">
            {image ? (
              <img className="gf-art" src={image} alt="" width={GF_W + 24} height={GF_H + 24} draggable={false} />
            ) : art !== "none" ? (
              <div
                className="gf-art"
                style={{
                  width: GF_W + 24,
                  height: GF_H + 24,
                  background: FOLDER_BACK_GRADIENTS[art] || FOLDER_BACK_GRADIENTS.ember,
                }}
              />
            ) : null}
            <div className="gf-back-sheen" />
          </div>
          <svg className="gf-rim gf-back-rim" viewBox={"0 0 " + GF_W + " " + GF_H} aria-hidden="true">
            <path d={BACK_PATH} />
          </svg>

          <div
            key={bump}
            className={"gf-front" + (bump ? " gf-front--bump" : "")}
            style={{ clipPath: "path('" + FRONT_PATH + "')" }}
          >
            <div className="gf-tint" aria-hidden="true" />
            <div className="gf-spec" aria-hidden="true" />
            <svg className="gf-rim gf-front-rim" viewBox={"0 0 " + GF_W + " " + FRONT_H} aria-hidden="true">
              <defs>
                <linearGradient id={"gf-rim-" + uid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="0.35" stopColor="#ef4444" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path d={FRONT_PATH} stroke={"url(#gf-rim-" + uid + ")"} />
            </svg>
            <button
              ref={hitRef}
              type="button"
              className="gf-hit"
              aria-expanded={open}
              aria-label={(open ? "Close " : "Open ") + label}
              onClick={() => {
                setMenuOpen(false);
                setOpen(!open);
              }}
            />
            <div className="gf-label">
              <span className="gf-title">{label}</span>
              <span className="gf-meta" key={metaLine}>
                {metaLine}
              </span>
            </div>
          </div>

          <div ref={filesRef} className="gf-files" role="list" aria-label={label + " contents"}>
            {visible.map((file, v) => {
              const id = ids.current[start + v];
              const slot = fanSlot(v, visible.length);
              const jitter = rng(hashString(file.name) + id);
              const picture = !!(file.art || file.image);
              const inner = (
                <>
                  {picture ? (
                    file.image ? (
                      <img className="gf-sheet-art" src={file.image} alt="" width={SHEET_W} height={SHEET_H} draggable={false} />
                    ) : (
                      <div
                        className="gf-sheet-art"
                        style={{
                          background: FILE_GRADIENTS[file.art as string] || "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)",
                        }}
                      />
                    )
                  ) : (
                    <span className="gf-lines" aria-hidden="true">
                      <i style={{ width: "86%" }} />
                      <i style={{ width: "92%" }} />
                      <i style={{ width: "64%" }} />
                      <i style={{ width: "88%" }} />
                      <i style={{ width: "42%" }} />
                    </span>
                  )}
                  <span className="gf-sheet-head">
                    <span className="gf-sheet-name">{file.name}</span>
                    {file.meta ? <span className="gf-sheet-meta">{file.meta}</span> : null}
                  </span>
                </>
              );
              const common = {
                className: "gf-sheet" + (picture ? " gf-sheet--art" : "") + (id === dropped ? " gf-sheet--drop" : ""),
                style: {
                  "--gf-slot": slot,
                  "--gf-depth": visible.length - 1 - v,
                  "--gf-jx": ((jitter() - 0.5) * 10).toFixed(2) + "px",
                  "--gf-jr": ((jitter() - 0.5) * 3.2).toFixed(2) + "deg",
                  zIndex: v + 1,
                } as React.CSSProperties,
                onAnimationEnd: id === dropped ? () => setDropped(null) : undefined,
              };
              return (
                <div key={id} role="listitem" className="gf-sheet-slot">
                  {file.href ? (
                    <a
                      {...common}
                      href={file.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onFileSelect?.(file, start + v)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button {...common} type="button" onClick={() => onFileSelect?.(file, start + v)}>
                      {inner}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {action !== "none" ? (
            <button
              ref={keyRef}
              type="button"
              className={"gf-key gf-key--" + action}
              aria-label={action === "add" ? "Add a file to " + label : "More options for " + label}
              aria-haspopup={action === "more" ? "menu" : undefined}
              aria-expanded={action === "more" ? menuOpen : undefined}
              aria-controls={action === "more" ? "gf-menu-" + uid : undefined}
              onClick={() => (action === "add" ? addFile() : setMenuOpen((m) => !m))}
            >
              {action === "add" ? (
                <svg key={bump} className="gf-glyph gf-glyph--plus" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4.5v15M4.5 12h15" />
                </svg>
              ) : (
                <svg className="gf-glyph gf-glyph--more" viewBox="0 0 30 12" aria-hidden="true">
                  <rect x="1" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="11" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="21" y="1.5" width="8" height="9" rx="3.4" />
                </svg>
              )}
            </button>
          ) : null}

          {action === "more" ? (
            <div
              ref={menuRef}
              id={"gf-menu-" + uid}
              role="menu"
              aria-label={label + " options"}
              className="gf-menu"
              data-open={menuOpen || undefined}
              onKeyDown={onMenuKey}
            >
              {menuItems.map((item, i) => (
                <button
                  key={item.label + i}
                  type="button"
                  role="menuitem"
                  tabIndex={menuOpen ? -1 : undefined}
                  disabled={!menuOpen}
                  className={"gf-menu-item" + (item.danger ? " gf-menu-item--danger" : "")}
                  onClick={() => {
                    setMenuOpen(false);
                    keyRef.current?.focus();
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const GF_CSS = `
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
.gf-root[data-tone="dark"] { --gf-ink: #f5f5f7; --gf-ink-soft: rgba(245, 245, 247, .62); }
.gf-root:hover, .gf-root:focus-within { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }
.gf-stage { position: absolute; left: 0; top: 0; width: 340px; height: 272px; transform-origin: 0 0; }
.gf-tilt { position: absolute; inset: 0; transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg)); transition: transform .9s var(--gf-ease); }
.gf-shadow { position: absolute; left: 18px; right: 18px; bottom: -6px; height: 60px; border-radius: 40px; background: rgba(16, 18, 24, .34); filter: blur(10px); transform: translateX(calc(var(--gf-px) * -8px)); transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(0, 0, 0, .68); }
.gf-back { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%); }
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #2a2a2e 0%, #121214 100%); }
.gf-art { position: absolute; left: -12px; top: -12px; max-width: none; object-fit: cover; transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02); transition: transform 1.1s var(--gf-ease); }
.gf-back-sheen { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%), radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%); pointer-events: none; }
.gf-rim { position: absolute; left: 0; top: 0; max-width: none; overflow: visible; pointer-events: none; fill: none; }
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .45); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(239, 68, 68, .28); }
.gf-files { position: absolute; inset: 0; z-index: 5; pointer-events: none; clip-path: inset(-400px -400px 10px -400px); }
.gf-sheet-slot { display: contents; }
.gf-sheet { all: unset; box-sizing: border-box; position: absolute; left: 34px; top: 96px; width: 272px; height: 184px; border-radius: 16px; overflow: hidden; cursor: pointer; pointer-events: auto; background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .1), 0 10px 26px -8px rgba(10, 12, 20, .28); transform-origin: 50% 100%; transform: translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1)) rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan))); transition: transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms), box-shadow .4s var(--gf-ease), translate .9s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-sheet { background: linear-gradient(180deg, #2c2c30 0%, #1c1c1f 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 0 .5px rgba(255, 255, 255, .08), 0 12px 28px -8px rgba(0, 0, 0, .7); }
.gf-sheet--art { background: #1a1a1d; }
.gf-root[data-open] .gf-sheet:hover, .gf-root[data-open] .gf-sheet:focus-visible { transform: translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px)) rotate(calc(var(--gf-slot) * var(--gf-fan) * .6)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 1px #ef4444, 0 22px 40px -12px rgba(239, 68, 68, .35); transition-delay: 0s; }
.gf-sheet:focus-visible { outline: 2px solid #ef4444; outline-offset: 2px; }
.gf-sheet-art { position: absolute; left: 0; top: 0; width: 272px; height: 184px; max-width: none; object-fit: cover; }
.gf-sheet--art::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(180deg, rgba(0, 0, 0, .48) 0%, rgba(0, 0, 0, 0) 40%); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2); pointer-events: none; }
.gf-sheet-head { position: absolute; left: 14px; right: 14px; top: 11px; z-index: 1; display: flex; align-items: baseline; justify-content: space-between; gap: 10px; white-space: nowrap; }
.gf-sheet-name { overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; font-weight: 700; letter-spacing: -.005em; color: #18181b; }
.gf-sheet-meta { flex: none; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .02em; color: rgba(24, 24, 27, .55); }
.gf-root[data-tone="dark"] .gf-sheet-name, .gf-sheet--art .gf-sheet-name { color: #fafafa; }
.gf-root[data-tone="dark"] .gf-sheet-meta, .gf-sheet--art .gf-sheet-meta { color: rgba(250, 250, 250, .75); }
.gf-lines { position: absolute; left: 14px; right: 14px; top: 40px; display: flex; flex-direction: column; gap: 9px; }
.gf-lines i { display: block; height: 5px; border-radius: 3px; background: rgba(24, 24, 27, .08); }
.gf-lines i:first-child { height: 9px; margin-bottom: 4px; background: rgba(239, 68, 68, .22); }
.gf-root[data-tone="dark"] .gf-lines i { background: rgba(255, 255, 255, .08); }
.gf-root[data-tone="dark"] .gf-lines i:first-child { background: rgba(239, 68, 68, .35); }
.gf-sheet--drop { animation: gf-drop .85s var(--gf-ease) both; }
@keyframes gf-drop { 0% { translate: 0 -190px; rotate: -9deg; opacity: 0; } 35% { opacity: 1; } 72% { translate: 0 10px; rotate: 1deg; } 100% { translate: 0 0; rotate: 0deg; opacity: 1; } }
.gf-front { position: absolute; left: 0; top: 74px; width: 340px; height: 198px; z-index: 10; -webkit-backdrop-filter: blur(10px) saturate(1.3); backdrop-filter: blur(10px) saturate(1.3); transform-origin: 50% 100%; transform: perspective(760px) rotateX(var(--gf-hinge)); transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease); }
.gf-front--bump { animation: gf-bump .7s var(--gf-ease) .38s both; }
@keyframes gf-bump { 0% { scale: 1; } 35% { scale: 1.018 .975; } 70% { scale: .996 1.006; } 100% { scale: 1; } }
.gf-tint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255, 255, 255, .18) 0%, rgba(255, 255, 255, .55) 42%, rgba(245, 245, 248, .93) 100%); }
.gf-root[data-tone="dark"] .gf-tint { background: linear-gradient(180deg, rgba(24, 18, 22, .22) 0%, rgba(16, 14, 18, .66) 46%, rgba(9, 9, 12, .95) 100%); }
.gf-spec { position: absolute; inset: 0; background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(239, 68, 68, .35), rgba(255, 255, 255, 0) 70%); mix-blend-mode: soft-light; opacity: .9; transition: background-position .6s var(--gf-ease); pointer-events: none; }
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .28; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.4; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .65; }
.gf-hit { all: unset; position: absolute; inset: 0; z-index: 1; cursor: pointer; }
.gf-label { position: absolute; z-index: 2; display: flex; flex-direction: column; gap: 4px; max-width: 215px; pointer-events: none; color: var(--gf-ink); }
.gf-root[data-place="bottom-left"] .gf-label { left: 28px; bottom: 32px; }
.gf-root[data-place="top-left"] .gf-label { left: 28px; top: 34px; }
.gf-root[data-place="top-right"] .gf-label { right: 32px; top: 52px; align-items: flex-start; }
.gf-title { font-size: 17.5px; font-weight: 800; line-height: 1.15; letter-spacing: -.015em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gf-meta { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: .03em; color: #ef4444; font-weight: 600; white-space: nowrap; animation: gf-roll .5s var(--gf-ease) both; }
@keyframes gf-roll { from { opacity: 0; translate: 0 7px; filter: blur(3px); } to { opacity: 1; translate: 0 0; filter: blur(0); } }
.gf-key { all: unset; box-sizing: border-box; position: absolute; right: 22px; bottom: 22px; z-index: 12; width: 54px; height: 54px; border-radius: 17px; display: grid; place-items: center; cursor: pointer; transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease); }
.gf-key:hover { transform: translateY(-2px); }
.gf-key:active { transform: translateY(0) scale(.93); transition-duration: .12s; }
.gf-key--add { color: #fff; background: radial-gradient(120% 90% at 50% 0%, #ef4444 0%, #b91c1c 65%, #7f1d1d 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .35), 0 10px 22px -6px rgba(239, 68, 68, .6); }
.gf-key--more { color: #111113; background: linear-gradient(180deg, rgba(255, 255, 255, .92) 0%, rgba(226, 226, 230, .82) 100%); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 #fff, 0 10px 18px -8px rgba(0, 0, 0, .3); }
.gf-root[data-tone="dark"] .gf-key--more { color: #f5f5f7; background: linear-gradient(180deg, rgba(239, 68, 68, .28) 0%, rgba(239, 68, 68, .12) 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22), 0 0 0 1px rgba(239, 68, 68, .35), 0 10px 18px -8px rgba(0, 0, 0, .6); }
.gf-glyph { display: block; max-width: none; fill: none; stroke: currentColor; stroke-linecap: round; }
.gf-glyph--plus { width: 24px; height: 24px; stroke-width: 1.8; animation: gf-turn .6s var(--gf-spring); }
.gf-glyph--more { width: 28px; height: 12px; stroke-width: 1.7; }
@keyframes gf-turn { from { rotate: -90deg; } to { rotate: 0deg; } }
.gf-menu { position: absolute; right: 22px; bottom: 86px; z-index: 20; min-width: 185px; padding: 6px; border-radius: 16px; display: flex; flex-direction: column; background: rgba(252, 252, 253, .92); -webkit-backdrop-filter: blur(16px) saturate(1.4); backdrop-filter: blur(16px) saturate(1.4); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .14), 0 24px 48px -16px rgba(10, 12, 20, .4); transform-origin: 100% 100%; opacity: 0; visibility: hidden; transform: translateY(6px) scale(.94); transition: opacity .2s var(--gf-ease), transform .32s var(--gf-spring), visibility 0s .32s; }
.gf-menu[data-open] { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.gf-root[data-tone="dark"] .gf-menu { background: rgba(20, 20, 26, .95); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 0 0 1px rgba(239, 68, 68, .3), 0 24px 48px -16px rgba(0, 0, 0, .85); }
.gf-menu-item { all: unset; box-sizing: border-box; padding: 9px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #18181b; cursor: pointer; }
.gf-root[data-tone="dark"] .gf-menu-item { color: #f4f4f5; }
.gf-menu-item:hover, .gf-menu-item:focus-visible { background: rgba(239, 68, 68, .15); color: #ef4444; }
.gf-root:not([data-entered]) .gf-back, .gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-key { opacity: 0; scale: .6; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }
.gf-key { transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), opacity .6s var(--gf-ease) .7s, scale .7s var(--gf-spring) .7s; }
`;

/* ============================================================================
 * 1F. GLASS FOLDERS ARCHIVE SECTION (Responsive Widths + 5 Project Folders)
 * ============================================================================ */

function GlassFoldersSection({ isDark, lang }: { isDark: boolean; lang: "EN" | "FR" }) {
  const tone = isDark ? "dark" : "light";
  const [folderWidth, setFolderWidth] = useState<number>(305);

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 360) setFolderWidth(250);
      else if (window.innerWidth < 480) setFolderWidth(275);
      else setFolderWidth(305);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const folders = [
    {
      label: "01 • Masarif App",
      meta: "Flutter · Supabase · RLS",
      art: "ember" as ArtPreset,
      action: "more" as const,
      files: [
        { name: "main_dashboard.dart", meta: "DZD ⇄ SAR Sync", art: "ember" as ArtPreset, href: "https://github.com/oussamakafif/masarif" },
        { name: "supabase_rls.sql", meta: "PostgreSQL Policy", href: "https://github.com/oussamakafif/masarif" },
        { name: "family_analytics.dart", meta: "Left-Tab Filter", art: "aurora" as ArtPreset, href: "https://github.com/oussamakafif/masarif" },
      ],
      menu: [
        { label: "Open GitHub Repo ↗", onSelect: () => window.open("https://github.com/oussamakafif/masarif", "_blank") },
      ],
    },
    {
      label: "02 • DH Organizer",
      meta: "Flutter · Firebase · QR",
      art: "aurora" as ArtPreset,
      action: "more" as const,
      files: [
        { name: "qr_checkin_scanner.dart", meta: "150+ Participants", art: "dusk" as ArtPreset, href: "https://github.com/oussamakafif/Organizer-App-DH" },
        { name: "firestore_live.dart", meta: "Realtime Schedule", href: "https://github.com/oussamakafif/Organizer-App-DH" },
        { name: "mentor_queue.dart", meta: "Role Guard Auth", art: "ember" as ArtPreset, href: "https://github.com/oussamakafif/Organizer-App-DH" },
      ],
      menu: [
        { label: "Open GitHub Repo ↗", onSelect: () => window.open("https://github.com/oussamakafif/Organizer-App-DH", "_blank") },
      ],
    },
    {
      label: "03 • USTHB Docs",
      meta: "Flutter · Supabase · React",
      art: "dusk" as ArtPreset,
      action: "more" as const,
      files: [
        { name: "role_engine.dart", meta: "Admin · Delegate · Student", art: "verdant" as ArtPreset, href: "https://github.com/oussamakafif/USTHB-SRC" },
        { name: "storage_buckets.sql", meta: "Academic PDFs", href: "https://github.com/oussamakafif/USTHB-SRC" },
        { name: "cybersec_courses.dart", meta: "USTHB Hub", art: "aurora" as ArtPreset, href: "https://github.com/oussamakafif/USTHB-SRC" },
      ],
      menu: [
        { label: "Open GitHub Repo ↗", onSelect: () => window.open("https://github.com/oussamakafif/USTHB-SRC", "_blank") },
      ],
    },
    {
      label: "04 • Media Manager",
      meta: "Java · OOP / POO · USTHB",
      art: "verdant" as ArtPreset,
      action: "add" as const,
      files: [
        { name: "MediaLibrary.java", meta: "Polymorphism & Inheritance", art: "verdant" as ArtPreset, href: "https://github.com/oussamakafif" },
        { name: "NetworkSocket.java", meta: "TCP/IP & OSI Model", href: "https://github.com/oussamakafif" },
        { name: "ArchitectureUML.pdf", meta: "Design Patterns", art: "glacier" as ArtPreset, href: "https://github.com/oussamakafif" },
      ],
      menu: [],
    },
    {
      label: "05 • CyberSec & CTF",
      meta: "Networking · Linux · C",
      art: "glacier" as ArtPreset,
      action: "more" as const,
      files: [
        {
          name: "HackTheBox_Profile.htb",
          meta: "HTB CyberSec Profile ↗",
          art: "aurora" as ArtPreset,
          href: "https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url",
        },
        {
          name: "packet_sniffer.c",
          meta: "Raw Sockets · C",
          art: "ember" as ArtPreset,
          href: "https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url",
        },
        {
          name: "ctf_writeups.md",
          meta: "USTHB CyberSec Cycle",
          href: "https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url",
        },
      ],
      menu: [
        {
          label: "Open HackTheBox Profile ↗",
          onSelect: () =>
            window.open(
              "https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url",
              "_blank"
            ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-code font-bold bg-red-500/10 text-red-500 border border-red-500/25 mb-3">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>{lang === "EN" ? "PROJECT ARCHIVES" : "ARCHIVES DES PROJETS"}</span>
        </span>
        <h3 className={`font-sans font-extrabold text-2xl sm:text-3xl tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
          {lang === "EN" ? "More Projects & Experiments" : "Autres Projets & Expériences"}
        </h3>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-x-8 sm:gap-x-10 gap-y-12">
        {folders.map((f, idx) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassFolder
              label={f.label}
              meta={f.meta}
              tone={tone}
              art={f.art}
              action={f.action}
              files={f.files}
              menu={f.menu}
              width={folderWidth}
              appearDelay={idx * 90}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 1F-B. SECTION 4: SKILLS & TECHNOLOGIES COMPONENT (#skills)
 * ============================================================================ */

interface TechItem {
  id: string;
  name: string;
  color: string;
  svg: React.ReactNode;
}

const OFFICIAL_TECH_SKILLS: TechItem[] = [
  {
    id: "flutter",
    name: "Flutter",
    color: "#38BDF8",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    ),
  },
  {
    id: "dart",
    name: "Dart",
    color: "#00B4AB",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 2.526.315l5.684 5.685c.632.631.948 1.579.948 2.526v11.368h-11.37L4.106 14.84V4.105zm1.895 12.632l4.42 4.42h8.843v-7.578l-6.947-6.948H5.999v10.106z" />
      </svg>
    ),
  },
  {
    id: "supabase",
    name: "Supabase",
    color: "#3ECF8E",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M13.7 21.8c-.5.6-1.5.2-1.5-.6v-7.5h8.4c1 0 1.6 1.2.9 2l-7.8 6.1zM10.3 2.2c.5-.6 1.5-.2 1.5.6v7.5H3.4c-1 0-1.6-1.2-.9-2l7.8-6.1z" />
      </svg>
    ),
  },
  {
    id: "firebase",
    name: "Firebase",
    color: "#FFCA28",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 0 0-.96 0L3.53 17.984z" />
      </svg>
    ),
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    color: "#60A5FA",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
  },
  {
    id: "java",
    name: "Java",
    color: "#F97316",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    id: "javascript",
    name: "JavaScript",
    color: "#FACC15",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="4" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.6" />
        <text x="6.5" y="17" fontSize="10.5" fontWeight="800" fontFamily="JetBrains Mono, monospace" fill="currentColor">
          JS
        </text>
      </svg>
    ),
  },
  {
    id: "c",
    name: "C Language",
    color: "#818CF8",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6" />
        <text x="8.2" y="16.2" fontSize="11.5" fontWeight="800" fontFamily="JetBrains Mono, monospace" fill="currentColor">
          C
        </text>
      </svg>
    ),
  },
  {
    id: "git",
    name: "Git",
    color: "#F43F5E",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="M6 8.5v7" />
        <path d="M18 8.5c0 4.5-12 2.5-12 7" />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    color: "#E4E4E7",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
        />
      </svg>
    ),
  },
  {
    id: "linux",
    name: "Linux",
    color: "#FBBF24",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m7 9 3 3-3 3" />
        <path d="M12 15h5" />
      </svg>
    ),
  },
  {
    id: "restapi",
    name: "REST API",
    color: "#EF4444",
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  
];

function DockKeyItem({
  tech,
  isDark,
  onSelect,
  isSelected,
}: {
  tech: TechItem;
  isDark: boolean;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl border transition-colors duration-200 cursor-pointer select-none ${
        isDark
          ? "bg-[#101016]/90 border-white/10 hover:border-red-500/60 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.5)]"
          : "bg-[#ECEEF3]/95 border-zinc-300/90 hover:border-red-500/60 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div
        className={`absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent ${
          isDark ? "via-white/25" : "via-white"
        } to-transparent opacity-80`}
      />

      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${tech.color}22, transparent 70%)`,
          boxShadow: isSelected ? `0 0 24px -4px ${tech.color}44` : undefined,
        }}
      />

      <div
        style={{ color: tech.color }}
        className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-108"
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-15 group-hover:opacity-30 transition-opacity"
          style={{ backgroundColor: tech.color }}
        />
        {tech.svg}
      </div>

      <span
        className={`relative z-10 mt-3 font-sans font-bold text-xs sm:text-sm tracking-tight transition-colors ${
          isDark ? "text-zinc-200 group-hover:text-white" : "text-zinc-800 group-hover:text-zinc-950"
        }`}
      >
        {tech.name}
      </span>

      <span
        className="mt-2 w-6 h-1 rounded-full opacity-35 group-hover:opacity-100 transition-all duration-200 group-hover:w-8"
        style={{
          backgroundColor: tech.color,
          boxShadow: `0 0 8px ${tech.color}`,
        }}
      />
    </motion.button>
  );
}

export function SkillsSection({ isDark, lang }: { isDark: boolean; lang: "EN" | "FR" }) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  return (
    <section
      id="skills"
      className={`relative z-10 py-24 px-4 sm:px-6 overflow-hidden border-t transition-colors duration-500 ${
        isDark ? "border-white/5 bg-[#070709]" : "border-zinc-300/80 bg-[#E2E4EC]"
      }`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[340px] rounded-full blur-[100px] opacity-20 transition-colors duration-500"
        style={{ backgroundColor: OFFICIAL_TECH_SKILLS[selectedIdx]?.color || "#EF4444" }}
      />

      <div className="max-w-5xl mx-auto">
        <div className="mb-14 flex flex-col items-center text-center">
          <SectionAnimatedHeading firstPart="Skills &" highlightPart="Technologies" isDark={isDark} centered={true} />
        </div>

        <div
          className={`relative p-5 sm:p-8 rounded-[36px] border backdrop-blur-md transition-colors duration-500 ${
            isDark
              ? "bg-[#0B0B10]/85 border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
              : "bg-[#D8DBE4]/85 border-zinc-300/90 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)]"
          }`}
        >
          <div
            className={`flex items-center justify-between px-3 pb-5 mb-5 border-b text-xs font-mono-code ${
              isDark ? "border-white/10 text-zinc-400" : "border-zinc-300/90 text-zinc-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="uppercase tracking-wider font-bold">{lang === "EN" ? "Tech Stack" : "Stack Technique"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: OFFICIAL_TECH_SKILLS[selectedIdx]?.color }} />
              <span className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                {OFFICIAL_TECH_SKILLS[selectedIdx]?.name}
              </span>
              {OFFICIAL_TECH_SKILLS[selectedIdx]?.id === "hackthebox" && (
                <a
                  href="https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-2 py-0.5 rounded-md bg-[#9FEF00]/20 text-[#9FEF00] text-[10px] font-bold hover:bg-[#9FEF00] hover:text-black transition-colors"
                >
                  View Profile ↗
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {OFFICIAL_TECH_SKILLS.map((tech, idx) => (
              <DockKeyItem
                key={tech.id}
                tech={tech}
                isDark={isDark}
                isSelected={selectedIdx === idx}
                onSelect={() => setSelectedIdx(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 1G. SECTION 5: CONTACT SECTION (#contact) WITH FORM & WHATSAPP (+213 540047273)
 * ============================================================================ */

function ContactSection({ isDark, lang }: { isDark: boolean; lang: "EN" | "FR" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText("+213 540047273");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const formData = new URLSearchParams();
      formData.append("form-name", "contact");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("subject", subject || "Portfolio Contact");
      formData.append("message", message);

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (res.ok) {
        setSubmitted(true);
        setStatusMsg(
          lang === "EN"
            ? "Message received! I'll get back to you shortly."
            : "Message envoyé avec succès ! Je te répondrai rapidement."
        );
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        throw new Error("Netlify form offline");
      }
    } catch {
      // Graceful fallback to mailto if offline or testing locally
      const mailtoUrl = `mailto:oussamakf2006@gmail.com?subject=${encodeURIComponent(
        subject || `Portfolio Contact from ${name}`
      )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.open(mailtoUrl, "_blank");
      setSubmitted(true);
      setStatusMsg(
        lang === "EN" ? "Opening mail client..." : "Ouverture du client mail..."
      );
    } finally {
      setIsSending(false);
      setTimeout(() => {
        setSubmitted(false);
        setStatusMsg("");
      }, 6000);
    }
  };

  return (
    <section
      id="contact"
      className={`relative z-10 py-24 px-4 sm:px-6 border-t transition-colors duration-500 ${
        isDark ? "border-white/5 bg-[#070709]" : "border-zinc-300/80 bg-[#E2E4EC]"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 text-center sm:text-left">
          <SectionAnimatedHeading
            firstPart={lang === "EN" ? "Let's" : "Me"}
            highlightPart={lang === "EN" ? "Connect" : "Contacter"}
            isDark={isDark}
          />
          <p className={`text-sm sm:text-base max-w-xl mt-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {lang === "EN"
              ? "Available for freelance Flutter mobile apps, remote roles, hackathon partnerships, or tech collaborations."
              : "Disponible pour vos applications mobiles Flutter en freelance, opportunités remote, partenariats ou collaborations."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-4"
          >
            <motion.a
              href="https://wa.me/213540047273"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className={`block p-5 rounded-3xl border transition-all ${
                isDark
                  ? "bg-[#0E0E15]/90 border-emerald-500/30 hover:border-emerald-400 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.25)]"
                  : "bg-white border-emerald-500/40 hover:border-emerald-600 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-emerald-500 block">
                      WhatsApp Direct • Instant Reply
                    </span>
                    <h4 className="font-sans font-extrabold text-base sm:text-lg">+213 540 04 72 73</h4>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-500" />
              </div>
            </motion.a>

            <div
              className={`p-5 rounded-3xl border flex items-center justify-between ${
                isDark ? "bg-[#0E0E15]/90 border-white/10" : "bg-white border-zinc-300 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className={`font-mono-code text-[11px] uppercase ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    {lang === "EN" ? "Phone / Algeria 🇩🇿" : "Téléphone / Algérie 🇩🇿"}
                  </span>
                  <div className="font-sans font-bold text-sm sm:text-base">+213 540 04 72 73</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono-code text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPhone ? (lang === "EN" ? "Copied" : "Copié") : lang === "EN" ? "Copy" : "Copier"}</span>
              </button>
            </div>

            <a
              href="mailto:oussamakf2006@gmail.com"
              className={`p-5 rounded-3xl border flex items-center justify-between transition-colors ${
                isDark
                  ? "bg-[#0E0E15]/90 border-white/10 hover:border-red-500/50"
                  : "bg-white border-zinc-300 hover:border-red-500 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className={`font-mono-code text-[11px] uppercase block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Email
                  </span>
                  <div className="font-sans font-bold text-sm sm:text-base truncate">oussamakf2006@gmail.com</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-red-500 shrink-0" />
            </a>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href="https://github.com/oussamakafif"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-mono-code text-xs font-bold transition-all ${
                  isDark
                    ? "bg-[#0E0E15] border-white/10 hover:border-red-500 text-white"
                    : "bg-white border-zinc-300 hover:border-red-500 text-zinc-900"
                }`}
              >
                <Github className="w-4 h-4 text-red-500" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/oussama-kafif-31558a320/"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-mono-code text-xs font-bold transition-all ${
                  isDark
                    ? "bg-[#0E0E15] border-white/10 hover:border-red-500 text-white"
                    : "bg-white border-zinc-300 hover:border-red-500 text-zinc-900"
                }`}
              >
                <Linkedin className="w-4 h-4 text-red-500" />
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>

          <motion.form
            name="contact"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
              isDark
                ? "bg-[#0E0E15]/95 border-white/10 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.85)]"
                : "bg-white border-zinc-300 shadow-xl"
            }`}
          >
            {/* Hidden fields for Netlify Forms */}
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden">
              <label>
                Don’t fill this out if you're human: <input name="bot-field" />
              </label>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-mono-code text-xs uppercase tracking-wider text-red-500 mb-2">
                  {lang === "EN" ? "Your Name" : "Ton Nom"}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Oussama..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-red-500 transition-colors ${
                    isDark
                      ? "bg-[#08080C] border-white/10 text-white placeholder:text-zinc-600"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                  }`}
                />
              </div>
              <div>
                <label className="block font-mono-code text-xs uppercase tracking-wider text-red-500 mb-2">
                  {lang === "EN" ? "Your Email" : "Ton Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-red-500 transition-colors ${
                    isDark
                      ? "bg-[#08080C] border-white/10 text-white placeholder:text-zinc-600"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                  }`}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-mono-code text-xs uppercase tracking-wider text-red-500 mb-2">
                {lang === "EN" ? "Subject" : "Sujet"}
              </label>
              <input
                type="text"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={lang === "EN" ? "Flutter Mobile App / Remote Opportunity" : "Projet Mobile Flutter / Opportunité"}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-red-500 transition-colors ${
                  isDark
                    ? "bg-[#08080C] border-white/10 text-white placeholder:text-zinc-600"
                    : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                }`}
              />
            </div>

            <div className="mb-6">
              <label className="block font-mono-code text-xs uppercase tracking-wider text-red-500 mb-2">
                {lang === "EN" ? "Message" : "Message"}
              </label>
              <textarea
                rows={4}
                name="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang === "EN" ? "Tell me about your project or idea..." : "Parle-moi de ton projet ou idée..."}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-red-500 transition-colors resize-none ${
                  isDark
                    ? "bg-[#08080C] border-white/10 text-white placeholder:text-zinc-600"
                    : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
                }`}
              />
            </div>

            {statusMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono-code flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-sans font-bold text-sm text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 shadow-[0_10px_30px_-5px_rgba(220,38,38,0.65)] transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === "EN" ? "Sending..." : "Envoi en cours..."}</span>
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === "EN" ? "Sent!" : "Envoyé !"}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === "EN" ? "Send Message" : "Envoyer le Message"}</span>
                  </>
                )}
              </button>

              <span className={`font-mono-code text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                Algiers, Algeria 🇩🇿 • UTC+1
              </span>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 2. MAIN PORTFOLIO APPLICATION (App)
 * ============================================================================ */

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [lang, setLang] = useState<"EN" | "FR">("EN");
  const [activeNav, setActiveNav] = useState<number>(0);
  const [clock, setClock] = useState<string>("14:20");
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [selectedModalProject, setSelectedModalProject] = useState<"masarif" | "datahack" | "usthb" | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const aboutEl = document.getElementById("about");
      const expEl = document.getElementById("experience");
      const workEl = document.getElementById("work");
      const skillsEl = document.getElementById("skills");
      const contactEl = document.getElementById("contact");

      if (contactEl && scrollY >= contactEl.offsetTop - 320) {
        setActiveNav(5);
      } else if (skillsEl && scrollY >= skillsEl.offsetTop - 280) {
        setActiveNav(4);
      } else if (workEl && scrollY >= workEl.offsetTop - 280) {
        setActiveNav(3);
      } else if (expEl && scrollY >= expEl.offsetTop - 280) {
        setActiveNav(2);
      } else if (aboutEl && scrollY >= aboutEl.offsetTop - 280) {
        setActiveNav(1);
      } else {
        setActiveNav(0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: LiquidNavItem[] = [
    { label: lang === "EN" ? "Home" : "Accueil", href: "#home", icon: NimbusIcons.home, fx: "glow" },
    { label: lang === "EN" ? "About" : "À propos", href: "#about", icon: NimbusIcons.user, fx: "wave" },
    { label: lang === "EN" ? "Experience" : "Parcours", href: "#experience", icon: NimbusIcons.drop, fx: "pop" },
    { label: lang === "EN" ? "Work" : "Projets", href: "#work", icon: NimbusIcons.drop, fx: "pop" },
    { label: lang === "EN" ? "Skills" : "Skills", href: "#skills", icon: NimbusIcons.globe, fx: "spin" },
    { label: lang === "EN" ? "Contact" : "Contact", href: "#contact", icon: NimbusIcons.plane, fx: "plane" },
  ];

  const timelineData: TimelineEntry[] = [
    {
      badge: "2024 — 2027",
      title: lang === "EN" ? "Student at USTHB" : "Étudiant à l'USTHB",
      subtitle:
        lang === "EN"
          ? "Computer Science & Cybersecurity Engineering"
          : "Ingénierie Informatique & Cybersécurité",
      icon: <GraduationCap className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              year: "2024 – 2025",
              cycle: lang === "EN" ? "Preparatory Cycle • Year 1" : "1ère Année Cycle Préparatoire",
              role:
                lang === "EN"
                  ? "Computer Science Engineering Foundations"
                  : "Ingénierie Informatique (Cycle Préparatoire 1)",
              desc:
                lang === "EN"
                  ? "Mastered low-level programming in C, interactive web logic in JavaScript (JS), algorithmic problem-solving, and machine architecture."
                  : "Apprentissage approfondi du langage C, JavaScript (JS), algorithmique, structures de données et architecture des ordinateurs.",
              tags: ["C Language", "JavaScript (JS)", "Algorithms", "Computer Architecture"],
            },
            {
              year: "2025 – 2026",
              cycle: lang === "EN" ? "Preparatory Cycle • Year 2" : "2ème Année Cycle Préparatoire",
              role:
                lang === "EN"
                  ? "OOP & Networking — Computer Science Engineering"
                  : "POO & Réseaux — Ingénierie Informatique",
              desc:
                lang === "EN"
                  ? "Built Object-Oriented Programming (OOP / POO) systems in Java (Media Management App) and studied Computer Networks (OSI, TCP/IP, routing)."
                  : "Maîtrise du langage Java + Programmation Orientée Objet (POO) + Réseaux & Networking (modèle OSI, TCP/IP).",
              tags: ["Java", "OOP / POO", "Networking / Réseaux", "TCP/IP & OSI"],
            },
            {
              year: "2026 – 2027 • CURRENT",
              cycle: lang === "EN" ? "Upper Engineering Cycle • Year 3" : "3ème Année • 1ère Année Cycle Supérieur",
              role:
                lang === "EN"
                  ? "Cybersecurity Engineering Specialization"
                  : "Spécialité Ingénierie de la Cybersécurité",
              desc:
                lang === "EN"
                  ? "Specializing in Cybersecurity Engineering: Capture The Flag (CTFs), Advanced Networking, system hardening, and secure mobile/cloud architectures."
                  : "Spécialité Cybersécurité : compétitions CTFs, Advanced Networking, sécurité des infrastructures et sécurisation des applications mobiles.",
              tags: ["Cybersecurity Engineering", "CTFs", "Advanced Networking", "RLS & Cloud Sec"],
              current: true,
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl border transition-all ${
                step.current
                  ? isDark
                    ? "bg-gradient-to-r from-red-500/10 via-[#0E0E16] to-[#0E0E16] border-red-500/50 shadow-[0_10px_30px_-12px_rgba(239,68,68,0.35)]"
                    : "bg-white border-red-500 shadow-md"
                  : isDark
                  ? "bg-[#0D0D14]/90 border-white/10 hover:border-red-500/40"
                  : "bg-white/90 border-zinc-300 hover:border-red-500"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="font-mono-code text-xs font-bold text-red-500">{step.year}</span>
                <span
                  className={`font-mono-code text-[11px] px-2.5 py-0.5 rounded-full border ${
                    step.current
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : isDark
                      ? "bg-white/5 text-zinc-400 border-white/10"
                      : "bg-zinc-100 text-zinc-600 border-zinc-200"
                  }`}
                >
                  {step.cycle}
                </span>
              </div>
              <h4 className={`font-sans font-extrabold text-base sm:text-lg ${isDark ? "text-white" : "text-zinc-900"}`}>
                {step.role}
              </h4>
              <p className={`text-sm mt-1 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{step.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {step.tags.map((t) => (
                  <span
                    key={t}
                    className={`font-mono-code text-[11px] px-2.5 py-1 rounded-lg ${
                      isDark ? "bg-white/5 text-zinc-300" : "bg-zinc-200/75 text-zinc-800"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {step.current && (
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2">
                  <a
                    href="https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono-code text-xs font-bold bg-[#9FEF00]/15 border border-[#9FEF00]/40 text-[#9FEF00] hover:bg-[#9FEF00] hover:text-black transition-all cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>HackTheBox Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      badge: "2024 — 2026",
      title: "CSE — Club Scientifique de l'ESI",
      subtitle:
        lang === "EN" ? "Ex-RELEV Department Lead & Event Lead" : "Ex-Lead du Département RELEV & Lead Event",
      icon: <Award className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              year: "2024 – 2025",
              badge: lang === "EN" ? "Year 1 • RELEV Member" : "1ère Année • Membre RELEV",
              role:
                lang === "EN"
                  ? "Member in RELEV (External & Event Relations Department)"
                  : "Membre RELEV (Département Relations Événementielles et Externes)",
              highlights:
                lang === "EN"
                  ? [
                      "Participated in DevSprint Hackathon & HackIn Hackathon.",
                      "Event Lead for the CCC Competition (organized & directed the competition).",
                      "Secured official event sponsors: KEPLER Technologies & BRENCO Algérie.",
                    ]
                  : [
                      "Participation active au hackathon DevSprint et au hackathon HackIn.",
                      "Lead Event de la compétition CCC (direction et organisation de l'événement).",
                      "Apport et signature des sponsors officiels : KEPLER Technologies & BRENCO Algérie.",
                    ],
              tags: ["DevSprint", "HackIn", "CCC Event Lead", "KEPLER Technologies", "BRENCO Algérie"],
              current: false,
            },
            {
              year: "2025 – 2026 • EX-LEAD",
              badge: lang === "EN" ? "Year 2 • Ex-Department Lead" : "2ème Année • Ex-Lead RELEV",
              role:
                lang === "EN"
                  ? "Ex-RELEV Department Lead — Club Scientifique de l'ESI"
                  : "Ex-Lead du Département RELEV — Club Scientifique de l'ESI",
              highlights:
                lang === "EN"
                  ? [
                      "Led the organization of SkillBoost 2.",
                      "Led internal hackathons organization: DevSprint, HackIn & Visual Hack.",
                      "Led the flagship external datathon DATA HACK (The Main Event).",
                      "Directed the organization of ICT SUMMIT 2026.",
                    ]
                  : [
                      "Direction de l'organisation de SkillBoost 2.",
                      "Lead de l'organisation des hackathons internes : DevSprint, HackIn & Visual Hack.",
                      "Lead de l'organisation du datathon externe phare DATA HACK (The Main Event).",
                      "Direction de l'organisation du grand sommet ICT SUMMIT 2026.",
                    ],
              tags: ["SkillBoost 2", "DevSprint", "HackIn", "Visual Hack", "DATA HACK (Main Event)", "ICT SUMMIT 2026"],
              current: false,
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl border transition-all ${
                step.current
                  ? isDark
                    ? "bg-gradient-to-r from-red-500/10 via-[#0E0E16] to-[#0E0E16] border-red-500/50 shadow-[0_10px_30px_-12px_rgba(239,68,68,0.35)]"
                    : "bg-white border-red-500 shadow-md"
                  : isDark
                  ? "bg-[#0D0D14]/90 border-white/10 hover:border-red-500/40"
                  : "bg-white/90 border-zinc-300 hover:border-red-500"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="font-mono-code text-xs font-bold text-red-500">{step.year}</span>
                <span className="font-mono-code text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  {step.badge}
                </span>
              </div>
              <h4 className={`font-sans font-extrabold text-base sm:text-lg ${isDark ? "text-white" : "text-zinc-900"}`}>
                {step.role}
              </h4>
              <ul className={`text-sm mt-2 space-y-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                {step.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">▸</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {step.tags.map((t) => (
                  <span
                    key={t}
                    className={`font-mono-code text-[11px] px-2.5 py-1 rounded-lg ${
                      isDark ? "bg-white/5 text-zinc-300" : "bg-zinc-200/75 text-zinc-800"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      badge: "Freelance & Mobile",
      title: lang === "EN" ? "Freelance & Independent Mobile Work" : "Freelance & Projets Mobiles Indépendants",
      subtitle: "Flutter • Dart • Supabase • Firebase",
      icon: <Rocket className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "DH Organisation App",
              sub:
                lang === "EN"
                  ? "Built solo for CSE's flagship DataHack datathon: instant QR participant check-in, live Firestore schedule & mentor queue."
                  : "Conçue en solo pour le datathon DataHack du CSE : check-in QR instantané, planning Firestore en direct & file de mentors.",
              stack: "Flutter • Firebase • Firestore",
              href: "https://github.com/oussamakafif/Organizer-App-DH",
            },
            {
              name: "Masarif App (مصاريف)",
              sub:
                lang === "EN"
                  ? "Cross-border family budget tracker between Algeria (DZD) & Saudi Arabia (SAR) with Supabase Row-Level Security."
                  : "Gestionnaire de budget familial transfrontalier Algérie (DZD) ⇄ Arabie Saoudite (SAR) avec sécurité RLS Supabase.",
              stack: "Flutter • Supabase • PostgreSQL",
              href: "https://github.com/oussamakafif/masarif",
            },
            {
              name: "USTHB Docs",
              sub:
                lang === "EN"
                  ? "Academic resource-sharing platform for USTHB students featuring a 3-role permission engine (Admin, Delegate, Student)."
                  : "Plateforme de partage académique USTHB dotée d'un moteur de permissions à 3 rôles (Admin, Délégué, Étudiant).",
              stack: "Flutter • Supabase • React",
              href: "https://github.com/oussamakafif/USTHB-SRC",
            },
          ].map((app, i) => (
            <motion.a
              key={i}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isDark
                  ? "bg-[#0D0D14]/90 border-white/10 hover:border-red-500/60 shadow-lg"
                  : "bg-white border-zinc-300 hover:border-red-500 shadow-sm"
              }`}
            >
              <div>
                <div className="font-sans font-extrabold text-base flex items-center justify-between">
                  <span>{app.name}</span>
                  <ExternalLink className="w-4 h-4 text-red-500 shrink-0" />
                </div>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{app.sub}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 font-mono-code text-[11px] text-red-500 font-bold">
                {app.stack}
              </div>
            </motion.a>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden transition-colors duration-500 selection:bg-red-600 selection:text-white ${
        isDark ? "bg-[#070709] text-white" : "bg-[#E6E8EF] text-zinc-950"
      }`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .font-mono-code { font-family: 'JetBrains Mono', monospace; }
          .name-crimson-shimmer-dark {
            background: linear-gradient(110deg, #EF4444 0%, #FB7185 35%, #FFFFFF 50%, #EF4444 65%, #DC2626 100%);
            background-size: 220% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: crimsonShine 4.5s linear infinite;
          }
          .name-crimson-shimmer-light {
            background: linear-gradient(110deg, #DC2626 0%, #991B1B 28%, #09090B 50%, #7F1D1D 72%, #EF4444 100%);
            background-size: 220% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: crimsonShine 4.5s linear infinite;
            font-weight: 900;
          }
          @keyframes crimsonShine {
            to { background-position: 220% center; }
          }
        `,
        }}
      />

      {/* 3D Perspective Tunnel Intro Overlay (On-Demand) */}
      <AnimatePresence>
        {showIntro && <PerspectiveTunnelIntro lang={lang} onEnter={() => setShowIntro(false)} />}
      </AnimatePresence>

      {/* Project Multi-Screen Showcase Modal */}
      <AnimatePresence>
        {selectedModalProject && (
          <ProjectModalViewer
            projectId={selectedModalProject}
            onClose={() => setSelectedModalProject(null)}
            isDark={isDark}
            lang={lang}
            clock={clock}
          />
        )}
      </AnimatePresence>

      {/* Lightweight Desktop-Only SplashCursor */}
      <SplashCursor
        rainbow={true}
        colorSpeed={1}
        size={1}
        force={1}
        swirl={3}
        trail={1}
        clickSplash={true}
        quality="low"
        theme={isDark ? "dark" : "light"}
        zIndex={35}
      />

      {/* Ambient Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-60"
        style={{
          backgroundSize: "44px 44px",
          backgroundImage: isDark
            ? "linear-gradient(to right, rgba(239,68,68,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,68,68,0.055) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
        }}
      />

      {/* Fixed Top Responsive Liquid Glass Navbar */}
      <header className="fixed top-4 sm:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-2.5 relative">
          <div className="pointer-events-auto max-w-full flex justify-center">
            <LiquidNavbar
              items={navItems}
              active={activeNav}
              onChange={(i) => setActiveNav(i)}
              tone={isDark ? "dark" : "light"}
              sound={true}
            />
          </div>

          <div className="pointer-events-auto lg:absolute lg:right-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
              className={`font-mono-code text-xs font-bold px-3 py-2 rounded-full border backdrop-blur-xl transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0F0F15]/85 border-white/10 text-zinc-200 hover:border-red-500/60"
                  : "bg-[#ECEEF3]/90 border-zinc-300 text-zinc-800 hover:border-red-500/60 shadow-xs"
              }`}
            >
              <span className={lang === "EN" ? "text-red-500" : "opacity-50"}>EN</span>
              <span className="mx-1 opacity-30">/</span>
              <span className={lang === "FR" ? "text-red-500" : "opacity-50"}>FR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle Theme"
              className={`w-9 h-9 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0F0F15]/85 border-white/10 text-zinc-200 hover:text-red-400 hover:border-red-500/60"
                  : "bg-[#ECEEF3]/90 border-zinc-300 text-zinc-800 hover:text-red-600 hover:border-red-500/60 shadow-xs"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
       * SECTION 1: HERO (#home)
       * ========================================================================= */}
      <motion.main
        id="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-36 pb-20 lg:pt-40 lg:pb-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, x: -60 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1, delayChildren: 0.05 },
              },
            }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex flex-wrap items-center gap-2.5 mb-5"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-code font-bold bg-red-500/10 border border-red-500/30 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{lang === "EN" ? "Mobile Application Developer" : "Développeur d'Applications Mobiles"}</span>
              </span>

              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono-code font-medium border ${
                  isDark
                    ? "bg-white/[0.03] border-white/10 text-zinc-300"
                    : "bg-[#ECEEF3] border-zinc-300 text-zinc-800 font-semibold"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Algiers, Algeria 🇩🇿</span>
              </span>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 22 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <HeroAnimatedName isDark={isDark} />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <h2 className="font-sans font-extrabold text-xl sm:text-3xl text-red-500 tracking-tight">
                Flutter Mobile Developer
              </h2>
              <span
                className={`font-mono-code text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                  isDark
                    ? "bg-white/5 text-zinc-300 border-white/10"
                    : "bg-zinc-900 text-white border-zinc-800 font-bold"
                }`}
              >
                iOS • Android
              </span>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className={`text-sm sm:text-lg leading-relaxed max-w-xl mb-8 ${
                isDark ? "text-zinc-400" : "text-zinc-800 font-medium"
              }`}
            >
              Développeur mobile spécialisé en <span className="font-bold text-red-500">Flutter &amp; Dart</span> et étudiant en 3ème année (Cycle Supérieur) en{" "}
              <span className={`font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Ingénierie Cybersécurité à l'USTHB</span>. Concepteur d'applications mobiles fluides avec Supabase &amp; Firebase, et ex-Department Lead RELEV au Club Scientifique de l'ESI (CSE).
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#work"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 shadow-[0_10px_30px_-5px_rgba(220,38,38,0.55)] transition-all"
              >
                <span>{lang === "EN" ? "View Mobile Apps" : "Voir mes Apps"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#about"
                className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-mono-code text-xs sm:text-sm font-bold border transition-all ${
                  isDark
                    ? "bg-white/[0.04] border-white/15 text-zinc-200 hover:border-red-500 hover:text-red-400"
                    : "bg-white border-zinc-300 text-zinc-900 hover:border-red-500 shadow-2xs"
                }`}
              >
                <span>{lang === "EN" ? "About Me" : "En savoir plus"}</span>
                <ChevronRight className="w-4 h-4 text-red-500" />
              </motion.a>

              
            </motion.div>
          </motion.div>

          {/* Right Column: Sleek Smartphone Frame with Entrance Animation */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center items-center relative py-4"
          >
            <div className="absolute w-64 h-64 rounded-full bg-red-600/15 pointer-events-none" style={{ filter: "blur(36px)" }} />

            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md absolute -left-2 top-10 z-20 font-mono-code text-[11px] font-bold ${
                isDark ? "bg-[#12121A] border-white/15 text-white" : "bg-white border-zinc-300 text-zinc-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Flutter &amp; Dart</span>
            </div>

            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md absolute -right-2 bottom-14 z-20 font-mono-code text-[11px] font-bold ${
                isDark ? "bg-[#12121A] border-white/15 text-white" : "bg-white border-zinc-300 text-zinc-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Supabase • Firebase</span>
            </div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full max-w-[285px] sm:max-w-[310px] rounded-[44px] p-2.5 border-[2px] transition-shadow duration-300 ${
                isDark
                  ? "bg-[#101016] border-white/15 shadow-[0_20px_50px_-10px_rgba(239,68,68,0.2)]"
                  : "bg-zinc-900 border-zinc-700 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)]"
              }`}
            >
              <div
                className="w-full h-[460px] rounded-[34px] overflow-hidden flex flex-col justify-between border relative"
                style={{
                  backgroundColor: isDark ? "#09090E" : "#F8FAFC",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  color: isDark ? "#FFFFFF" : "#09090B",
                }}
              >
                <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono-code border-b border-white/5 text-zinc-400">
                  <span>{clock}</span>
                  <div className="w-16 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-end pr-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <span className="text-red-500 font-bold">FLUTTER</span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-sans font-bold text-xs">Mobile Engineer</div>
                          <div className="text-[10px] text-zinc-400 font-mono-code">Flutter SDK 3.x</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono-code text-[10px] font-bold">
                        ● 60 FPS
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white shadow-md">
                      <div className="text-[10px] font-mono-code uppercase opacity-85">Core Specialization</div>
                      <div className="font-sans font-extrabold text-lg mt-0.5">Flutter &amp; Dart</div>
                      <div className="text-[11px] font-mono-code opacity-90 mt-1">Cross-Platform Mobile</div>
                    </div>

                    <div
                      className={`p-3 rounded-xl border text-[11px] space-y-2 ${
                        isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-zinc-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">CyberSec Engineering</span>
                        <span className="font-mono-code font-bold text-red-500">USTHB 3rd Yr</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Cloud Backends</span>
                        <span className="font-mono-code font-bold text-emerald-500">Supabase &amp; Firebase</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Leadership</span>
                        <span className="font-mono-code font-bold text-sky-400">Ex-RELEV Dept Lead</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="font-mono-code text-[10px] text-zinc-500">Oussama Kafif • Mobile Architecture</span>
                  </div>
                </div>

                <div className="py-2.5 flex justify-center border-t border-white/5 bg-black/40">
                  <div className="w-20 h-1 rounded-full bg-zinc-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* =========================================================================
       * SECTION 1.5: ABOUT ME (#about)
       * ========================================================================= */}
      <motion.section
        id="about"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.05 },
          },
        }}
        className={`relative z-10 py-24 px-4 sm:px-6 border-t overflow-hidden transition-colors duration-500 ${
          isDark ? "border-white/5 bg-[#08080D]/90" : "border-zinc-300/80 bg-[#DFE1E8]/80"
        }`}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="mb-14 text-center sm:text-left"
          >
            <SectionAnimatedHeading
              firstPart={lang === "EN" ? "About" : "À Propos de"}
              highlightPart={lang === "EN" ? "Me" : "Moi"}
              isDark={isDark}
            />
            <p className={`text-sm sm:text-base max-w-2xl mt-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {lang === "EN"
                ? "Passionate mobile developer and cybersecurity engineering student based in Algiers."
                : "Développeur mobile passionné et étudiant en ingénierie de la cybersécurité basé à Alger."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Portrait with 3D Entrance */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -60, scale: 0.92 },
                visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-[270px] sm:max-w-[320px] aspect-[4/5] rounded-[36px] p-2 border-2 border-red-500/35 bg-gradient-to-b from-red-500/15 to-transparent shadow-[0_25px_70px_-15px_rgba(239,68,68,0.28)] group">
                <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-zinc-900">
                  <img
                    src="/profile.jpeg"
                    alt="Oussama Kafif"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </div>

                <div
                  className={`absolute -left-2 sm:-left-4 top-8 px-3 sm:px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-lg flex items-center gap-2 font-mono-code text-xs font-bold ${
                    isDark ? "bg-[#111118]/90 border-white/15 text-white" : "bg-white/95 border-zinc-200 text-zinc-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span>Flutter Dev</span>
                </div>

                <a
                  href="https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View HackTheBox Profile"
                  className={`group absolute -right-2 sm:-right-4 top-1/2 px-3 sm:px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-lg flex items-center gap-2 font-mono-code text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                    isDark
                      ? "bg-[#111118]/90 border-white/15 text-white hover:border-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.45)]"
                      : "bg-white/95 border-zinc-200 text-zinc-900 hover:border-emerald-500 hover:shadow-md"
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>CyberSec</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>

                <div
                  className={`absolute left-6 -bottom-4 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-2 font-mono-code text-[11px] font-bold ${
                    isDark ? "bg-red-600 text-white border-red-400/40" : "bg-red-600 text-white border-red-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>USTHB • CSE RELEV</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Bio and Metrics */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 60 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } },
              }}
              className="lg:col-span-7 space-y-6"
            >
              <h3 className={`font-sans font-bold text-2xl sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>
                {lang === "EN"
                  ? "Engineering secure mobile products & driving tech communities."
                  : "Concevoir des produits mobiles sécurisés et animer les communautés tech."}
              </h3>

              <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                <p>
                  {lang === "EN" ? (
                    <>
                      I am <span className="font-semibold text-red-500">Oussama Kafif</span>, a 3rd-year engineering student in{" "}
                      <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-950"}`}>Cybersecurity at USTHB</span> (Université des Sciences et de la Technologie Houari Boumediene). My dual background gives me a distinct edge: building beautiful cross-platform applications while baking robust security, authentication, and data policies right from day one.
                    </>
                  ) : (
                    <>
                      Je m'appelle <span className="font-semibold text-red-500">Oussama Kafif</span>, étudiant en 3ème année en{" "}
                      <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-950"}`}>Ingénierie Cybersécurité à l'USTHB</span>. Cette double compétence me permet de concevoir des applications mobiles raffinées tout en garantissant une sécurité et une intégrité de données irréprochables dès la conception.
                    </>
                  )}
                </p>

                <p>
                  {lang === "EN" ? (
                    <>
                      As the <span className="font-semibold text-red-500">Ex-Department Lead (RELEV) at CSE</span> (Club Scientifique de l'ESI), I actively directed hackathons, secured top-tier national sponsors (KEPLER Technologies, BRENCO Algérie), and organized massive events like the <span className="font-semibold">DATA HACK</span> datathon and the <span className="font-semibold">ICT SUMMIT 2026</span>.
                    </>
                  ) : (
                    <>
                      En tant qu'<span className="font-semibold text-red-500">Ex-Department Lead RELEV au CSE</span> (Club Scientifique de l'ESI), j'ai piloté l'organisation de hackathons majeurs, collaboré avec des sponsors officiels (KEPLER Technologies, BRENCO Algérie) et dirigé le datathon phare <span className="font-semibold">DATA HACK</span> ainsi que l'<span className="font-semibold">ICT SUMMIT 2026</span>.
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {[
                  { num: "3+", label: lang === "EN" ? "Mobile Apps Built" : "Apps Développées" },
                  { num: "6+", label: lang === "EN" ? "Events Organized" : "Events Organisés" },
                  { num: "3rd Yr", label: "USTHB CyberSec" },
                  { num: "100%", label: "Cross-Platform" },
                ].map((st, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, borderColor: "rgba(239,68,68,0.55)" }}
                    className={`p-3.5 rounded-2xl border transition-colors ${
                      isDark ? "bg-[#111118]/80 border-white/10" : "bg-white border-zinc-300 shadow-2xs"
                    }`}
                  >
                    <div className="font-sans font-extrabold text-2xl text-red-500">{st.num}</div>
                    <div className={`text-xs font-mono-code mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{st.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: EXPERIENCE TIMELINE (#experience) */}
      <Timeline
        data={timelineData}
        isDark={isDark}
        titleFirst={lang === "EN" ? "Experience &" : "Mon"}
        titleHighlight={lang === "EN" ? "Journey" : "Parcours"}
        sectionSubtitle={
          lang === "EN"
            ? "Academic engineering at USTHB, executive event leadership at CSE, and real-world mobile applications."
            : "Formation d'ingénieur à l'USTHB, leadership événementiel au CSE et développement d'applications mobiles."
        }
      />

      {/* SECTION 3A: FEATURED MOBILE WORK (1 -> 3 EMULATOR SPLIT) (#work) */}
      <WorkPhoneSplitSection
        isDark={isDark}
        lang={lang}
        clock={clock}
        onOpenProjectModal={(id) => setSelectedModalProject(id)}
      />

      {/* SECTION 3B: 5 INTERACTIVE 3D GLASS FOLDERS ARCHIVE */}
      <GlassFoldersSection isDark={isDark} lang={lang} />

      {/* SECTION 4: SKILLS & TECHNOLOGIES (#skills) */}
      <SkillsSection isDark={isDark} lang={lang} />

      {/* SECTION 5: CONTACT & WHATSAPP (#contact) */}
      <ContactSection isDark={isDark} lang={lang} />

      {/* =========================================================================
       * SECTION 6: ARCHITECTURAL FOOTER
       * ========================================================================= */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 },
          },
        }}
        className="relative z-10 w-full overflow-hidden border-t border-white/10 bg-[#060609] text-white pt-16 pb-12"
      >
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent origin-center shadow-[0_0_20px_rgba(239,68,68,0.9)]"
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-white/10">
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="md:col-span-5 space-y-4"
            >
              <span className="font-mono-code text-[11px] font-bold uppercase tracking-[0.22em] text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>FLUTTER &amp; CYBERSECURITY ENGINEER</span>
              </span>
              <h2 className="font-sans font-extrabold text-3xl sm:text-5xl tracking-tight name-crimson-shimmer-dark inline-block">
                Oussama Kafif
              </h2>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                I design and build secure, user-focused cross-platform mobile products with clean Flutter architectures, Supabase backends, and pragmatic engineering decisions.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Flutter", "Dart", "Supabase", "Firebase", "PostgreSQL", "CyberSec"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono-code text-[10px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="md:col-span-2 space-y-3"
            >
              <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-zinc-400 block">NAVIGATE</span>
              <ul className="space-y-2 text-sm font-medium text-zinc-300">
                {[
                  { label: "Home", href: "#home" },
                  { label: "About", href: "#about" },
                  { label: "Experience", href: "#experience" },
                  { label: "Work", href: "#work" },
                  { label: "Skills", href: "#skills" },
                  { label: "Contact", href: "#contact" },
                ].map((nav) => (
                  <li key={nav.label}>
                    <a href={nav.href} className="inline-block hover:text-red-500 transition-colors">
                      {nav.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="md:col-span-2 space-y-3"
            >
              <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-zinc-400 block">PROJECTS</span>
              <ul className="space-y-2 text-sm font-medium text-zinc-300">
                {[
                  { label: "Masarif App", url: "https://github.com/oussamakafif/masarif" },
                  { label: "DataHack App", url: "https://github.com/oussamakafif/Organizer-App-DH" },
                  { label: "USTHB Docs", url: "https://github.com/oussamakafif/USTHB-SRC" },
                  { label: "GitHub Repos", url: "https://github.com/oussamakafif" },
                ].map((proj) => (
                  <li key={proj.label}>
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <span>{proj.label}</span>
                      <span className="text-xs text-red-500">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 40 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="md:col-span-3 space-y-3"
            >
              <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-zinc-400 block">REACH ME</span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <p>
                  <span className="text-zinc-500">Email:</span>{" "}
                  <a href="mailto:oussamakf2006@gmail.com" className="text-red-400 hover:underline">
                    oussamakf2006@gmail.com
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500">WhatsApp:</span>{" "}
                  <a href="https://wa.me/213540047273" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                    +213 540 04 72 73
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500">Location:</span> Algiers, Algeria
                </p>
                <p>
                  <span className="text-zinc-500">Availability:</span> Open to freelance &amp; remote mobile roles
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3 font-mono-code text-xs font-bold">
                <a href="https://github.com/oussamakafif" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  GITHUB
                </a>
                <a href="https://www.linkedin.com/in/oussama-kafif-31558a320/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                  LINKEDIN
                </a>
                <a href="https://profile.hackthebox.com/profile/019fa823-b9b9-73f2-9ea3-8d7bfb72a750?utm_medium=copy_url" target="_blank" rel="noopener noreferrer" className="text-[#9FEF00] hover:underline transition-colors">
                  HACKTHEBOX
                </a>
                <a href="mailto:oussamakf2006@gmail.com" className="hover:text-red-500 transition-colors">
                  EMAIL
                </a>
              </div>
            </motion.div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-zinc-500">
            <div>© 2026 Oussama Kafif. Crafted with intent in Algiers, Algeria.</div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
            >
              <span>BACK TO TOP</span>
              <span className="text-red-500">↗</span>
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}