import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface CreativeFlowProps {
  audioData: AudioData | null;
  params: VisualParams;
}

export const CreativeFlow: React.FC<CreativeFlowProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Organic flowing streams with playful color shifts
  const { positions, baseColors } = useMemo(() => {
    const particleCount = Math.floor(90000 * params.density);
    const positions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    // Creative playful color palette (imaginative, flowing)
    const dreamyPurple = { r: 0.6, g: 0.4, b: 0.8 };      // #9966cc
    const creativePink = { r: 0.95, g: 0.5, b: 0.7 };     // #f280b3
    const sunnyYellow = { r: 1.0, g: 0.85, b: 0.3 };      // #ffd94d
    const freshGreen = { r: 0.4, g: 0.85, b: 0.6 };       // #66d999
    const skyBlue = { r: 0.4, g: 0.75, b: 0.95 };         // #66bff2

    // Create organic flowing streams (playful curves)
    const numStreams = 16;
    const particlesPerStream = Math.floor(particleCount / numStreams);

    for (let streamIdx = 0; streamIdx < numStreams; streamIdx++) {
      const startIdx = streamIdx * particlesPerStream;

      // Stream path parameters (organic curves)
      const streamPhase = (streamIdx / numStreams) * Math.PI * 2;
      const streamAmplitude = 12 + Math.random() * 8;
      const streamFrequency = 0.8 + Math.random() * 0.6;
      const streamTwist = Math.random() * Math.PI;

      for (let i = 0; i < particlesPerStream && startIdx + i < particleCount; i++) {
        const i3 = (startIdx + i) * 3;

        // Parametric flow (organic curves)
        const t = i / particlesPerStream; // 0 to 1

        // Multi-dimensional sine waves (playful movement)
        const wave1 = Math.sin(t * Math.PI * streamFrequency * 3 + streamPhase);
        const wave2 = Math.cos(t * Math.PI * streamFrequency * 2 + streamTwist);
        const wave3 = Math.sin(t * Math.PI * streamFrequency * 4 + streamPhase * 0.5);

        // Stream ribbon width (flowing variation)
        const ribbonWidth = 2.0 + Math.sin(t * Math.PI * 2) * 1.0;
        const offsetU = (Math.random() - 0.5) * ribbonWidth;
        const offsetV = (Math.random() - 0.5) * 0.5;

        const x = wave1 * streamAmplitude + offsetU;
        const y = (t - 0.5) * 40 + wave2 * 8 + offsetV;
        const z = wave3 * streamAmplitude + offsetU * 0.7;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Playful color shifts (creative gradient)
        const colorPhase = (t + streamIdx * 0.2) % 1.0;
        let color;

        if (colorPhase < 0.2) {
          // Dreamy purple
          color = dreamyPurple;
        } else if (colorPhase < 0.4) {
          // Purple to pink
          const blend = (colorPhase - 0.2) / 0.2;
          color = {
            r: dreamyPurple.r * (1 - blend) + creativePink.r * blend,
            g: dreamyPurple.g * (1 - blend) + creativePink.g * blend,
            b: dreamyPurple.b * (1 - blend) + creativePink.b * blend,
          };
        } else if (colorPhase < 0.6) {
          // Pink to yellow
          const blend = (colorPhase - 0.4) / 0.2;
          color = {
            r: creativePink.r * (1 - blend) + sunnyYellow.r * blend,
            g: creativePink.g * (1 - blend) + sunnyYellow.g * blend,
            b: creativePink.b * (1 - blend) + sunnyYellow.b * blend,
          };
        } else if (colorPhase < 0.8) {
          // Yellow to green
          const blend = (colorPhase - 0.6) / 0.2;
          color = {
            r: sunnyYellow.r * (1 - blend) + freshGreen.r * blend,
            g: sunnyYellow.g * (1 - blend) + freshGreen.g * blend,
            b: sunnyYellow.b * (1 - blend) + freshGreen.b * blend,
          };
        } else {
          // Green to blue
          const blend = (colorPhase - 0.8) / 0.2;
          color = {
            r: freshGreen.r * (1 - blend) + skyBlue.r * blend,
            g: freshGreen.g * (1 - blend) + skyBlue.g * blend,
            b: freshGreen.b * (1 - blend) + skyBlue.b * blend,
          };
        }

        baseColors[i3] = color.r;
        baseColors[i3 + 1] = color.g;
        baseColors[i3 + 2] = color.b;
      }
    }

    return { positions, baseColors };
  }, [params.density]);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime() * params.speed;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;

    // Audio scaling (playful, creative response)
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.35) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.3) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 0.6 : 0;

    // Organic flowing motion (playful waves)
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];

      // Playful flow patterns (creative undulation)
      const flow1 = Math.sin(x * 0.1 + time * 1.2) * Math.cos(z * 0.08 + time * 1.0);
      const flow2 = Math.cos(y * 0.06 + time * 1.1) * Math.sin(x * 0.09 - time * 0.9);
      const flow3 = Math.sin(z * 0.11 - time * 1.0) * Math.cos(y * 0.07 + time * 1.15);

      const creativeFlow = (flow1 + flow2 + flow3) * 2.0 * bassScale;

      // Imaginative swirls (organic spirals)
      const angle = Math.atan2(z, x);
      const distance = Math.sqrt(x * x + z * z);
      const playfulSwirl = Math.sin(angle * 3 + time * 1.3 - distance * 0.06) * 1.5 * midScale;

      // Bouncy vertical motion (playful energy)
      const bouncePulse = Math.sin(time * 1.5 + distance * 0.07) * 1.2;

      pos[i] = x + creativeFlow + Math.cos(angle) * playfulSwirl;
      pos[i + 1] = y + bouncePulse * bassScale + flow2 * 2.0;
      pos[i + 2] = z + creativeFlow + Math.sin(angle) * playfulSwirl;

      // Playful color shifts (dynamic color cycling)
      const colorShift = Math.sin(time * 1.0 + distance * 0.05) * 0.3;
      const brightness = 0.9 + (Math.sin(time * 1.8 + distance * 0.08) * 0.5 + 0.5) * 0.4 + (highScale * 0.3);

      // Color cycling effect
      col[i] = Math.min(1.2, (baseColors[i] + colorShift * 0.2) * brightness);
      col[i + 1] = Math.min(1.2, (baseColors[i + 1] - colorShift * 0.1) * brightness);
      col[i + 2] = Math.min(1.2, (baseColors[i + 2] + colorShift * 0.15) * brightness);
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Playful rotation (organic spinning)
    meshRef.current.rotation.y += 0.0008 * params.speed * midScale;
    meshRef.current.rotation.x = Math.sin(time * 0.6) * 0.08;
    meshRef.current.rotation.z = Math.cos(time * 0.5) * 0.05;

    // Creative breathing (playful expansion)
    const breathe = 1 + Math.sin(time * 0.9) * 0.04 * bassScale;
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
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
