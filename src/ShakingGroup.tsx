import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSpring, a, useSpringRef, useChain, easings } from '@react-spring/three'; // 3D animations
import { Html, useCursor, Text } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import cormorantFont from './fonts/cormorant-v24-latin-700.woff'

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

  // envelope flap rotation
  const rotateSpring = useSpring({
    ref: rotateRef,
    from: { rotation: [Math.PI * 0, 0, 0] as [number, number, number] },
    to: { rotation: [Math.PI * 1.1, 0, 0] as [number, number, number] },
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // envelope body move down
  const downSpring = useSpring({
    ref: downRef,
    from: { position: [0, 0, 0] as [number, number, number] },
    to: { position: [0, -3.5, -.05] as [number, number, number] },
    config: { mass: 1, tension: 100, friction: 10 },
  });

  /* // envelope scale correction
  const scaleSpring = useSpring({
    ref: scaleRef,
    from: { scale: [1, 0.6, 1] as [number, number, number] },
    to: { scale: [1, 1, 1] as [number, number, number] },
    config: { duration: 100 },
  }); */

  // letter rising out (animate Y only)
  const upSpring = useSpring({
    ref: upRef,
    from: { position: [0, 0, 0.05], scale: [1, 0.5, 1] as [number, number, number] },
    to: { position: [0, 1, -.05], scale: [1, 1, 1] as [number, number, number] }, 
    /* config: { mass: .5, tension: 1200, friction: 200 }, */
    config: { duration: 500, easing: easings.easeOutCubic }
  });

  // backflip
  const flipRef = useSpringRef();
  const flipSpring = useSpring({
    ref: flipRef,
    from: { rotation: [0, 0, 0] as [number, number, number] },
    to: { rotation: [0, Math.PI, 0] as [number, number, number] },
    config: { mass: 4, tension: 80, friction: 24 },
  });

  // confetti
  const triggerGoldConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 250,
      origin: { y: 0.15 },
      colors: ['#FFD700', '#FFC700', '#FFB800'],
      gravity: 1.2,
      scalar: 1.2,
      ticks: 300,
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

  useChain(stopped ? [flipRef, rotateRef, scaleRef, downRef, upRef] : [], [0.1, .6, 0.7, 0.8, 0.8]);

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

  const [name, setName] = useState<string | null>('Guest');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('n');
    setName(urlName || 'Guest');
  }, []);
  if (!name) return null;

  /* const minSize = 1;
  const maxSize = 1;
  const minChars = 8;
  const maxChars = 16;
  const length = Math.min(Math.max(name.length, minChars), maxChars);
  const t = (maxChars - length) / (maxChars - minChars); */
  /* const fontSize = minSize + (maxSize - minSize) * t; */

  // ✨ main render
  return (
    <a.group
      /* ref={groupRef} */
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, 1.5, 0]}
      {...flipSpring as any}
    >
      {/* Envelope Body */}
      <a.group 
        scale={[3.5, 3.5, 5]} 
        {...(downSpring as any)}
      >
        <primitive object={gltf.scene} castShadow receiveShadow />
      </a.group>

      {/* Envelope Flap */}
      <a.group 
      scale={[3.5, 3.5, 5]} {...(rotateSpring as any)} {...(downSpring as any)}>
        <primitive object={gltf2.scene} castShadow receiveShadow />
      </a.group>

      {/* Letter rising out */}
      <a.group 
        {...upSpring as any}
        rotation={[0, Math.PI, 0]}
        /* {...scaleSpring} */
      >
        <primitive
          position={[0, 0, 0.01]}
          scale={[3.25, 3.25, 3.25]}
          rotation={[0,0,0]}
          object={lettergltf.scene}
          castShadow
          receiveShadow
        />

        {/* HTML Letter Text */}
        <Html
          scale={.8} // smaller = fits within letter nicely
          position={[0, -3.71, 0.025]} // keep it just above the letter surface
          /* transform */
          
          occlude
          style={{ color: '#414141',
            backgroundColor: 'rgba(255,255,255,0.01)', // tiny alpha, but stops inversion
            filter: 'none',
            mixBlendMode: 'normal',
            WebkitTextFillColor: '#414141',
            transform: 'translate(-50%, -50%)',
            /* position: 'absolute',
            width: '480px',  
            height: '160px',  
            left: '50%',
            top: '50%', */
           }}
        >
      <div
        style={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          height: '80vh', 
          width: '100vw', 
          overflow: 'hidden',
          WebkitTextFillColor: '#414141',
          color: '#414141',
          textAlign: 'center',
        }}
      >
    {/* Inner content reveals upward */}
    <div
      style={{
          WebkitTextFillColor: '#414141',
          color: '#414141'
        }}
    >
      <h3 style={{
        lineHeight: '0px',
        WebkitTextFillColor: '#414141',
        color: '#414141',
        textDecoration: 'none',
        transition: 'color 0.3s ease', // smooth fade
      }}><strong> <span className="gold-gradient">Kathy & Leon </span></strong></h3>
      <h2 style={{ lineHeight: '2.5vh', WebkitTextFillColor: '#414141', color: '#414141' }}>
        <br />
        would love to invite you to
        <br />
        celebrate their registry wedding at
        <br />
      </h2>
      <h1 style={{
        lineHeight: '4.2vh',
        
        color: '#414141',
        WebkitTextFillColor: '#414141',
        textDecoration: 'none',
        transition: 'color 0.3s ease', // smooth fade
      }}
      > Old Marylebone Town Hall</h1>
      <h1 style={{
        lineHeight: '2vh',
        /* cursor: 'pointer', */
        color: '#414141',
        WebkitTextFillColor: '#414141',
        textDecoration: 'none',
        transition: 'color 0.3s ease', // smooth fade
      }}
      >May 9th, 2026 | Saturday<br /></h1>
      <h2 style={{ lineHeight: '2.2vh', color: '#414141', WebkitTextFillColor: '#414141', }}>
        Guests to be seated 16:45
        <br /> Ceremony starts at 17:00
      </h2>
      <h2 style={{ lineHeight: '1.8vh', color: '#414141', WebkitTextFillColor: '#414141', }}>
        <br /><br />
        Dinner and drinks to follow at
      </h2>
      <h1 style={{
        lineHeight: '.8vh',
        color: '#414141',
        WebkitTextFillColor: '#414141',
        textDecoration: 'none',
        transition: 'color 0.3s ease', // smooth fade
      }}
      >The Pilgrim Hotel Paddington<br /></h1>
      <h2 style={{ lineHeight: '1.8vh', color: '#414141', WebkitTextFillColor: '#414141', }}>
        at 18:00
        <br/>
        <br/>
        RSVP by March 9th 2026
      </h2>
      <h5 style={{
        color: '#414141',
        WebkitTextFillColor: '#414141',
      lineHeight: '.9vh',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'color 0.3s ease', // smooth fade
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#C1AA66'; // gold on hover ✨ color: rgb(137, 126, 83)
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = '#414141'; 
    }}
  onClick={() => {
    triggerGoldConfetti();
    setTimeout(() => {
      window.open('https://withjoy.com/kathy-and-leon', '_blank');
    }, 400);
  }}>
        <br /><br />
        More details on our wedding website
      </h5>
    </div>
  </div>
</Html>
<Text
  position={[0, -2.5, -.01]}       // same position in your scene
  rotation={[0, Math.PI, 0]}     // flips it to face the same direction
  scale={[1, 2, 1]}              // keeps your same stretch
  color="#414141"                // text color
  fontSize={0.175}                // adjust to match your desired visual size
  font={cormorantFont}
  anchorX="center"               // centers horizontally
  anchorY="middle"               // centers vertically
  textAlign="center"             // centers text content
  maxWidth={2}                   // optional wrapping width
>
  {name}
  <meshBasicMaterial color="#414141" />
</Text>
      </a.group>
    </a.group>
  );
}