import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface OceanWavesProps {
  audioData: AudioData | null;
  params: VisualParams;
}

// Color presets for different ocean moods
const COLOR_PRESETS = {
  midnight: {
    name: 'Midnight Ocean',
    deepOcean: { r: 0.05, g: 0.15, b: 0.25 },      // #0d263f
    midnightBlue: { r: 0.15, g: 0.25, b: 0.4 },    // #264066
    twilightTeal: { r: 0.25, g: 0.4, b: 0.5 },     // #40667f
    moonlitSilver: { r: 0.7, g: 0.75, b: 0.85 },   // #b3bfd9
    shimmerWhite: { r: 0.9, g: 0.95, b: 1.0 },     // #e6f2ff
  },
  tropical: {
    name: 'Tropical Paradise',
    deepOcean: { r: 0.0, g: 0.25, b: 0.35 },       // #004059 (deep tropical)
    midnightBlue: { r: 0.0, g: 0.45, b: 0.55 },    // #00728c (azure)
    twilightTeal: { r: 0.1, g: 0.65, b: 0.7 },     // #1aa6b3 (turquoise)
    moonlitSilver: { r: 0.4, g: 0.85, b: 0.85 },   // #66d9d9 (aqua)
    shimmerWhite: { r: 0.7, g: 1.0, b: 1.0 },      // #b3ffff (cyan sparkle)
  },
  sunset: {
    name: 'Sunset Glow',
    deepOcean: { r: 0.2, g: 0.15, b: 0.3 },        // #33264d (deep purple)
    midnightBlue: { r: 0.35, g: 0.2, b: 0.45 },    // #593373 (purple blue)
    twilightTeal: { r: 0.6, g: 0.3, b: 0.5 },      // #994d7f (magenta)
    moonlitSilver: { r: 0.95, g: 0.6, b: 0.5 },    // #f2997f (coral)
    shimmerWhite: { r: 1.0, g: 0.8, b: 0.6 },      // #ffcc99 (peach glow)
  },
  arctic: {
    name: 'Arctic Ice',
    deepOcean: { r: 0.1, g: 0.2, b: 0.3 },         // #1a334d (deep arctic)
    midnightBlue: { r: 0.2, g: 0.35, b: 0.45 },    // #335973 (ice blue)
    twilightTeal: { r: 0.4, g: 0.55, b: 0.65 },    // #668ca6 (glacier)
    moonlitSilver: { r: 0.75, g: 0.85, b: 0.95 },  // #bfd9f2 (ice white)
    shimmerWhite: { r: 0.95, g: 0.98, b: 1.0 },    // #f2faff (ice sparkle)
  },
  emerald: {
    name: 'Emerald Deep',
    deepOcean: { r: 0.0, g: 0.2, b: 0.15 },        // #003326 (deep emerald)
    midnightBlue: { r: 0.0, g: 0.35, b: 0.3 },     // #00594d (dark teal)
    twilightTeal: { r: 0.1, g: 0.55, b: 0.45 },    // #1a8c73 (emerald)
    moonlitSilver: { r: 0.4, g: 0.8, b: 0.7 },     // #66ccb3 (mint)
    shimmerWhite: { r: 0.7, g: 1.0, b: 0.9 },      // #b3ffe6 (mint sparkle)
  },
};

export const OceanWaves: React.FC<OceanWavesProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Get color preset (default to midnight)
  const preset = params.colorPreset && COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    ? COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    : COLOR_PRESETS.midnight;

  // Generate ocean surface with moonlight sparkles (윤슬)
  const { positions, baseColors } = useMemo(() => {
    const particleCount = Math.floor(75000 * params.density);
    const positions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    const colors = preset;
    const numLayers = 15;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Horizontal spread (ocean surface)
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 50;

      // Clustered wave patterns (웨이브 뭉침 강화)
      const wave1 = Math.sin(x * 0.2) * 2.5;
      const wave2 = Math.cos(z * 0.18) * 2.0;
      const ripple = Math.sin(x * 0.35 + z * 0.3) * 1.2;

      // Wave clustering effect (파도가 뭉치는 효과)
      const clusterX = Math.floor(x / 5) * 5;
      const clusterZ = Math.floor(z / 5) * 5;
      const clusterWave = Math.sin(clusterX * 0.15) * Math.cos(clusterZ * 0.12) * 1.5;

      const baseHeight = wave1 + wave2 + ripple + clusterWave;

      // Layer variation with wave-following depth
      const layer = Math.floor(Math.random() * numLayers);
      const y = baseHeight - layer * 1.2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Color based on depth and moonlight sparkle position
      const distanceFromOrigin = Math.sqrt(x * x + z * z) / 40;
      const sparkleChance = Math.random();

      let color;

      // Moonlight path (윤슬) - vertical strip where moon reflects
      const inMoonPath = Math.abs(x) < 8 && z > -10 && z < 20;

      if (inMoonPath && sparkleChance > 0.85) {
        color = colors.shimmerWhite;
      } else if (inMoonPath && sparkleChance > 0.6) {
        color = colors.moonlitSilver;
      } else if (layer < 5) {
        color = distanceFromOrigin < 0.5 ? colors.twilightTeal : colors.midnightBlue;
      } else {
        color = distanceFromOrigin < 0.6 ? colors.midnightBlue : colors.deepOcean;
      }

      // Add color variation
      const variation = (Math.random() - 0.5) * 0.05;
      baseColors[i3] = Math.max(0, Math.min(1, color.r + variation));
      baseColors[i3 + 1] = Math.max(0, Math.min(1, color.g + variation));
      baseColors[i3 + 2] = Math.max(0, Math.min(1, color.b + variation));
    }

    return { positions, baseColors };
  }, [params.density, params.colorPreset]);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime() * params.speed;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;

    // Audio scaling (gentle like ocean)
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.25) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.2) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 0.6 : 0;

    // Ocean wave motion
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];

      // Multiple overlapping sine waves (realistic ocean)
      const wave1 = Math.sin(x * 0.1 + time * 0.3) * Math.cos(z * 0.08 + time * 0.25);
      const wave2 = Math.cos(x * 0.15 - time * 0.4) * Math.sin(z * 0.12 + time * 0.35);
      const wave3 = Math.sin(x * 0.08 + z * 0.1 + time * 0.5) * 0.5;

      const totalWave = (wave1 + wave2 + wave3) * 0.8 * bassScale;

      // Horizontal drift (ocean current)
      const drift = Math.sin(time * 0.15 + z * 0.05) * 0.3 * midScale;

      pos[i] = x + drift;
      pos[i + 1] = y + totalWave;
      pos[i + 2] = z;

      // Sparkle effect on moonlight path
      const inMoonPath = Math.abs(x) < 8 && z > -10 && z < 20;
      if (inMoonPath) {
        const sparkle = Math.sin(time * 2 + x * 0.5 + z * 0.3) * 0.5 + 0.5;
        const brightness = 1 + (sparkle * highScale * 0.8);

        col[i] = Math.min(1, baseColors[i] * brightness);
        col[i + 1] = Math.min(1, baseColors[i + 1] * brightness);
        col[i + 2] = Math.min(1, baseColors[i + 2] * brightness);
      } else {
        col[i] = baseColors[i];
        col[i + 1] = baseColors[i + 1];
        col[i + 2] = baseColors[i + 2];
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Gentle camera perspective shift (like boat rocking)
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.02;
    meshRef.current.rotation.z = Math.cos(time * 0.18) * 0.015;

    // Very subtle scale breathing
    const breathe = 1 + Math.sin(time * 0.25) * 0.008 * bassScale;
    meshRef.current.scale.set(breathe, breathe, breathe);
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
        size={0.07}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Export color presets for use in controls
export { COLOR_PRESETS };
