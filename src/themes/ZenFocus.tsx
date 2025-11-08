import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface ZenFocusProps {
  audioData: AudioData | null;
  params: VisualParams;
}

export const ZenFocus: React.FC<ZenFocusProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Smooth flowing particle mesh with elegant curved ribbons
  const { positions, baseColors } = useMemo(() => {
    const particleCount = Math.floor(85000 * params.density);
    const positions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    // Calm meditative color palette (elegant, peaceful)
    const deepZen = { r: 0.15, g: 0.2, b: 0.3 };          // #263346
    const peacefulTeal = { r: 0.3, g: 0.6, b: 0.65 };     // #4d99a6
    const softAqua = { r: 0.5, g: 0.8, b: 0.85 };         // #80ccd9
    const gentleWhite = { r: 0.9, g: 0.95, b: 0.98 };     // #e6f2fa
    const calmLavender = { r: 0.7, g: 0.75, b: 0.85 };    // #b3bfd9

    // Create graceful spiral ribbons (smooth undulating forms)
    const numRibbons = 12;
    const particlesPerRibbon = Math.floor(particleCount / numRibbons);

    for (let ribbonIdx = 0; ribbonIdx < numRibbons; ribbonIdx++) {
      const startIdx = ribbonIdx * particlesPerRibbon;

      // Gentle spiral parameters
      const spiralPhase = (ribbonIdx / numRibbons) * Math.PI * 2;
      const spiralRadius = 15 + ribbonIdx * 1.5;
      const spiralHeight = 25;

      for (let i = 0; i < particlesPerRibbon && startIdx + i < particleCount; i++) {
        const i3 = (startIdx + i) * 3;

        // Smooth parametric curve (elegant flowing ribbons)
        const t = i / particlesPerRibbon; // 0 to 1
        const angle = spiralPhase + t * Math.PI * 4; // Graceful spiral

        // Soft dissolving edges (translucent layering)
        const ribbonWidth = 3.0 * (1 - Math.abs(t - 0.5) * 0.5);
        const offsetU = (Math.random() - 0.5) * ribbonWidth;
        const offsetV = (Math.random() - 0.5) * 0.8;

        const x = (spiralRadius + offsetU) * Math.cos(angle);
        const y = (t - 0.5) * spiralHeight + offsetV;
        const z = (spiralRadius + offsetU) * Math.sin(angle);

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Gentle undulating color gradient (calm aesthetic)
        const colorPhase = t + ribbonIdx * 0.1;
        let color;

        if (colorPhase < 0.2) {
          color = deepZen;
        } else if (colorPhase < 0.4) {
          const blend = (colorPhase - 0.2) / 0.2;
          color = {
            r: deepZen.r * (1 - blend) + peacefulTeal.r * blend,
            g: deepZen.g * (1 - blend) + peacefulTeal.g * blend,
            b: deepZen.b * (1 - blend) + peacefulTeal.b * blend,
          };
        } else if (colorPhase < 0.6) {
          const blend = (colorPhase - 0.4) / 0.2;
          color = {
            r: peacefulTeal.r * (1 - blend) + softAqua.r * blend,
            g: peacefulTeal.g * (1 - blend) + softAqua.g * blend,
            b: peacefulTeal.b * (1 - blend) + softAqua.b * blend,
          };
        } else if (colorPhase < 0.8) {
          const blend = (colorPhase - 0.6) / 0.2;
          color = {
            r: softAqua.r * (1 - blend) + calmLavender.r * blend,
            g: softAqua.g * (1 - blend) + calmLavender.g * blend,
            b: softAqua.b * (1 - blend) + calmLavender.b * blend,
          };
        } else {
          const blend = (colorPhase - 0.8) / 0.2;
          color = {
            r: calmLavender.r * (1 - blend) + gentleWhite.r * blend,
            g: calmLavender.g * (1 - blend) + gentleWhite.g * blend,
            b: calmLavender.b * (1 - blend) + gentleWhite.b * blend,
          };
        }

        // Soft edge fade
        const edgeFade = 1 - Math.abs(offsetU) / ribbonWidth;
        baseColors[i3] = color.r * edgeFade;
        baseColors[i3 + 1] = color.g * edgeFade;
        baseColors[i3 + 2] = color.b * edgeFade;
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

    // Audio scaling (gentle, meditative response)
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.2) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.18) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 0.4 : 0;

    // Gentle undulating motion (calm elegant curves)
    for (let i = 0; i < pos.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const z = basePositions[i + 2];

      // Smooth flowing waves (meditative gentle motion)
      const flow1 = Math.sin(x * 0.08 + time * 0.5) * Math.cos(z * 0.06 + time * 0.4);
      const flow2 = Math.cos(y * 0.05 + time * 0.45) * Math.sin(x * 0.07 - time * 0.35);
      const flow3 = Math.sin(z * 0.09 - time * 0.4) * Math.cos(y * 0.06 + time * 0.5);

      const gentleFlow = (flow1 + flow2 + flow3) * 1.2 * bassScale;

      // Elegant spiral motion (graceful curves)
      const angle = Math.atan2(z, x);
      const radius = Math.sqrt(x * x + z * z);
      const spiralWave = Math.sin(angle * 3 + time * 0.6 - radius * 0.05) * 0.8 * midScale;

      // Translucent layering (soft vertical drift)
      const verticalDrift = Math.sin(time * 0.3 + radius * 0.08) * 0.6;

      pos[i] = x + gentleFlow + Math.cos(angle) * spiralWave;
      pos[i + 1] = y + verticalDrift * bassScale + flow2 * 1.0;
      pos[i + 2] = z + gentleFlow + Math.sin(angle) * spiralWave;

      // Calm peaceful glow (soft brightness)
      const glowPulse = Math.sin(time * 0.4 + radius * 0.06) * 0.5 + 0.5;
      const brightness = 0.85 + (glowPulse * 0.25) + (highScale * 0.2);

      col[i] = Math.min(1, baseColors[i] * brightness);
      col[i + 1] = Math.min(1, baseColors[i + 1] * brightness);
      col[i + 2] = Math.min(1, baseColors[i + 2] * brightness);
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    // Gentle rotation (meditative flow)
    meshRef.current.rotation.y += 0.0002 * params.speed * midScale;
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;

    // Calm breathing (peaceful expansion)
    const breathe = 1 + Math.sin(time * 0.35) * 0.015 * bassScale;
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
