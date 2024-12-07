import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

interface WaveformProps {
  audioData: Uint8Array;
}

const Waveform = ({ audioData }: WaveformProps) => {
  const points = useRef<THREE.Points>(null);

  useFrame(() => {
    if (points.current) {
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < audioData.length; i++) {
        const amplitude = audioData[i] / 255;
        positions[i * 3 + 1] = amplitude * 2;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(audioData.length * 3);
  const colors = new Float32Array(audioData.length * 3);

  for (let i = 0; i < audioData.length; i++) {
    positions[i * 3] = (i / audioData.length) * 4 - 2;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    colors[i * 3] = 0.4;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 0.85;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

interface WaveformVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioRef, className }) => {
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    
    analyzerRef.current = analyzer;

    const updateData = () => {
      const data = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(data);
      setAudioData(data);
      animationFrameRef.current = requestAnimationFrame(updateData);
    };

    updateData();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [audioRef]);

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <Waveform audioData={audioData} />
      </Canvas>
    </div>
  );
};

export default WaveformVisualizer;