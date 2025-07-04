import './App.css';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, PresentationControls } from '@react-three/drei';
import ShakingGroup from './ShakingGroup';

export default function App() {
  return (
    <div style={{ margin: '0 auto', width: '100%', height: '100vh' }}>
      <Canvas flat>
        <Suspense fallback={null}>
          <ambientLight intensity={2} />
          <PresentationControls
            global
            snap
            rotation={[0.2, 0, 0]}
            polar={[-Math.PI, Math.PI * 0.75]}
            azimuth={[-Math.PI, Math.PI]}
          >
            <ShakingGroup />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
