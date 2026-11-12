import { PITCH, LOT } from './layout';

const glsl = (strings: TemplateStringsArray, ...values: (string | number)[]) =>
  String.raw({ raw: strings }, ...values);

const HASH = glsl`
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
`;

/** Distance at which the city starts to dissolve into the night, and where it is gone. */
const FOG = glsl`
  vec3 fog(vec3 color, vec3 world) {
    return mix(color, uNight, smoothstep(8.5, 14.0, distance(world, cameraPosition)));
  }
`;

/**
 * Every building is an instanced box. Windows are drawn from the world
 * position, so they keep their size whatever the building's; `aColor` is the
 * neon of its district and `aGlow` how brightly it burns.
 */
export const BUILDING_VERTEX = glsl`
  attribute vec3 aColor;
  attribute float aGlow;
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vGlow;
  varying float vSeed;

  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normal;
    vUv = uv;
    vColor = aColor;
    vGlow = aGlow;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const BUILDING_FRAGMENT = glsl`
  uniform vec3 uNight;
  /** 1 normally; lower while the Oracle is searching, so the answer stands out. */
  uniform float uDim;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vGlow;
  varying float vSeed;
  ${HASH}
  ${FOG}

  void main() {
    vec3 wall = vec3(0.07, 0.08, 0.13);
    vec3 color;
    if (vNormal.y > 0.5) {
      // Roof: dark, with a neon rim.
      vec2 edge = min(vUv, 1.0 - vUv);
      float rim = step(min(edge.x, edge.y), 0.09);
      color = wall * 1.35 + vColor * rim * (0.22 + vGlow);
    } else {
      bool side = abs(vNormal.x) > 0.5;
      float across = side ? vWorld.z : vWorld.x;
      vec2 grid = vec2(across / 0.03, vWorld.y / 0.042);
      vec2 cell = floor(grid);
      vec2 inside = fract(grid);
      float pick = hash(cell + vSeed * 91.7);
      float pane = step(0.22, inside.x) * step(inside.x, 0.8) * step(0.25, inside.y) * step(inside.y, 0.8);
      float lit = step(0.66, pick);
      vec3 lamp = mix(vec3(1.0, 0.8, 0.46), vec3(0.45, 0.94, 0.97), step(0.87, pick));
      float shade = side ? 0.72 : 1.0;

      color = wall * shade;
      color += pane * lit * lamp * shade * uDim * (0.42 + 0.6 * vGlow);
      color += pane * lit * vColor * vGlow * 0.55;
      // Neon down the corners and around the top.
      float corner = step(vUv.x, 0.07) + step(0.93, vUv.x);
      color += vColor * corner * (0.12 * uDim + 1.1 * vGlow);
      color += vColor * step(0.95, vUv.y) * (0.16 * uDim + vGlow);
      // The street lights the first floors.
      color += vec3(0.85, 0.3, 0.6) * 0.14 * uDim * (1.0 - smoothstep(0.0, 0.09, vWorld.y));
    }
    gl_FragColor = vec4(fog(color, vWorld), 1.0);
  }
`;

export const GROUND_VERTEX = glsl`
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** Streets, lane marks, wet reflections and the wave a query sends across town. */
export const GROUND_FRAGMENT = glsl`
  uniform vec3 uNight;
  uniform float uHalf;
  uniform float uDim;
  uniform vec2 uOrigin;
  /** 0 → 1 while the wave of a query spreads; above 1 there is none. */
  uniform float uPulse;
  varying vec3 vWorld;
  ${HASH}
  ${FOG}

  void main() {
    vec2 p = vWorld.xz / ${PITCH.toFixed(4)};
    // Lots sit on whole numbers, so streets run where the fraction is one half.
    vec2 off = abs(fract(p) - 0.5);
    float street = ${((PITCH - LOT) / 2 / PITCH).toFixed(4)};
    float fromStreet = min(off.x, off.y);
    float inCity = step(max(abs(vWorld.x), abs(vWorld.z)), uHalf);

    vec3 asphalt = vec3(0.04, 0.045, 0.08);
    vec3 block = vec3(0.085, 0.095, 0.15);
    vec3 color = mix(asphalt, block, step(street, fromStreet) * inCity);

    // Dashed centre lines.
    float alongX = step(off.y, 0.014) * step(fract(p.x * 4.0), 0.5);
    float alongZ = step(off.x, 0.014) * step(fract(p.y * 4.0), 0.5);
    color += vec3(1.0, 0.8, 0.46) * 0.4 * max(alongX, alongZ) * inCity * uDim;
    // Kerbs catch the neon.
    float kerb = step(abs(fromStreet - street), 0.012) * inCity;
    color += vec3(0.45, 0.94, 0.97) * 0.16 * kerb * uDim;
    // Puddles: patches of pink and cyan on the wet road.
    float puddle = hash(floor(p * 7.0)) * step(fromStreet, street) * inCity;
    color += mix(vec3(0.7, 0.24, 0.5), vec3(0.25, 0.65, 0.96), step(0.5, hash(floor(p * 7.0) + 3.1)))
      * 0.11 * step(0.72, puddle) * uDim;

    float ring = abs(distance(vWorld.xz, uOrigin) - uPulse * 5.5);
    color += vec3(1.0, 0.8, 0.46) * (1.0 - smoothstep(0.0, 0.1, ring)) * step(uPulse, 1.0) * (1.0 - uPulse);

    gl_FragColor = vec4(fog(color, vWorld), 1.0);
  }
`;

export const RAIN_VERTEX = glsl`
  uniform float uTime;
  uniform float uSize;
  attribute float aSpeed;
  void main() {
    vec3 p = position;
    p.y = mod(p.y - uTime * aSpeed, 3.2);
    vec4 view = viewMatrix * modelMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = uSize;
  }
`;

export const RAIN_FRAGMENT = glsl`
  void main() {
    // A thin vertical streak inside each point.
    float streak = step(abs(gl_PointCoord.x - 0.5), 0.12);
    gl_FragColor = vec4(0.58, 0.69, 0.76, 0.2 * streak);
  }
`;
