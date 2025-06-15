'use client';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { Suspense } from 'react';
import { PresentationControls, Environment, ContactShadows, useGLTF, SpotLight } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const App = () => {

    /* const gltf = useLoader(GLTFLoader, '/reactthreeletter/Letter.glb') */

    return (
        <div style={{ height: "100dvh" }}>
            <Canvas>
                <Suspense fallback={<span>Loading...</span>}>
                <ambientLight intensity={0.05} />
                <SpotLight position={[1, 2, 1]} angle={0.75} penumbra={1} shadow-mapSize={2048} castShadow />
                    <PresentationControls
                    global
                    config={{ mass: 1, tension: 100 }}
                    snap
                    rotation={[-0.1, 0.0, 0]}
                    polar={[-Math.PI / 1, Math.PI / 1]}
                    azimuth={[-Math.PI / 1, Math.PI / 1]}>
                        {/* <mesh
                        object={gltf.scene}
                        scale={3}
                        castShadow
                        receiveShadow
                        >
                            <meshBasicMaterial color="royalblue" />
                        </mesh>   */}    
                        {/* <primitive scale={3} object={gltf.scene} />    */}           
                    </PresentationControls>
                    <ContactShadows position={[0, -1.4, 0]} opacity={0.25} scale={10} blur={3} far={4} />
                </Suspense>
            </Canvas>
        </div>
    );
};


/* scale={isMobile ? 0.7 : 0.75}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
        object={gltf.scene} */


export default App;