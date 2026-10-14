// Hero scene: a glass prism splits one white beam into three coloured beams — one per project
// (amber · Aether, crimson · DarkHorse, emerald · Fintrust). The beams live in an opaque backdrop
// shader so the glass genuinely refracts and disperses them. Loaded after the hero text paints;
// pauses off-screen; renders a single still frame for reduced motion.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uOrigin;   // prism centre, in backdrop UV
  uniform vec2 uIn;       // where the white beam enters, in backdrop UV
  uniform float uAngle;   // centre angle of the outgoing fan (radians)
  uniform float uSpread;

  float seg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = vUv * asp;
    vec2 o = uOrigin * asp;

    // night studio: deep blue-black with a soft pool of light behind the glass
    vec3 col = mix(vec3(0.010, 0.012, 0.022), vec3(0.028, 0.032, 0.058), vUv.y);
    col += vec3(0.09, 0.11, 0.21) * exp(-length(p - o) * 1.9) * 0.75;

    // incoming white beam
    vec2 a = uIn * asp;
    float d0 = seg(p, a, o);
    float along = clamp(dot(p - a, normalize(o - a)) / length(o - a), 0.0, 1.0);
    col += vec3(1.0, 0.98, 0.95) * (exp(-d0 * 120.0) * 0.85 + exp(-d0 * 22.0) * 0.12) * smoothstep(0.0, 0.5, along);

    // three outgoing beams, widening with distance
    vec3 c0 = vec3(1.00, 0.71, 0.28);
    vec3 c1 = vec3(1.00, 0.30, 0.37);
    vec3 c2 = vec3(0.18, 0.90, 0.65);
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float ang = uAngle + (1.0 - fi) * uSpread + sin(uTime * 0.35 + fi * 1.7) * 0.01;
      vec2 dir = vec2(cos(ang), sin(ang));
      float t = dot(p - o, dir);
      if (t <= 0.0) continue;
      float d = seg(p, o, o + dir * 4.0);
      float width = mix(150.0, 20.0, clamp(t / 1.4, 0.0, 1.0));
      float glow = exp(-d * width) * 1.05 + exp(-d * 9.0) * 0.1;
      float flicker = 0.92 + 0.08 * sin(uTime * 1.2 + fi * 2.3);
      vec3 c = i == 0 ? c0 : (i == 1 ? c1 : c2);
      col += c * glow * flicker * smoothstep(0.0, 0.08, t);
    }

    vec2 q = vUv - 0.5;
    col *= 1.0 - dot(q, q) * 0.85;
    col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.02;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function mountPrism(canvas: HTMLCanvasElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the CSS fallback stays
  }
  const small = () => canvas.clientWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uOrigin: { value: new THREE.Vector2(0.7, 0.5) },
    uIn: { value: new THREE.Vector2(0.38, 1.05) },
    uAngle: { value: -0.42 },
    uSpread: { value: 0.16 },
  };
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, depthWrite: false }),
  );
  backdrop.position.z = -6;
  scene.add(backdrop);

  // Prism: an equilateral triangle, extruded and bevelled so its edges catch the light.
  const shape = new THREE.Shape();
  const r = 1.3;
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    const fn = i === 0 ? 'moveTo' : 'lineTo';
    shape[fn](Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 2.1,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.11,
    bevelSegments: 10,
    curveSegments: 1,
  });
  geometry.center();
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: 2.2,
    ior: 1.55,
    dispersion: 5,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.5,
    specularIntensity: 1,
    attenuationColor: new THREE.Color('#e3e9ff'),
    attenuationDistance: 7,
  });
  const prism = new THREE.Mesh(geometry, glass);
  scene.add(prism);

  const key = new THREE.DirectionalLight('#ffffff', 2.4);
  key.position.set(-4, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight('#9ab8ff', 26, 22);
  rim.position.set(4, -3, 3);
  scene.add(rim);

  // Dust in the light, for depth.
  const dustCount = small() ? 90 : 220;
  const positions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = Math.random() * 4 - 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.022,
      color: '#cfd8ff',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  const base = new THREE.Vector3();
  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const dist = camera.position.z - backdrop.position.z;
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    backdrop.scale.set(viewH * camera.aspect, viewH, 1);
    uniforms.uRes.value.set(w, h);

    const wide = w / h > 1.05;
    const viewHAt0 = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    if (wide) {
      base.set(viewHAt0 * camera.aspect * 0.2, 0.15, 0);
      prism.scale.setScalar(1);
      uniforms.uIn.value.set(0.4, 1.06);
      uniforms.uAngle.value = -0.42;
    } else {
      base.set(0, -viewHAt0 * 0.235, 0);
      prism.scale.setScalar(Math.min(0.56, (viewHAt0 * camera.aspect) / 4.9));
      uniforms.uIn.value.set(-0.08, 0.36);
      uniforms.uAngle.value = -0.22;
    }
    camera.updateMatrixWorld(); // project() needs the camera's world matrix, which render() would set later
    const projected = base.clone().project(camera);
    uniforms.uOrigin.value.set((projected.x + 1) / 2, (projected.y + 1) / 2);
  }
  layout();
  new ResizeObserver(layout).observe(canvas);

  const pointer = { x: 0, y: 0 };
  if (!reduce) {
    addEventListener(
      'pointermove',
      (e) => {
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
      },
      { passive: true },
    );
  }

  const hero = canvas.closest<HTMLElement>('[data-hero]') ?? canvas;
  const timer = new THREE.Timer();
  let rotX = 0.1;
  let rotY = -0.5;
  function frame() {
    timer.update();
    const t = timer.getElapsed();
    uniforms.uTime.value = t;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.9)));
    rotY += (-0.5 + pointer.x * 0.32 + Math.sin(t * 0.25) * 0.12 - rotY) * 0.05;
    rotX += (0.1 + pointer.y * 0.16 - rotX) * 0.05;
    prism.rotation.set(rotX, rotY, Math.sin(t * 0.2) * 0.04 + progress * 0.7);
    prism.position.set(base.x, base.y + Math.sin(t * 0.6) * 0.07 + progress * 1.9, base.z);
    dust.rotation.y = t * 0.012;
    dust.position.y = Math.sin(t * 0.1) * 0.15;
    renderer.render(scene, camera);
    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }

  if (reduce) {
    frame();
    return;
  }
  let running = false;
  new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting;
    if (visible !== running) {
      running = visible;
      renderer.setAnimationLoop(visible ? frame : null);
    }
  }).observe(canvas);
}
