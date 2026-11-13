import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CLUSTER_COLORS, PALETTE } from '../i18n/strings';
import { edges, neurons } from '../lib/brain';
import type { Cluster, Lang } from '../lib/types';
import { Avatar } from '../ui/sprites';
import { CITY, LOT, route, towerTop } from './layout';
import {
  Blocks,
  Expressway,
  Ground,
  Moon,
  NIGHT,
  Plaza,
  RadioTower,
  Rain,
  STANDING_BOX,
  Traffic,
  buildingMaterial,
} from './scenery';

export interface CityQuery {
  /** Changes every time a new query is fired, to restart the animation. */
  key: number;
  /** Where the query hovers over the city before it lands. */
  origin: [number, number, number];
}

export interface CitySceneProps {
  /** Towers that are part of the current result set. */
  lit: number[];
  /** Towers used as sources: brightest, and labelled. */
  sources: number[];
  selected: number | null;
  /** Tower the hero is standing on. */
  hero: number;
  /** Whether the arrow keys move the hero. */
  keys: boolean;
  /** Towers the visitor has already found; the rest show as unknown. */
  discovered: ReadonlySet<number>;
  /** Towers seen from a visited one: named, not yet discovered. */
  sighted: ReadonlySet<number>;
  unknownLabel: string;
  query: CityQuery | null;
  onSelect: (index: number | null) => void;
  reducedMotion: boolean;
  lowPower: boolean;
  active: boolean;
  lang: Lang;
}

const TOWERS = CITY.towers;
const TOPS = TOWERS.map((t) => new THREE.Vector3(...towerTop(t.index)));
const COLORS = neurons.map((n) => new THREE.Color(CLUSTER_COLORS[n.node.cluster]));
/** Towers not found yet keep the colour of their district, only fainter. */
const FAINT = COLORS.map((c) => c.clone().multiplyScalar(0.5));
const PATH = new THREE.Color(PALETTE.yellow);
const TOWER_SIDE = LOT * 0.82;

/** Towers joined by a street of light: the ways the hero can go. */
const PATHS: number[][] = neurons.map(() => []);
for (const [a, b] of edges) {
  PATHS[a]!.push(b);
  PATHS[b]!.push(a);
}

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};
/** How well a way must line up with the arrow pressed (cosine of the angle) to be taken. */
const MIN_ALIGNMENT = 0.3;
const TRAVEL_SECONDS = 0.75;
/** Rendered below full resolution and scaled up without smoothing: chunky pixels. */
const PIXEL_DPR = 0.75;
const LOW_POWER_DPR = 0.5;

/** What each district writes on its neon signs. */
const SIGN_TEXT: Record<Cluster, string> = {
  rag: '検索',
  embeddings: '埋込',
  brains: '頭脳',
  eval: '評価',
  projects: '作品',
  about: '自己',
};

function signTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0b0c16';
  ctx.fillRect(0, 0, 32, 64);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 30, 62);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [...text].forEach((glyph, i) => ctx.fillText(glyph, 16, 18 + i * 28));
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

interface TowersProps {
  lit: number[];
  sources: number[];
  selected: number | null;
  discovered: ReadonlySet<number>;
  /** Towers seen from a visited one: named, not yet discovered. */
  sighted: ReadonlySet<number>;
  unknownLabel: string;
  hovered: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number | null) => void;
  reducedMotion: boolean;
  lang: Lang;
}

/** The towers that hold knowledge: one instanced mesh, lit by district and by state. */
function Towers(props: TowersProps) {
  const { lit, sources, selected, discovered, sighted, unknownLabel, hovered } = props;
  const { onHover, onSelect, reducedMotion, lang } = props;
  const material = useMemo(buildingMaterial, []);
  const signs = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(SIGN_TEXT) as Cluster[]).map((c) => [c, signTexture(SIGN_TEXT[c])]),
      ) as Record<Cluster, THREE.CanvasTexture>,
    [],
  );

  const mesh = useMemo(() => {
    const geometry = STANDING_BOX.clone();
    const count = TOWERS.length;
    geometry.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3),
    );
    geometry.setAttribute('aGlow', new THREE.InstancedBufferAttribute(new Float32Array(count), 1));
    geometry.setAttribute(
      'aSeed',
      new THREE.InstancedBufferAttribute(
        Float32Array.from(TOWERS, (_, i) => (i * 0.37) % 1),
        1,
      ),
    );
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    TOWERS.forEach((t, i) => {
      matrix.makeScale(TOWER_SIDE, t.height, TOWER_SIDE).setPosition(t.x, 0, t.z);
      instanced.setMatrixAt(i, matrix);
    });
    instanced.frustumCulled = false;
    return instanced;
  }, [material]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.dispose();
      material.dispose();
      Object.values(signs).forEach((texture) => texture.dispose());
    },
    [mesh, material, signs],
  );

  const litSet = useMemo(() => new Set(lit), [lit]);
  const sourceSet = useMemo(() => new Set(sources), [sources]);
  const focused = litSet.size > 0 || sourceSet.size > 0;
  const named = (i: number) => discovered.has(i) || sourceSet.has(i) || selected === i;

  useFrame(({ clock }) => {
    const colors = mesh.geometry.getAttribute('aColor') as THREE.InstancedBufferAttribute;
    const glows = mesh.geometry.getAttribute('aGlow') as THREE.InstancedBufferAttribute;
    const time = clock.elapsedTime;
    TOWERS.forEach((_, i) => {
      let glow = named(i) ? 0.95 : 0.32;
      if (focused) glow = sourceSet.has(i) ? 1.5 : litSet.has(i) ? 0.95 : 0.05;
      if (selected === i) glow = 1.6;
      if (hovered === i) glow += 0.35;
      if (!reducedMotion) glow *= 1 + 0.12 * Math.sin(time * 1.6 + i * 1.7);
      glows.setX(i, glow);
      COLORS[i]!.toArray(colors.array, i * 3);
    });
    colors.needsUpdate = true;
    glows.needsUpdate = true;
  });

  return (
    <>
      <primitive object={mesh} />
      {TOWERS.map((t, i) => {
        const cluster = neurons[i]!.node.cluster;
        const known = named(i) || litSet.has(i);
        const labelled = sourceSet.has(i) || hovered === i || selected === i;
        const signColor = known ? COLORS[i]! : FAINT[i]!;
        const signY = t.height * 0.64;
        return (
          <group key={neurons[i]!.node.id} position={[t.x, 0, t.z]}>
            {/* Invisible, slightly fat box: easier to hit than the tower itself. */}
            <mesh
              position={[0, t.height / 2, 0]}
              scale={[LOT, t.height + 0.06, LOT]}
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
              <boxGeometry />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {/* A vertical sign on two sides, so one always faces the visitor. */}
            {[0, Math.PI / 2].map((turn) => (
              <mesh
                key={turn}
                rotation-y={turn}
                position={
                  turn === 0
                    ? [TOWER_SIDE * 0.2, signY, TOWER_SIDE / 2 + 0.006]
                    : [TOWER_SIDE / 2 + 0.006, signY, -TOWER_SIDE * 0.2]
                }
              >
                <planeGeometry args={[0.095, 0.19]} />
                <meshBasicMaterial
                  map={signs[cluster]}
                  color={signColor}
                  toneMapped={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Sources send a beam up, to be found from anywhere in town. */}
            {sourceSet.has(i) && (
              <mesh position={[0, t.height + 1.1, 0]}>
                <boxGeometry args={[0.02, 2.2, 0.02]} />
                <meshBasicMaterial
                  color={PALETTE.yellow}
                  transparent
                  opacity={0.5}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}
            {labelled && (
              <Html
                center
                position={[0, t.height + 0.16, 0]}
                zIndexRange={[5, 0]}
                className="building-label"
              >
                <span style={{ borderColor: known ? CLUSTER_COLORS[cluster] : PALETTE.slate }}>
                  {named(i) || sighted.has(i) ? neurons[i]!.node.title[lang] : unknownLabel}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

/** Lines of light along the streets that join related towers. */
function Routes({ lit, sources, hero }: { lit: number[]; sources: number[]; hero: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const [a, b] of edges) {
      const points = route(TOWERS[a]!, TOWERS[b]!);
      for (let i = 0; i < points.length - 1; i++) {
        positions.push(points[i]![0], 0.014, points[i]![1]);
        positions.push(points[i + 1]![0], 0.014, points[i + 1]![1]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(new Float32Array(positions.length), 3),
    );
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const active = new Set([...lit, ...sources]);
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
    const color = new THREE.Color();
    const legs = colors.count / edges.length;
    edges.forEach(([a, b], edge) => {
      if (active.size > 0) {
        if (active.has(a) && active.has(b)) color.copy(PATH);
        else color.set(PALETTE.ink).multiplyScalar(0.4);
      } else if (a === hero || b === hero) {
        color.copy(PATH).multiplyScalar(0.85);
      } else {
        color.copy(COLORS[a]!).multiplyScalar(0.28);
      }
      for (let i = 0; i < legs; i++) color.toArray(colors.array, (edge * legs + i) * 3);
    });
    colors.needsUpdate = true;
  }, [geometry, lit, sources, hero]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors toneMapped={false} />
    </lineSegments>
  );
}

/** The query: a drone over the city that throws a beam at each tower it finds. */
function QueryDrone({
  query,
  lit,
  reducedMotion,
}: {
  query: CityQuery;
  lit: number[];
  reducedMotion: boolean;
}) {
  const targets = useMemo(() => lit.slice(0, 8), [lit]);
  const started = useRef<number | null>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(new Float32Array(targets.length * 6), 3),
    );
    return g;
  }, [targets]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    started.current ??= clock.elapsedTime;
    const elapsed = clock.elapsedTime - started.current;
    const reach = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, elapsed / 0.7), 3);
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const origin = new THREE.Vector3(...query.origin);
    const end = new THREE.Vector3();
    targets.forEach((index, i) => {
      end.lerpVectors(origin, TOPS[index]!, reach);
      origin.toArray(positions.array, i * 6);
      end.toArray(positions.array, i * 6 + 3);
    });
    positions.needsUpdate = true;
  });

  return (
    <>
      <mesh position={query.origin}>
        <boxGeometry args={[0.09, 0.03, 0.09]} />
        <meshBasicMaterial color={PALETTE.white} toneMapped={false} />
      </mesh>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial color={PALETTE.yellow} transparent opacity={0.85} toneMapped={false} />
      </lineSegments>
    </>
  );
}

/** Down from one roof, along the streets and up to the next. */
function walk(from: number, to: number): THREE.Vector3[] {
  const [, start, corner, end] = route(TOWERS[from]!, TOWERS[to]!);
  const street = ([x, z]: [number, number]) => new THREE.Vector3(x, 0.03, z);
  return [TOPS[from]!, street(start!), street(corner!), street(end!), TOPS[to]!];
}

function pointAlong(path: THREE.Vector3[], progress: number, out: THREE.Vector3) {
  const lengths = path.slice(1).map((p, i) => p.distanceTo(path[i]!));
  let left = lengths.reduce((sum, l) => sum + l, 0) * progress;
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]! || i === lengths.length - 1) {
      out.lerpVectors(path[i]!, path[i + 1]!, lengths[i] ? Math.min(1, left / lengths[i]!) : 1);
      return;
    }
    left -= lengths[i]!;
  }
}

/** The hero sprite, standing on a roof and taking the streets to the next one. */
function HeroMarker({ at, reducedMotion }: { at: number; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const standing = useRef(at);
  const journey = useRef<{ path: THREE.Vector3[]; progress: number } | null>(null);

  useEffect(() => {
    if (standing.current === at) return;
    const whole = walk(standing.current, at);
    const here = group.current?.position;
    // Sent somewhere else mid-way: go on from where he is, not from the roof he never reached.
    const path =
      journey.current && here
        ? [here.clone(), new THREE.Vector3(here.x, 0.03, here.z), whole[3]!, whole[4]!]
        : whole;
    journey.current = { path, progress: 0 };
    standing.current = at;
  }, [at]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const trip = journey.current;
    if (!trip || reducedMotion) {
      journey.current = null;
      g.position.copy(TOPS[at]!);
      return;
    }
    trip.progress = Math.min(1, trip.progress + delta / TRAVEL_SECONDS);
    pointAlong(trip.path, trip.progress, g.position);
    if (trip.progress >= 1) journey.current = null;
  });

  return (
    <group ref={group} position={TOPS[at]}>
      <Html center position={[0, 0.09, 0]} zIndexRange={[6, 5]} className="hero-marker">
        <Avatar size={22} />
      </Html>
    </group>
  );
}

/** Arrow keys send the hero to the linked tower that lies that way on screen. */
function KeyTravel({ from, onTravel }: { from: number; onTravel: (index: number) => void }) {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[e.key];
      if (!direction || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select'))
      ) {
        return;
      }
      const here = TOPS[from]!.clone().project(camera);
      let best = -1;
      let bestScore = MIN_ALIGNMENT;
      for (const index of PATHS[from]!) {
        const there = TOPS[index]!.clone().project(camera);
        const dx = (there.x - here.x) * aspect;
        const dy = there.y - here.y;
        const score = (dx * direction[0] + dy * direction[1]) / (Math.hypot(dx, dy) || 1);
        if (score > bestScore) {
          bestScore = score;
          best = index;
        }
      }
      if (best < 0) return;
      e.preventDefault();
      onTravel(best);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [camera, aspect, from, onTravel]);

  return null;
}

/** Orbit controls that back the camera off on narrow canvases so the city always fits. */
function FramedControls(props: React.ComponentProps<typeof OrbitControls>) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const distance = 6.6 / Math.min(1, aspect / 1.25);
  return (
    <OrbitControls {...props} target={[0, 0.3, 0]} minDistance={distance} maxDistance={distance} />
  );
}

export default function CityScene(props: CitySceneProps) {
  const { lit, sources, selected, query, onSelect, reducedMotion, lowPower, active, lang } = props;
  const { discovered, sighted, unknownLabel, hero, keys } = props;
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dimmed = lit.length > 0 || sources.length > 0;
  const wave = useMemo(
    () => (query ? { key: query.key, x: query.origin[0], z: query.origin[2] } : null),
    [query],
  );

  useEffect(() => {
    document.body.style.cursor = hovered !== null ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  return (
    <Canvas
      flat
      camera={{ position: [3.4, 3.5, 4.2], fov: 36 }}
      dpr={lowPower ? LOW_POWER_DPR : PIXEL_DPR}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={[NIGHT]} />
      <Moon />
      <Ground wave={wave} dimmed={dimmed} reducedMotion={reducedMotion} />
      <Blocks dimmed={dimmed} lowPower={lowPower} reducedMotion={reducedMotion} />
      <Expressway />
      <Plaza />
      <RadioTower reducedMotion={reducedMotion} />
      <Traffic lowPower={lowPower} reducedMotion={reducedMotion} />
      {!lowPower && <Rain reducedMotion={reducedMotion} />}
      <Routes lit={lit} sources={sources} hero={hero} />
      <HeroMarker at={hero} reducedMotion={reducedMotion} />
      {keys && active && <KeyTravel from={hero} onTravel={onSelect} />}
      <Towers
        lit={lit}
        sources={sources}
        selected={selected}
        discovered={discovered}
        sighted={sighted}
        unknownLabel={unknownLabel}
        hovered={hovered}
        onHover={setHovered}
        onSelect={onSelect}
        reducedMotion={reducedMotion}
        lang={lang}
      />
      {query && lit.length > 0 && (
        <QueryDrone key={query.key} query={query} lit={lit} reducedMotion={reducedMotion} />
      )}
      <FramedControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        autoRotate={!reducedMotion && !dragging && hovered === null && selected === null}
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.4}
        onStart={() => setDragging(true)}
        onEnd={() => setDragging(false)}
      />
    </Canvas>
  );
}
