import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CLUSTER_COLORS } from '../i18n/strings';
import { edges, neurons } from '../lib/brain';
import { seeded } from '../lib/random';
import type { Lang } from '../lib/types';
import { generateCortex, toScene } from './shape';

export interface BrainQuery {
  /** Changes every time a new query is fired, to restart the animation. */
  key: number;
  /** Where the query lands inside the brain. */
  origin: [number, number, number];
}

export interface BrainSceneProps {
  /** Neurons that are part of the current result set. */
  lit: number[];
  /** Neurons used as sources: brightest, and labelled. */
  sources: number[];
  selected: number | null;
  query: BrainQuery | null;
  onSelect: (index: number | null) => void;
  reducedMotion: boolean;
  lowPower: boolean;
  active: boolean;
  lang: Lang;
}

const POSITIONS = neurons.map((n) => new THREE.Vector3(...toScene(n.pos)));
const COLORS = neurons.map((n) => new THREE.Color(CLUSTER_COLORS[n.node.cluster]));
const WAVE_SECONDS = 1.6;

const cortexVertex = /* glsl */ `
  attribute float aShade;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uPulse;
  uniform float uDim;
  uniform vec3 uOrigin;
  varying float vAlpha;
  varying float vWave;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.8 + 0.2 * sin(uTime * 1.3 + aSeed * 6.2831);
    float d = distance(position, uOrigin);
    float wave = uPulse < 0.0
      ? 0.0
      : smoothstep(0.16, 0.0, abs(d - uPulse * 1.9)) * (1.0 - uPulse);
    vWave = wave;
    vAlpha = (0.16 + 0.6 * aShade * aShade) * twinkle * uDim + wave * 0.9;
    gl_PointSize = uSize * (0.7 + 0.9 * aShade + wave * 1.6) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const cortexFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uWaveColor;
  varying float vAlpha;
  varying float vWave;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = dot(c, c);
    if (r > 0.25) discard;
    float soft = smoothstep(0.25, 0.0, r);
    vec3 col = mix(uColorA, uColorB, clamp(vAlpha * 1.4, 0.0, 1.0));
    col = mix(col, uWaveColor, clamp(vWave, 0.0, 1.0));
    gl_FragColor = vec4(col, vAlpha * soft);
  }
`;

function Cortex({
  count,
  query,
  dimmed,
  reducedMotion,
}: {
  count: number;
  query: BrainQuery | null;
  dimmed: boolean;
  reducedMotion: boolean;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const waveStart = useRef<number | null>(null);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const cortex = generateCortex(count, seeded(42));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cortex.positions, 3));
    g.setAttribute('aShade', new THREE.BufferAttribute(cortex.shade, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(cortex.seeds, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 8 },
      uPulse: { value: -1 },
      uDim: { value: 1 },
      uOrigin: { value: new THREE.Vector3() },
      uColorA: { value: new THREE.Color('#5870a8') },
      uColorB: { value: new THREE.Color('#c9d6f2') },
      uWaveColor: { value: new THREE.Color('#ffd9a0') },
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (!query) return;
    uniforms.uOrigin.value.set(...query.origin);
    waveStart.current = reducedMotion ? null : -1;
  }, [query, reducedMotion, uniforms]);

  useFrame(({ clock }) => {
    const m = material.current;
    if (!m) return;
    const now = clock.elapsedTime;
    uniforms.uTime.value = reducedMotion ? 0 : now;
    uniforms.uSize.value = 10.5 * dpr * (size.height / 760);
    const targetDim = dimmed ? 0.55 : 1;
    uniforms.uDim.value += (targetDim - uniforms.uDim.value) * 0.08;

    if (waveStart.current === -1) waveStart.current = now;
    if (waveStart.current !== null) {
      const progress = (now - waveStart.current) / WAVE_SECONDS;
      if (progress >= 1) {
        waveStart.current = null;
        uniforms.uPulse.value = -1;
      } else {
        uniforms.uPulse.value = progress;
      }
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={cortexVertex}
        fragmentShader={cortexFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function useGlowTexture(): THREE.Texture {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.25, 'rgba(255,255,255,0.55)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function Neurons({
  lit,
  sources,
  selected,
  hovered,
  onHover,
  onSelect,
  reducedMotion,
  lang,
}: Pick<BrainSceneProps, 'lit' | 'sources' | 'selected' | 'onSelect' | 'reducedMotion' | 'lang'> & {
  hovered: number | null;
  onHover: (index: number | null) => void;
}) {
  const glow = useGlowTexture();
  const cores = useRef<(THREE.Mesh | null)[]>([]);
  const halos = useRef<(THREE.Sprite | null)[]>([]);
  const levels = useRef<number[]>(neurons.map(() => 0.5));

  const litSet = useMemo(() => new Set(lit), [lit]);
  const sourceSet = useMemo(() => new Set(sources), [sources]);
  const focused = litSet.size > 0 || sourceSet.size > 0;

  useFrame(({ clock }) => {
    neurons.forEach((_, i) => {
      let target = 0.5;
      if (focused) target = sourceSet.has(i) ? 1.5 : litSet.has(i) ? 0.95 : 0.12;
      if (selected === i) target = 1.7;
      if (hovered === i) target += 0.35;
      const breathing = reducedMotion ? 0 : 0.08 * Math.sin(clock.elapsedTime * 1.4 + i * 1.7);
      const level = (levels.current[i]! += (target - levels.current[i]!) * 0.12);
      const shown = Math.max(0.05, level + breathing);
      cores.current[i]?.scale.setScalar(0.55 + 0.55 * shown);
      const halo = halos.current[i];
      if (halo) {
        halo.scale.setScalar(0.07 + 0.13 * shown);
        halo.material.opacity = Math.min(1, 0.18 + 0.55 * shown);
      }
    });
  });

  const labelled = new Set<number>(sources);
  if (hovered !== null) labelled.add(hovered);
  if (selected !== null) labelled.add(selected);

  return (
    <>
      {neurons.map((n, i) => (
        <group key={n.node.id} position={POSITIONS[i]}>
          <sprite
            ref={(el) => {
              halos.current[i] = el;
            }}
          >
            <spriteMaterial
              map={glow}
              color={COLORS[i]}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          <mesh
            ref={(el) => {
              cores.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshBasicMaterial color={COLORS[i]} toneMapped={false} />
          </mesh>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(i);
            }}
            onPointerOut={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected === i ? null : i);
            }}
          >
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {labelled.has(i) && (
            <Html center position={[0, 0.075, 0]} zIndexRange={[4, 0]} className="neuron-label">
              <span style={{ borderColor: CLUSTER_COLORS[n.node.cluster] }}>
                {n.node.title[lang]}
              </span>
            </Html>
          )}
        </group>
      ))}
    </>
  );
}

function Synapses({ lit, sources }: Pick<BrainSceneProps, 'lit' | 'sources'>) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      POSITIONS[a]!.toArray(positions, i * 6);
      POSITIONS[b]!.toArray(positions, i * 6 + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const active = new Set([...lit, ...sources]);
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
    const base = new THREE.Color('#5a6788');
    edges.forEach(([a, b, sim], i) => {
      const on = active.has(a) && active.has(b);
      const strength = on ? 0.9 : active.size > 0 ? 0.05 : 0.1 + 0.25 * sim;
      const ca = on ? COLORS[a]! : base;
      const cb = on ? COLORS[b]! : base;
      colors.setXYZ(i * 2, ca.r * strength, ca.g * strength, ca.b * strength);
      colors.setXYZ(i * 2 + 1, cb.r * strength, cb.g * strength, cb.b * strength);
    });
    colors.needsUpdate = true;
  }, [geometry, lit, sources]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/** The query as a white point, with beams reaching the neurons it retrieved. */
function QueryBeams({
  query,
  lit,
  reducedMotion,
}: {
  query: BrainQuery;
  lit: number[];
  reducedMotion: boolean;
}) {
  const glow = useGlowTexture();
  const start = useRef<number | null>(null);
  const targets = useMemo(() => lit.slice(0, 8), [lit]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 6), 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    start.current = null;
  }, [targets]);

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const progress = reducedMotion ? 1 : Math.min(1, (clock.elapsedTime - start.current) / 0.7);
    const eased = 1 - Math.pow(1 - progress, 3);
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const origin = new THREE.Vector3(...query.origin);
    const tip = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      const index = targets[i];
      const target = index === undefined ? origin : POSITIONS[index]!;
      tip.lerpVectors(origin, target, eased);
      attr.setXYZ(i * 2, origin.x, origin.y, origin.z);
      attr.setXYZ(i * 2 + 1, tip.x, tip.y, tip.z);
    }
    attr.needsUpdate = true;
  });

  return (
    <>
      <sprite position={query.origin} scale={0.22}>
        <spriteMaterial
          map={glow}
          color="#ffffff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial
          color="#ffe2b8"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}

/** Orbit controls that back the camera off on narrow canvases so the brain always fits. */
function FramedControls(props: React.ComponentProps<typeof OrbitControls>) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const distance = 2.5 / Math.min(1, aspect / 1.2);
  return <OrbitControls {...props} minDistance={distance} maxDistance={distance} />;
}

export default function BrainScene(props: BrainSceneProps) {
  const { lit, sources, selected, query, onSelect, reducedMotion, lowPower, active, lang } = props;
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered !== null ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  return (
    <Canvas
      flat
      camera={{ position: [0.85, 0.3, 2.45], fov: 40 }}
      dpr={[1, lowPower ? 1.5 : 2]}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={['#090a0f']} />
      <Cortex
        count={lowPower ? 9000 : 22000}
        query={query}
        dimmed={lit.length > 0 || sources.length > 0}
        reducedMotion={reducedMotion}
      />
      <Synapses lit={lit} sources={sources} />
      <Neurons
        lit={lit}
        sources={sources}
        selected={selected}
        hovered={hovered}
        onHover={setHovered}
        onSelect={onSelect}
        reducedMotion={reducedMotion}
        lang={lang}
      />
      {query && lit.length > 0 && (
        <QueryBeams key={query.key} query={query} lit={lit} reducedMotion={reducedMotion} />
      )}
      <FramedControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        autoRotate={!reducedMotion && !dragging && hovered === null && selected === null}
        autoRotateSpeed={0.55}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.72}
        onStart={() => setDragging(true)}
        onEnd={() => setDragging(false)}
      />
      {!lowPower && (
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
