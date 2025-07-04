import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSpring, a, useSpringRef, useChain } from '@react-spring/three';
import { Html, useCursor } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

import EnvelopeUrl from './assets/Envelope.glb?url';
import EnvelopeFlapUrl from './assets/EnvelopeFlap.glb?url';
import LetterUrl from './assets/Letter.glb?url';

export default function ShakingGroup() {
  const gltf = useLoader(GLTFLoader, EnvelopeUrl);
  const gltf2 = useLoader(GLTFLoader, EnvelopeFlapUrl);
  const lettergltf = useLoader(GLTFLoader, LetterUrl);

  const groupRef = useRef<THREE.Group>(null);

  const [shaking, setShaking] = useState(true);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const stoppedRef = useRef(false);

  useCursor(hovered);

  const rotateRef = useSpringRef();
  const downRef = useSpringRef();
  const scaleRef = useSpringRef();
  const upRef = useSpringRef();

  const rotateSpring = useSpring({
    ref: rotateRef,
    from: { rotation: [Math.PI * 0.68, 0, 0] as [number, number, number] },
    to: { rotation: [-Math.PI * 0.35, 0, 0] as [number, number, number] },
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const downSpring = useSpring({
    ref: downRef,
    from: { position: [0, 0, 0] as [number, number, number] },
    to: { position: [0, -2.2, 0] as [number, number, number] },
    config: { mass: 4, tension: 100, friction: 26 },
  });

  const scaleSpring = useSpring({
    ref: scaleRef,
    from: { scale: [1, 0.8, 1] as [number, number, number] },
    to: { scale: [1, 1, 1] as [number, number, number] },
    config: { duration: 100 },
  });

  const upSpring = useSpring({
    ref: upRef,
    from: { position: [0, -0.05, 0.001] as [number, number, number] },
    to: { position: [0, 1.15, 0.01] as [number, number, number] },
    config: { mass: 4, tension: 450, friction: 32 },
  });

  const triggerGoldConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFC700', '#FFB800'],
      gravity: 0.3,
      scalar: 1.2,
      ticks: 200,
      shapes: ['square', 'circle'],
    });
  };

  const stopShaking = () => {
    if (!stoppedRef.current) {
      stoppedRef.current = true;
      setShaking(false);
      setStopped(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(stopShaking, 3000);
    return () => clearTimeout(timer);
  }, []);

  useChain(stopped ? [rotateRef, scaleRef, downRef, upRef] : [], [0, 0.5, 0.5, 0.5]);

  const confettiCalledRef = useRef(false);
  useEffect(() => {
    if (stopped && !confettiCalledRef.current) {
      triggerGoldConfetti();
      confettiCalledRef.current = true;
    }
  }, [stopped]);

  const handleClick = () => stopShaking();

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const interpolateRotation = (t: number): number => {
    if (t < 0.25) return lerp(0, 5, t / 0.25);
    else if (t < 0.5) return lerp(5, 0, (t - 0.25) / 0.25);
    else if (t < 0.75) return lerp(0, -5, (t - 0.5) / 0.25);
    else return lerp(-5, 0, (t - 0.75) / 0.25);
  };

  const shakeDuration = 350;
  const totalCycle = shakeDuration;
  const startTimeRef = useRef(performance.now());

  useFrame(() => {
    if (!groupRef.current) return;

    if (!shaking) {
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) % totalCycle;

    if (elapsed < shakeDuration) {
      const t = elapsed / shakeDuration;
      const rotationZDegrees = interpolateRotation(t);
      groupRef.current.rotation.z = (rotationZDegrees * Math.PI) / 180;
    } else {
      groupRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <a.group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, 1.25, 0]}
      {...scaleSpring}
    >
      <a.group scale={[3.5, 6, 5]} {...(downSpring as any)}>
        <primitive object={gltf.scene} castShadow receiveShadow />
      </a.group>

      <a.group scale={[3.5, 6, 5]} {...(rotateSpring as any)} {...(downSpring as any)}>
        <primitive object={gltf2.scene} castShadow receiveShadow />
      </a.group>

      <a.group {...(upSpring as any)}>
        <primitive scale={3.25} object={lettergltf.scene} castShadow receiveShadow />
        <Html scale={1} position={[0, -2.25, 0.01]} transform occlude>
          <div>
            <h1>Hello Bob, join us on</h1>
            <h2>
              May 9th 2026 <br />
              London
            </h2>
            <h3>Kathy & Leon</h3>
            <button className="button-38" onClick={triggerGoldConfetti}>
              Celebrate
            </button>
          </div>
        </Html>
      </a.group>
    </a.group>
  );
}
