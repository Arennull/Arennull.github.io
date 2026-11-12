import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PALETTE } from '../i18n/strings';
import { seeded } from '../lib/random';
import { CITY, PITCH, REACH } from './layout';
import {
  BUILDING_FRAGMENT,
  BUILDING_VERTEX,
  GROUND_FRAGMENT,
  GROUND_VERTEX,
  RAIN_FRAGMENT,
  RAIN_VERTEX,
} from './shaders';

export const NIGHT = new THREE.Color(PALETTE.night);
const WAVE_SECONDS = 1.6;
const HALF = CITY.size / 2;
/** Height of the elevated expressway deck. */
const DECK = 0.36;
/** Street lines the expressway runs above, in lots from the centre. */
const EXPRESSWAY_X = 2.5 * PITCH;
const EXPRESSWAY_Z = -3.5 * PITCH;

/** A unit box that stands on the ground instead of being centred on it. */
export const STANDING_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

export function buildingMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: BUILDING_VERTEX,
    fragmentShader: BUILDING_FRAGMENT,
    uniforms: { uNight: { value: NIGHT }, uDim: { value: 1 } },
  });
}

/** Eases a uniform towards a value, or snaps to it when motion is reduced. */
function ease(uniform: { value: number }, target: number, reducedMotion: boolean) {
  uniform.value = reducedMotion ? target : uniform.value + (target - uniform.value) * 0.08;
}

interface GroundProps {
  /** Where the current query landed, and a key that changes with every query. */
  wave: { key: number; x: number; z: number } | null;
  dimmed: boolean;
  reducedMotion: boolean;
}

export function Ground({ wave, dimmed, reducedMotion }: GroundProps) {
  const started = useRef<number | null>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GROUND_VERTEX,
        fragmentShader: GROUND_FRAGMENT,
        uniforms: {
          uNight: { value: NIGHT },
          uHalf: { value: HALF },
          uDim: { value: 1 },
          uOrigin: { value: new THREE.Vector2() },
          uPulse: { value: 2 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    started.current = null;
    if (wave) material.uniforms.uOrigin!.value.set(wave.x, wave.z);
    material.uniforms.uPulse!.value = wave && !reducedMotion ? 0 : 2;
  }, [wave, reducedMotion, material]);

  useFrame(({ clock }) => {
    ease(material.uniforms.uDim!, dimmed ? 0.45 : 1, reducedMotion);
    if (!wave || reducedMotion) return;
    started.current ??= clock.elapsedTime;
    material.uniforms.uPulse!.value = (clock.elapsedTime - started.current) / WAVE_SECONDS;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} material={material}>
      <planeGeometry args={[40, 40]} />
    </mesh>
  );
}

/** Everything that is not a tower: the ordinary blocks and a far skyline around them. */
export function Blocks({
  dimmed,
  lowPower,
  reducedMotion,
}: Omit<GroundProps, 'wave'> & { lowPower: boolean }) {
  const material = useMemo(buildingMaterial, []);
  useEffect(() => () => material.dispose(), [material]);

  const mesh = useMemo(() => {
    const random = seeded(23);
    const skyline = Array.from({ length: lowPower ? 40 : 110 }, () => {
      const angle = random() * Math.PI * 2;
      const radius = HALF * 1.3 + random() * 2.4;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        width: 0.2 + random() * 0.3,
        depth: 0.2 + random() * 0.3,
        height: 0.1 + random() * random() * 0.5,
        seed: random(),
      };
    });
    const all = [...CITY.fillers, ...skyline];
    const instanced = new THREE.InstancedMesh(STANDING_BOX, material, all.length);
    const matrix = new THREE.Matrix4();
    const colors = new Float32Array(all.length * 3);
    const seeds = new Float32Array(all.length);
    const signs = [PALETTE.cyan, '#d0408a', PALETTE.orange, PALETTE.sky].map(
      (c) => new THREE.Color(c),
    );
    all.forEach((b, i) => {
      matrix.makeScale(b.width, b.height, b.depth).setPosition(b.x, 0, b.z);
      instanced.setMatrixAt(i, matrix);
      signs[Math.floor(b.seed * signs.length)]!.toArray(colors, i * 3);
      seeds[i] = b.seed;
    });
    const geometry = STANDING_BOX.clone();
    geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geometry.setAttribute(
      'aGlow',
      new THREE.InstancedBufferAttribute(new Float32Array(all.length), 1),
    );
    instanced.geometry = geometry;
    instanced.frustumCulled = false;
    return instanced;
  }, [material, lowPower]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.dispose();
    },
    [mesh],
  );

  useFrame(() => ease(material.uniforms.uDim!, dimmed ? 0.4 : 1, reducedMotion));

  return <primitive object={mesh} />;
}

interface Vehicle {
  /** 0 drives along x, 1 along z. */
  axis: 0 | 1;
  /** Where its street is on the other axis. */
  line: number;
  height: number;
  direction: 1 | -1;
  speed: number;
  phase: number;
  color: THREE.Color;
}

const LIGHTS = [PALETTE.white, PALETTE.red, PALETTE.yellow, PALETTE.cyan, '#d0408a'];

function fleet(
  count: number,
  seed: number,
  heights: number[],
  speeds: [number, number],
): Vehicle[] {
  const random = seeded(seed);
  return Array.from({ length: count }, () => {
    const direction = random() < 0.5 ? 1 : -1;
    return {
      axis: random() < 0.5 ? 0 : 1,
      line: (Math.floor(random() * (2 * REACH + 2)) - REACH - 0.5) * PITCH,
      height: heights[Math.floor(random() * heights.length)]!,
      direction,
      speed: speeds[0] + random() * (speeds[1] - speeds[0]),
      phase: random() * CITY.size,
      color: new THREE.Color(LIGHTS[Math.floor(random() * LIGHTS.length)]!),
    };
  });
}

/** Cars on the expressway: same thing, pinned to its two lines and its height. */
function expresswayFleet(count: number): Vehicle[] {
  return fleet(count, 61, [DECK + 0.025], [0.7, 1.1]).map((car, i) => ({
    ...car,
    axis: i % 2 === 0 ? 1 : 0,
    line: i % 2 === 0 ? EXPRESSWAY_X : EXPRESSWAY_Z,
  }));
}

interface FleetProps {
  vehicles: Vehicle[];
  /** Length, height and width of one vehicle. */
  size: [number, number, number];
  /** Sideways offset from the middle of the street, so the two directions do not collide. */
  lane: number;
  reducedMotion: boolean;
  glow?: boolean;
}

function Fleet({ vehicles, size, lane, reducedMotion, glow = false }: FleetProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const [length, height, width] = size;

  const place = useCallback(
    (time: number) => {
      const mesh = ref.current;
      if (!mesh) return;
      vehicles.forEach((v, i) => {
        const span = CITY.size + 1.2;
        const travelled = v.phase + time * v.speed * v.direction;
        const along = (((travelled % span) + span) % span) - span / 2;
        // Traffic keeps left, as it does in Japan.
        const across = v.line - v.direction * lane * (v.axis === 0 ? 1 : -1);
        const bob = glow ? Math.sin(time * 1.3 + v.phase * 5) * 0.012 : 0;
        if (v.axis === 0) {
          matrix.makeScale(length, height, width).setPosition(along, v.height + bob, across);
        } else {
          matrix.makeScale(width, height, length).setPosition(across, v.height + bob, along);
        }
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    [vehicles, length, height, width, lane, glow, matrix],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    vehicles.forEach((v, i) => mesh.setColorAt(i, v.color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    place(0);
  }, [vehicles, place]);

  useFrame(({ clock }) => {
    if (!reducedMotion) place(clock.elapsedTime);
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, vehicles.length]} frustumCulled={false}>
      <boxGeometry />
      <meshBasicMaterial
        toneMapped={false}
        transparent={glow}
        opacity={glow ? 0.35 : 1}
        blending={glow ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={!glow}
      />
    </instancedMesh>
  );
}

/** Cars on the streets and the expressway, and flying ones threading between the towers. */
export function Traffic({
  lowPower,
  reducedMotion,
}: {
  lowPower: boolean;
  reducedMotion: boolean;
}) {
  const cars = useMemo(() => fleet(lowPower ? 26 : 90, 5, [0.012], [0.25, 0.6]), [lowPower]);
  const fast = useMemo(() => expresswayFleet(lowPower ? 8 : 22), [lowPower]);
  const flyers = useMemo(
    () => fleet(lowPower ? 10 : 34, 17, [0.62, 0.9, 1.2, 1.65], [0.5, 1.2]),
    [lowPower],
  );
  return (
    <>
      <Fleet
        vehicles={cars}
        size={[0.05, 0.016, 0.022]}
        lane={0.022}
        reducedMotion={reducedMotion}
      />
      <Fleet
        vehicles={fast}
        size={[0.06, 0.016, 0.022]}
        lane={0.018}
        reducedMotion={reducedMotion}
      />
      <Fleet
        vehicles={flyers}
        size={[0.075, 0.018, 0.03]}
        lane={0.03}
        reducedMotion={reducedMotion}
      />
      {!lowPower && (
        // Light trails: the same flight paths, stretched and see-through.
        <Fleet
          vehicles={flyers}
          size={[0.42, 0.008, 0.012]}
          lane={0.03}
          reducedMotion={reducedMotion}
          glow
        />
      )}
    </>
  );
}

/** Two elevated roads crossing the city on pillars, edged with light. */
export function Expressway() {
  const span = CITY.size + 1.2;
  const pillars = useMemo(() => {
    const spots: [number, number][] = [];
    for (let k = -REACH - 1; k <= REACH; k += 2) {
      const at = (k + 0.5) * PITCH;
      spots.push([EXPRESSWAY_X, at]);
      // Where the two roads cross, one pillar is enough.
      if (at !== EXPRESSWAY_X) spots.push([at, EXPRESSWAY_Z]);
    }
    return spots;
  }, []);
  const deck = (
    <>
      <mesh>
        <boxGeometry args={[0.09, 0.016, span]} />
        <meshBasicMaterial color="#232a45" />
      </mesh>
      {[-0.047, 0.047].map((side) => (
        <mesh key={side} position={[side, 0.012, 0]}>
          <boxGeometry args={[0.006, 0.012, span]} />
          <meshBasicMaterial color={PALETTE.cyan} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
  return (
    <>
      <group position={[EXPRESSWAY_X, DECK, 0]}>{deck}</group>
      <group position={[0, DECK, EXPRESSWAY_Z]} rotation-y={Math.PI / 2}>
        {deck}
      </group>
      {pillars.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, DECK / 2, z]}>
          <boxGeometry args={[0.022, DECK, 0.022]} />
          <meshBasicMaterial color="#2c3454" />
        </mesh>
      ))}
    </>
  );
}

/** A torii and four lanterns on the one empty lot in the middle of town. */
export function Plaza() {
  const red = <meshBasicMaterial color="#d1344b" toneMapped={false} />;
  return (
    <group position={[CITY.plaza.x, 0, CITY.plaza.z]}>
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.075, 0]}>
          <boxGeometry args={[0.016, 0.15, 0.016]} />
          {red}
        </mesh>
      ))}
      <mesh position={[0, 0.158, 0]}>
        <boxGeometry args={[0.19, 0.018, 0.026]} />
        {red}
      </mesh>
      <mesh position={[0, 0.172, 0]}>
        <boxGeometry args={[0.21, 0.01, 0.032]} />
        <meshBasicMaterial color={PALETTE.night} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <boxGeometry args={[0.15, 0.012, 0.014]} />
        {red}
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x},${z}`} position={[x * 0.075, 0.03, z * 0.075]}>
            <boxGeometry args={[0.018, 0.028, 0.018]} />
            <meshBasicMaterial color={PALETTE.orange} toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** A red and white lattice tower beyond the last blocks, with a blinking light on top. */
export function RadioTower({ reducedMotion }: { reducedMotion: boolean }) {
  const light = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.visible = reducedMotion || clock.elapsedTime % 1.4 < 0.7;
  });
  const at = HALF + 0.7;
  return (
    <group position={[-at, 0, -at]}>
      {[
        [0, 1.1, 0.34, '#d1344b'],
        [1.1, 0.7, 0.16, PALETTE.white],
        [1.8, 0.5, 0.07, '#d1344b'],
      ].map(([y, height, radius, color]) => (
        <mesh key={y} position={[0, (y as number) + (height as number) / 2, 0]}>
          <cylinderGeometry
            args={[(radius as number) * 0.45, radius as number, height as number, 4, 3]}
          />
          <meshBasicMaterial color={color as string} wireframe toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={light} position={[0, 2.34, 0]}>
        <boxGeometry args={[0.035, 0.035, 0.035]} />
        <meshBasicMaterial color={PALETTE.red} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** A pale moon low over the skyline. It follows the camera round, as moons do. */
export function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    const moon = ref.current;
    if (!moon) return;
    // Always behind the city from wherever it is looked at.
    moon.position.set(-camera.position.x * 2.2, 3.4, -camera.position.z * 2.2);
    moon.lookAt(camera.position);
  });
  return (
    <mesh ref={ref}>
      <circleGeometry args={[1.25, 24]} />
      <meshBasicMaterial color="#b9c4dc" toneMapped={false} fog={false} />
    </mesh>
  );
}

export function Rain({ reducedMotion }: { reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const random = seeded(88);
    const count = 900;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * (CITY.size + 1);
      positions[i * 3 + 1] = random() * 3.2;
      positions[i * 3 + 2] = (random() - 0.5) * (CITY.size + 1);
      speeds[i] = 2.2 + random() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: RAIN_VERTEX,
      fragmentShader: RAIN_FRAGMENT,
      uniforms: { uTime: { value: 0 }, uSize: { value: 6 } },
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    material.uniforms.uSize!.value = 5 * dpr;
    if (!reducedMotion) material.uniforms.uTime!.value = clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
