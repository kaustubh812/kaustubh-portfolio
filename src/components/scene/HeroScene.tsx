"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Phase 0 of the RAG-pipeline story: a slow drift-field of "tokens".
 * The uPhase uniform is the hook the scroll narrative will drive later
 * (0 = ambient field → 1..4 = shatter / embed / retrieve / assemble).
 */

const COUNT = 6500;

// Generated once at module load — render stays pure.
const PARTICLES = (() => {
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 2] = -2 - Math.random() * 14;
    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();
  }
  return { positions, seeds };
})();

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  attribute vec3 aSeed;
  varying float vMix;
  varying float vFade;

  void main() {
    vec3 p = position;

    // slow lateral drift, wrapped so the field never empties
    float drift = uTime * (0.25 + aSeed.x * 0.35);
    p.x = mod(p.x + drift + 30.0, 60.0) - 30.0;

    // gentle organic wobble
    p.y += sin(uTime * (0.3 + aSeed.y * 0.5) + aSeed.z * 6.2831) * 0.6;
    p.z += cos(uTime * (0.2 + aSeed.z * 0.4) + aSeed.x * 6.2831) * 0.4;

    vMix = aSeed.y;
    // fade particles near the horizontal edges of the wrap
    vFade = smoothstep(30.0, 24.0, abs(p.x));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + aSeed.z * 2.2) * (30.0 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  varying float vMix;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);

    vec3 violet = vec3(0.545, 0.486, 1.0);
    vec3 cyan   = vec3(0.404, 0.910, 0.976);
    vec3 color  = mix(violet, cyan, smoothstep(0.35, 0.95, vMix));

    gl_FragColor = vec4(color, soft * vFade * 0.62);
  }
`;

const UNIFORMS = { uTime: { value: 0 }, uPhase: { value: 0 } };

function Field({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame((state) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    const g = group.current;
    if (!reduced && g) {
      // parallax: move the field opposite the pointer instead of the camera
      g.position.x += (-mouse.current.x * 1.6 - g.position.x) * 0.03;
      g.position.y += (mouse.current.y * 1.0 - g.position.y) * 0.03;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[PARTICLES.positions, 3]}
          />
          <bufferAttribute attach="attributes-aSeed" args={[PARTICLES.seeds, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={mat}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={UNIFORMS}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        frameloop={visible && !reduced ? "always" : "never"}
      >
        <Field reduced={reduced} />
      </Canvas>
      {/* readability veil over the text side */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_25%_45%,rgba(8,8,13,0.72),transparent_65%)]" />
      {/* nebula glow over the open side of the frame */}
      <div className="absolute inset-0 bg-[radial-gradient(950px_650px_at_74%_32%,rgba(139,124,255,0.14),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(750px_550px_at_88%_82%,rgba(103,232,249,0.07),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
