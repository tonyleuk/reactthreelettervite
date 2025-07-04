import './App.css';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, PresentationControls } from '@react-three/drei';
import ShakingGroup from './ShakingGroup';

export default function App() {
  return (
    <div style={{ margin: '0 auto', width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} style={{ touchAction: 'none' }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <PresentationControls
            global
            snap
            polar={[0, 0, 0]} // Vertical limits
            azimuth={[0, 0, 0]} // Horizontal limits
            /* rotation={[0.2, 0, 0]} */
            /* polar={[-Math.PI * 0.05, Math.PI * 0.05]} // Vertical limits
            azimuth={[-Math.PI * 0.1, Math.PI * 0.1]} // Horizontal limits */
          >
            <ShakingGroup />
          </PresentationControls>
          <Environment preset="apartment" background blur={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
