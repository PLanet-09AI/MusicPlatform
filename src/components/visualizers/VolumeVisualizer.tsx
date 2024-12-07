import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

interface VolumeBarProps {
  height: number;
  position: [number, number, number];
}

const VolumeBar = ({ height, position }: VolumeBarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        height,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.1, 1, 0.1]} />
      <meshStandardMaterial color="#64FFDA" />
    </mesh>
  );
};

interface VolumeVisualizerProps {
  volume: number;
  className?: string;
}

const VolumeVisualizer: React.FC<VolumeVisualizerProps> = ({ volume, className }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {Array.from({ length: 5 }).map((_, i) => (
            <VolumeBar
              key={i}
              height={Math.min(1, volume * (1 + i * 0.2))}
              position={[-0.5 + i * 0.25, 0, 0]}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default VolumeVisualizer;