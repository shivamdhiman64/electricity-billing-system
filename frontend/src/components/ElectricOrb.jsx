// ElectricOrb.jsx - 3D Animated Electricity Orb for Login Page
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Floating particles component
function Particles({ count = 80 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f5ff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Main electric sphere
function ElectricSphere() {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -clock.elapsedTime * 0.15;
      innerRef.current.rotation.y = -clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      {/* Outer glow sphere */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#0080ff"
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0}
          metalness={0.8}
          transparent
          opacity={0.7}
          emissive="#00f5ff"
          emissiveIntensity={0.3}
        />
      </Sphere>
      {/* Inner core */}
      <Sphere ref={innerRef} args={[0.9, 32, 32]}>
        <MeshDistortMaterial
          color="#00f5ff"
          attach="material"
          distort={0.6}
          speed={5}
          roughness={0}
          transparent
          opacity={0.9}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </Sphere>
      {/* Energy rings */}
      {[1.8, 2.1, 2.4].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2 * i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[r, 0.02, 8, 100]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={1}
            transparent
            opacity={0.4 - i * 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ElectricOrb() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} color="#00f5ff" intensity={3} distance={10} />
        <pointLight position={[5, 5, 5]} color="#0080ff" intensity={2} />
        <ElectricSphere />
        <Particles count={120} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        <fog attach="fog" args={['#020817', 8, 20]} />
      </Canvas>
    </div>
  );
}
