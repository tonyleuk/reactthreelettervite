import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSpring, a, useSpringRef, useChain } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import confetti from 'canvas-confetti';

import EnvelopeUrl from './assets/Envelope.glb?url';
import EnvelopeFlapUrl from './assets/EnvelopeFlap.glb?url';
import LetterUrl from './assets/Letter.glb?url';

export default function ShakingGroup() {
  const gltf = useLoader(GLTFLoader, EnvelopeUrl);
  const gltf2 = useLoader(GLTFLoader, EnvelopeFlapUrl);
  const lettergltf = useLoader(GLTFLoader, LetterUrl);

  const groupRef = useRef();

  // Control shaking & stopping
  const [shaking, setShaking] = useState(true);
  const [stopped, setStopped] = useState(false);
  const stoppedRef = useRef(false);

  // Springs refs for useChain
  const rotateRef = useSpringRef();
  const downRef = useSpringRef();
  const scaleRef = useSpringRef();
  const upRef = useSpringRef();

  const rotateSpring = useSpring({
    ref: rotateRef,
    from: { rotation: [Math.PI * 0.68, 0, 0] },
    to: { rotation: [-Math.PI * 0.35, 0, 0] },
    config: { mass: 1, tension: 170, friction: 26, },
  });

  const downSpring = useSpring({
    ref: downRef,
    from: { position: [0, 0, 0]/* , scale: [1, 0.5, 1] */ },
    to: { position: [0, -4, 0]/* , scale: [1, 1, 1] */ },
    config: { mass: 4, tension: 100, friction: 26, },
  });

  const scaleSpring = useSpring({
    ref: scaleRef,
    from: { scale: [1, 0.8, 1] },
    to: { scale: [1, 1, 1] },
    config: { duration: 100},
  });

  const upSpring = useSpring({
    ref: upRef,
    from: { position: [0, -0.05, 0.001]/* , scale: [1, 0.5, 1] */ },
    to: { position: [0, 1.1, 0.01]/* , scale: [1, 1, 1] */ },
    config: { mass: 4, tension: 450, friction: 32, },
  });

  // Gold confetti trigger using canvas-confetti
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

  // Handle stopping shaking (called by timer or click)
  const stopShaking = () => {
    if (!stoppedRef.current) {
      stoppedRef.current = true;
      setShaking(false);
      setStopped(true);
    }
  };

  // Stop shaking after 2 seconds
  useEffect(() => {
    const timer = setTimeout(stopShaking, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sequence animation only after shaking stops
  useChain(stopped ? [rotateRef, scaleRef, downRef, upRef] : [], [0, 0.5, .5, .5]);

  // Trigger confetti only once after shaking stops
  const confettiCalledRef = useRef(false);
  useEffect(() => {
    if (stopped && !confettiCalledRef.current) {
      triggerGoldConfetti();
      confettiCalledRef.current = true;
    }
  }, [stopped]);

  // Click handler to stop shaking early
  const handleClick = () => {
    stopShaking();
  };

  // Rotation interpolation for smooth shake (your pattern)
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function interpolateRotation(t) {
    if (t < 0.25) return lerp(0, 5, t / 0.25);
    else if (t < 0.5) return lerp(5, 0, (t - 0.25) / 0.25);
    else if (t < 0.75) return lerp(0, -5, (t - 0.5) / 0.25);
    else return lerp(-5, 0, (t - 0.75) / 0.25);
  }

  const shakeDuration = 350; // ms
  const restDuration = 0; // ms
  const totalCycle = shakeDuration + restDuration;
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
    <a.group ref={groupRef} onClick={handleClick} position={[0, 1.25, 0]} style={{ cursor: 'pointer' }} {...scaleSpring}>
      <a.primitive scale={[2.5,5,5]} object={gltf.scene} castShadow receiveShadow {...downSpring} />
      <a.primitive scale={[2.5,5,5]} object={gltf2.scene} castShadow receiveShadow {...rotateSpring} {...downSpring} />
      <a.group {...upSpring} >
        <a.primitive scale={2.35} object={lettergltf.scene} castShadow receiveShadow />
        <Html scale={1} position={[0, -1.66, 0.01]} transform occlude>
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
