"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

interface ParrotSceneProps {
  talking: boolean;
  stage: "landing" | "setup" | "shuffle" | "reveal" | "results";
  className?: string;
}

function Parrot({ talking, stage }: { talking: boolean; stage: ParrotSceneProps["stage"] }) {
  const groupRef = useRef<Group>(null);
  const beakRef = useRef<Mesh>(null);
  const wingLRef = useRef<Mesh>(null);
  const wingRRef = useRef<Mesh>(null);
  const walkTarget = useMemo(() => (stage === "landing" ? -0.4 : 0), [stage]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = groupRef.current;
    if (!g) return;
    g.position.x += (walkTarget - g.position.x) * Math.min(1, delta * 2.4);
    g.position.y = 0.12 + Math.sin(t * 2.3) * 0.03;
    g.rotation.y = Math.sin(t * 0.8) * 0.08;
    if (beakRef.current) {
      const flap = talking ? 0.62 + Math.abs(Math.sin(t * 18)) * 0.6 : 0.7;
      beakRef.current.scale.y = flap;
    }
    if (wingLRef.current && wingRRef.current) {
      const lift = talking ? Math.sin(t * 8) * 0.15 : Math.sin(t * 2) * 0.04;
      wingLRef.current.rotation.z = -0.24 + lift;
      wingRRef.current.rotation.z = 0.24 - lift;
    }
  });

  return (
    <group ref={groupRef} position={[-2.3, 0.1, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.36, 20, 20]} />
        <meshStandardMaterial color="#22c55e" roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshStandardMaterial color="#16a34a" roughness={0.2} />
      </mesh>
      <mesh ref={beakRef} position={[0, 0.98, 0.25]}>
        <coneGeometry args={[0.08, 0.2, 10]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh ref={wingLRef} position={[-0.4, 0.62, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      <mesh ref={wingRRef} position={[0.4, 0.62, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      <mesh position={[0, 0.24, -0.18]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.08, 0.4, 10]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
    </group>
  );
}

function TempleFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#241f22" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.8, 0.24, 1.2]} />
        <meshStandardMaterial color="#422f24" roughness={0.7} />
      </mesh>
    </>
  );
}

export function ParrotScene({ talking, stage, className = "" }: ParrotSceneProps) {
  const [canWebgl, setCanWebgl] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ok = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setCanWebgl(ok);
    } catch {
      setCanWebgl(false);
    }
  }, []);

  if (!canWebgl) {
    return (
      <div
        className={`relative h-full min-h-[240px] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 ${className}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-6xl">🦜</div>
          <p className="mt-3 text-sm text-amber-100/90">3D unavailable. 2D fallback active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full min-h-[240px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/25 ${className}`}>
      <Canvas camera={{ position: [0, 1.8, 3.8], fov: 44 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 3]} intensity={1.2} color="#fef3c7" />
        <pointLight position={[-3, 2, 1]} intensity={0.7} color="#f97316" />
        <Parrot talking={talking} stage={stage} />
        <TempleFloor />
        <Environment preset="sunset" />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.65} minPolarAngle={1.15} />
      </Canvas>
    </div>
  );
}
