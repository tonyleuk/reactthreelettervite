import './App.css';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useState, useLayoutEffect } from 'react';
import { Environment, PresentationControls } from '@react-three/drei';
import ShakingGroup from './ShakingGroup';
import * as THREE from 'three';

function ResizeFix() {
  const { gl, camera } = useThree();

  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      gl.setSize(width, height, false);
      gl.setPixelRatio(dpr);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }

    updateSize();

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [gl, camera]);

  // Optional: Reset camera position on first touch for mobile fix
  useLayoutEffect(() => {
    function resetCameraOnTouch() {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.position.set(0, 0, 8);
        camera.updateProjectionMatrix();
      }
      window.removeEventListener('touchstart', resetCameraOnTouch);
    }

    window.addEventListener('touchstart', resetCameraOnTouch);
    return () => window.removeEventListener('touchstart', resetCameraOnTouch);
  }, [camera]);

  return null;
}



export default function App() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // Use null to block render initially

  useLayoutEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  

  if (isMobile === null) return null; // Avoid rendering until device check is complete

  const fov = isMobile ? 50 : 40;

  return (
    <div style={{ margin: '0 auto', width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: fov }}
        style={{ touchAction: 'none' }}
        shadows
      >
        <ResizeFix />
        <Suspense fallback={null}>
          <ambientLight intensity={3} />
          <PresentationControls
            global
            snap
            polar={[0, 0]}
            azimuth={[0, 0]}
          >
            <ShakingGroup />
          </PresentationControls>
          <Environment
            preset="apartment"
            environmentIntensity={0.25}
            background
            blur={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
