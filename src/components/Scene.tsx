import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneProps {
  children: React.ReactNode;
}

export const Scene = ({ children }: SceneProps) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-gray-900">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#1a1a1a']} />
        
        <PerspectiveCamera makeDefault position={[10, 5, 10]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={20}
          target={[0, 2, 0]}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};
