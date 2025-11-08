import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface BrainBoostProps {
  audioData: AudioData | null;
  params: VisualParams;
}

// Color presets for Brain Boost
const COLOR_PRESETS = {
  electric: {
    name: 'Electric Purple',
    darkEnergy: { r: 0.1, g: 0.05, b: 0.15 },
    electricPurple: { r: 0.6, g: 0.2, b: 0.9 },
    vibrantPink: { r: 1.0, g: 0.3, b: 0.7 },
    energyYellow: { r: 1.0, g: 0.9, b: 0.2 },
    explosiveWhite: { r: 1.0, g: 0.95, b: 0.85 },
  },
  softPink: {
    name: 'Soft Pink',
    darkEnergy: { r: 0.15, g: 0.08, b: 0.12 },
    electricPurple: { r: 0.85, g: 0.5, b: 0.7 },
    vibrantPink: { r: 0.95, g: 0.7, b: 0.85 },
    energyYellow: { r: 1.0, g: 0.9, b: 0.85 },
    explosiveWhite: { r: 1.0, g: 0.95, b: 0.98 },
  },
  softGreen: {
    name: 'Soft Green',
    darkEnergy: { r: 0.08, g: 0.15, b: 0.12 },
    electricPurple: { r: 0.5, g: 0.85, b: 0.7 },
    vibrantPink: { r: 0.7, g: 0.95, b: 0.85 },
    energyYellow: { r: 0.85, g: 0.95, b: 0.7 },
    explosiveWhite: { r: 0.95, g: 1.0, b: 0.98 },
  },
  softYellow: {
    name: 'Soft Yellow',
    darkEnergy: { r: 0.15, g: 0.12, b: 0.08 },
    electricPurple: { r: 0.85, g: 0.75, b: 0.5 },
    vibrantPink: { r: 0.95, g: 0.9, b: 0.7 },
    energyYellow: { r: 1.0, g: 0.95, b: 0.7 },
    explosiveWhite: { r: 1.0, g: 0.98, b: 0.95 },
  },
};

export const BrainBoost: React.FC<BrainBoostProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Get color preset
  const preset = params.colorPreset && COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    ? COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    : COLOR_PRESETS.electric;

  // Electric arcing paths with energetic swirls
  const { positions, baseColors } = useMemo(() => {
    const particleCount = Math.floor(95000 * params.density);
    const positions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    // Dynamic explosive color palette (energetic, electric)
    const darkEnergy = preset.darkEnergy;
    const electricPurple = preset.electricPurple;
    const vibrantPink = preset.vibrantPink;
    const energyYellow = preset.energyYellow;
    const explosiveWhite = preset.explosiveWhite;

    // Create electric arcing paths (lightning-like trajectories)
    const numArcs = 18;
    const particlesPerArc = Math.floor(particleCount / numArcs);

    for (let arcIdx = 0; arcIdx < numArcs; arcIdx++) {
      const startIdx = arcIdx * particlesPerArc;

      // Arc origin and target (explosive movement)
      const originX = (Math.random() - 0.5) * 20;
      const originY = (Math.random() - 0.5) * 20;
      const originZ = (Math.random() - 0.5) * 20;

      const targetX = (Math.random() - 0.5) * 50;
      const targetY = (Math.random() - 0.5) * 40;
      const targetZ = (Math.random() - 0.5) * 50;

      // Swirl intensity (dynamic explosive)
      const swirlStrength = 3 + Math.random() * 5;
      const swirlFrequency = 2 + Math.random() * 3;

      for (let i = 0; i < particlesPerArc && startIdx + i < particleCount; i++) {
        const i3 = (startIdx + i) * 3;

        // Arc progress (0 to 1)
        const t = i / particlesPerArc;

        // Linear interpolation with electric deviation
        const baseX = originX + (targetX - originX) * t;
        const baseY = originY + (targetY - originY) * t;
        const baseZ = originZ + (targetZ - originZ) * t;

        // Electric arcing deviation (lightning zigzag)
        const arcAngle = t * Math.PI * swirlFrequency;
        const arcRadius = Math.sin(t * Math.PI) * swirlStrength; // Peak at middle

        const electricDevX = Math.cos(arcAngle) * arcRadius * (Math.random() * 0.5 + 0.75);
        const electricDevY = Math.sin(arcAngle * 1.3) * arcRadius * (Math.random() * 0.5 + 0.75);
        const electricDevZ = Math.sin(arcAngle) * arcRadius * (Math.random() * 0.5 + 0.75);

        positions[i3] = baseX + electricDevX;
        positions[i3 + 1] = baseY + electricDevY;
        positions[i3 + 2] = baseZ + electricDevZ;

        // Energetic swirl colors (explosive gradient)
        const energyLevel = Math.sin(t * Math.PI); // Peak energy at middle
        let color;

        if (t < 0.15) {
          // Start: dark energy
          const blend = t / 0.15;
          color = {
            r: darkEnergy.r * (1 - blend) + electricPurple.r * blend,
            g: darkEnergy.g * (1 - blend) + electricPurple.g * blend,
            b: darkEnergy.b * (1 - blend) + electricPurple.b * blend,
          };
        } else if (t < 0.4) {
          // Build: electric purple to vibrant pink
          const blend = (t - 0.15) / 0.25;
          color = {
            r: electricPurple.r * (1 - blend) + vibrantPink.r * blend,
            g: electricPurple.g * (1 - blend) + vibrantPink.g * blend,
            b: electricPurple.b * (1 - blend) + vibrantPink.b * blend,
          };
        } else if (t < 0.7) {
          // Peak: vibrant pink to energy yellow
          const blend = (t - 0.4) / 0.3;
          color = {
            r: vibrantPink.r * (1 - blend) + energyYellow.r * blend,
            g: vibrantPink.g * (1 - blend) + energyYellow.g * blend,
            b: vibrantPink.b * (1 - blend) + energyYellow.b * blend,
          };
        } else {
          // Explosive end: energy yellow to explosive white
          const blend = (t - 0.7) / 0.3;
          color = {
            r: energyYellow.r * (1 - blend) + explosiveWhite.r * blend,
            g: energyYellow.g * (1 - blend) + explosiveWhite.g * blend,
            b: energyYellow.b * (1 - blend) + explosiveWhite.b * blend,
          };
        }

        // Brightness boost at peak energy
        const brightnessFactor = 0.7 + energyLevel * 0.5;
        baseColors[i3] = color.r * brightnessFactor;
        baseColors[i3 + 1] = color.g * brightnessFactor;
        baseColors[i3 + 2] = color.b * brightnessFactor;
      }
    }

    return { positions, baseColors };
  }, [params.density, params.colorPreset]);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime() * params.speed * 0.4; // 40% speed
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;

    // Audio scaling (explosive, energetic response)
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.7) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.6) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 1.2 : 0;

    // Dynamic explosive movement
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];

      // Electric arcing motion (lightning strikes)
      const arc1 = Math.sin(x * 0.18 + time * 3.5) * Math.cos(z * 0.15 + time * 3.0);
      const arc2 = Math.cos(y * 0.12 + time * 3.8) * Math.sin(x * 0.2 - time * 3.2);
      const arc3 = Math.sin(z * 0.22 - time * 3.0) * Math.cos(y * 0.16 + time * 3.5);

      const electricMotion = (arc1 + arc2 + arc3) * 3.5 * bassScale;

      // Energetic swirls (explosive spirals)
      const distance = Math.sqrt(x * x + y * y + z * z);
      const swirlAngle = Math.atan2(z, x);
      const explosiveSwirl = Math.sin(swirlAngle * 4 + time * 4.5 - distance * 0.08) * 2.5 * midScale;

      // Dynamic burst expansion
      const burstPulse = Math.sin(time * 4.0 - distance * 0.12) * 4.0 * highScale;

      pos[i] = x + electricMotion + Math.cos(swirlAngle) * explosiveSwirl + burstPulse * 0.2;
      pos[i + 1] = y + arc2 * 4.0 * bassScale + burstPulse * 0.4;
      pos[i + 2] = z + electricMotion + Math.sin(swirlAngle) * explosiveSwirl + burstPulse * 0.2;

      // Explosive energy glow (intense pulsation)
      const energyPulse = Math.sin(time * 6.0 + distance * 0.18) * 0.5 + 0.5;
      const brightness = 0.9 + (energyPulse * 0.6) + (highScale * 0.8);

      col[i] = Math.min(1.8, baseColors[i] * brightness);
      col[i + 1] = Math.min(1.8, baseColors[i + 1] * brightness);
      col[i + 2] = Math.min(1.8, baseColors[i + 2] * brightness);
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Energetic rotation (dynamic spinning)
    meshRef.current.rotation.y += 0.003 * params.speed * midScale;
    meshRef.current.rotation.x += 0.002 * params.speed * bassScale;
    meshRef.current.rotation.z = Math.sin(time * 2.5) * 0.15;

    // Explosive pulsation (energy burst)
    const pulse = 1 + Math.sin(time * 3.0) * 0.12 * bassScale;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={baseColors.length / 3}
          array={baseColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Export color presets for use in controls
export { COLOR_PRESETS };
