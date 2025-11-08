import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AudioData, VisualParams } from '../types';

interface MoonlightParticlesProps {
  audioData: AudioData | null;
  params: VisualParams;
}

export const MoonlightParticles: React.FC<MoonlightParticlesProps> = ({ audioData, params }) => {
  const meshRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Particle count based on density
  const particleCount = useMemo(() => Math.floor(50000 * params.density), [params.density]);

  // Generate particles in 3D space
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spread particles in 3D space
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Moonlight colors - silver and pale blue
      const colorVariation = Math.random();
      if (colorVariation > 0.7) {
        // Pale blue highlights
        colors[i3] = 0.7 + Math.random() * 0.3;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 1.0;
      } else {
        // Silver/white
        const brightness = 0.6 + Math.random() * 0.4;
        colors[i3] = brightness;
        colors[i3 + 1] = brightness;
        colors[i3 + 2] = brightness * 1.1;
      }
    }

    return { positions, colors };
  }, [particleCount]);

  // Animation frame
  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    const time = state.clock.getElapsedTime() * params.speed;
    const positions = geometryRef.current.attributes.position.array as Float32Array;

    // Audio reactivity multipliers
    const bassScale = audioData ? 1 + (audioData.bass * params.audioReactivity * 0.5) : 1;
    const midScale = audioData ? 1 + (audioData.mid * params.audioReactivity * 0.3) : 1;
    const highScale = audioData ? audioData.high * params.audioReactivity * 2 : 0;

    // Wave distortion effect
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Original radius
      const radius = Math.sqrt(x * x + y * y + z * z);

      // Wave distortion (Refik Anadol style)
      const wave1 = Math.sin(x * 0.3 + time) * Math.cos(y * 0.2 + time * 0.7);
      const wave2 = Math.cos(z * 0.25 + time * 1.3) * Math.sin(y * 0.15 - time * 0.5);
      const waveDistortion = (wave1 + wave2) * 0.5 * bassScale;

      // Apply wave to radius
      const newRadius = radius + waveDistortion;

      // Recalculate positions with wave
      const theta = Math.atan2(y, x);
      const phi = Math.acos(z / radius);

      positions[i3] = newRadius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = newRadius * Math.cos(phi);
    }

    geometryRef.current.attributes.position.needsUpdate = true;

    // Rotate the entire mesh
    meshRef.current.rotation.y += 0.0005 * params.speed * midScale;
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

    // Scale pulse with audio
    const scale = 1 + (highScale * 0.05);
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
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
