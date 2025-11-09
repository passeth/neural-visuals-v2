import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface MentalFocusProps {
  audioData: AudioData | null;
  params: VisualParams;
}

// Color presets for Mental Focus
const COLOR_PRESETS = {
  electric: {
    name: 'Electric Blue',
    core: { r: 0.95, g: 0.98, b: 1.0 },      // laser white
    mid: { r: 0.0, g: 0.9, b: 1.0 },         // sharp cyan
    edge: { r: 0.0, g: 0.5, b: 1.0 },        // electric blue
    outer: { r: 0.3, g: 0.35, b: 0.4 },      // steel gray
    deep: { r: 0.05, g: 0.08, b: 0.15 },     // deep black
  },
  softPink: {
    name: 'Soft Pink',
    core: { r: 1.0, g: 0.95, b: 0.98 },      // soft white
    mid: { r: 0.95, g: 0.7, b: 0.85 },       // soft pink
    edge: { r: 0.85, g: 0.5, b: 0.7 },       // medium pink
    outer: { r: 0.5, g: 0.35, b: 0.4 },      // dusty rose
    deep: { r: 0.15, g: 0.08, b: 0.12 },     // deep rose
  },
  softGreen: {
    name: 'Soft Green',
    core: { r: 0.95, g: 1.0, b: 0.98 },      // soft white
    mid: { r: 0.7, g: 0.95, b: 0.85 },       // soft mint
    edge: { r: 0.5, g: 0.85, b: 0.7 },       // medium green
    outer: { r: 0.35, g: 0.5, b: 0.4 },      // dusty green
    deep: { r: 0.08, g: 0.15, b: 0.12 },     // deep green
  },
  softYellow: {
    name: 'Soft Yellow',
    core: { r: 1.0, g: 0.98, b: 0.95 },      // soft white
    mid: { r: 0.95, g: 0.9, b: 0.7 },        // soft yellow
    edge: { r: 0.85, g: 0.75, b: 0.5 },      // medium gold
    outer: { r: 0.5, g: 0.45, b: 0.35 },     // dusty gold
    deep: { r: 0.15, g: 0.12, b: 0.08 },     // deep gold
  },
};

export const MentalFocus: React.FC<MentalFocusProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Get color preset
  const preset = params.colorPreset && COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    ? COLOR_PRESETS[params.colorPreset as keyof typeof COLOR_PRESETS]
    : COLOR_PRESETS.electric;

  // Sharp angular particle mesh with aggressive cuts and fragmented planes
  const { positions, baseColors } = useMemo(() => {
    const particleCount = Math.floor(100000 * params.density);
    const positions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    const colors = preset;

    // Create fragmented angular planes (razor-sharp folded ribbons)
    const numPlanes = 20;
    const particlesPerPlane = Math.floor(particleCount / numPlanes);

    for (let planeIdx = 0; planeIdx < numPlanes; planeIdx++) {
      const startIdx = planeIdx * particlesPerPlane;

      // Angular plane orientation (sharp cuts)
      const angleX = (Math.random() - 0.5) * Math.PI;
      const angleY = (Math.random() - 0.5) * Math.PI;
      // const angleZ = (Math.random() - 0.5) * Math.PI; // Reserved for future use

      // Plane center position
      const centerX = (Math.random() - 0.5) * 40;
      const centerY = (Math.random() - 0.5) * 30;
      const centerZ = (Math.random() - 0.5) * 40;

      for (let i = 0; i < particlesPerPlane && startIdx + i < particleCount; i++) {
        const i3 = (startIdx + i) * 3;

        // Create sharp rectangular plane segments
        const u = (Math.random() - 0.5) * 15; // Width
        const v = (Math.random() - 0.5) * 8;  // Height
        const w = Math.random() * 0.3;        // Thin depth

        // Apply angular rotations (crystalline hard edges)
        const rotatedX = u * Math.cos(angleY) - w * Math.sin(angleY);
        const rotatedZ = u * Math.sin(angleY) + w * Math.cos(angleY);
        const rotatedY = v * Math.cos(angleX) - rotatedZ * Math.sin(angleX);
        const finalZ = v * Math.sin(angleX) + rotatedZ * Math.cos(angleX);

        positions[i3] = centerX + rotatedX;
        positions[i3 + 1] = centerY + rotatedY;
        positions[i3 + 2] = centerZ + finalZ;

        // Aggressive streaming particle colors
        const distanceFromCenter = Math.sqrt(u * u + v * v) / 10;
        let color;

        if (distanceFromCenter < 0.2) {
          // Core
          color = colors.core;
        } else if (distanceFromCenter < 0.5) {
          // Mid
          color = colors.mid;
        } else if (distanceFromCenter < 0.8) {
          // Edge
          color = colors.edge;
        } else {
          // Far edge: outer to deep
          const blend = (distanceFromCenter - 0.8) / 0.2;
          color = {
            r: colors.outer.r * (1 - blend) + colors.deep.r * blend,
            g: colors.outer.g * (1 - blend) + colors.deep.g * blend,
            b: colors.outer.b * (1 - blend) + colors.deep.b * blend,
          };
        }

        baseColors[i3] = color.r;
        baseColors[i3 + 1] = color.g;
        baseColors[i3 + 2] = color.b;
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

    // Audio scaling (aggressive, sharp response)
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.6) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.5) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 1.0 : 0;

    // Violent streaming motion (aggressive particle streams)
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];

      // Sharp angular cuts (crystalline shattering motion)
      const cut1 = Math.sin(x * 0.15 + time * 2.5) * Math.cos(z * 0.12 + time * 2.0);
      const cut2 = Math.cos(y * 0.1 + time * 2.8) * Math.sin(x * 0.18 - time * 2.3);
      const cut3 = Math.sin(z * 0.2 - time * 2.0) * Math.cos(y * 0.14 + time * 2.6);

      const sharpMotion = (cut1 + cut2 + cut3) * 2.5 * bassScale;

      // Explosive dispersal (violent energy bursts)
      const distance = Math.sqrt(x * x + y * y + z * z);
      const explosivePulse = Math.sin(time * 3.0 - distance * 0.1) * 3.0 * highScale;

      // Fragmented streaming
      const streamDirection = Math.atan2(z, x);
      const streamPulse = Math.sin(streamDirection * 5 + time * 4.0) * 1.5 * midScale;

      pos[i] = x + sharpMotion + Math.cos(streamDirection) * streamPulse + explosivePulse * 0.3;
      pos[i + 1] = y + cut2 * 3.0 * bassScale + explosivePulse * 0.5;
      pos[i + 2] = z + sharpMotion + Math.sin(streamDirection) * streamPulse + explosivePulse * 0.3;

      // Intense concentration energy (sharp brightness pulses)
      const intensity = Math.sin(time * 5.0 + distance * 0.15) * 0.5 + 0.5;
      const brightness = 0.8 + (intensity * 0.5) + (highScale * 0.7);

      col[i] = Math.min(1.5, baseColors[i] * brightness);
      col[i + 1] = Math.min(1.5, baseColors[i + 1] * brightness);
      col[i + 2] = Math.min(1.5, baseColors[i + 2] * brightness);
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Aggressive rotation (sharp angular momentum)
    meshRef.current.rotation.y += 0.002 * params.speed * midScale;
    meshRef.current.rotation.x += 0.0015 * params.speed * bassScale;
    meshRef.current.rotation.z = Math.sin(time * 1.5) * 0.1;

    // Explosive breathing (intense pulse)
    const pulse = 1 + Math.sin(time * 2.0) * 0.08 * bassScale;
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
        size={0.05}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Export color presets for use in controls
export { COLOR_PRESETS };
