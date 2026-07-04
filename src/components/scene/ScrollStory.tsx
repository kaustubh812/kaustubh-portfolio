"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The signature piece: scroll drives a query through a RAG pipeline.
 * uP runs 0→4 across the pinned section:
 *   0→0.35 documents hold (they must READ as documents first)
 *   0.35→1.15 paragraphs tear off as chunk tiles
 *   1.15→2  chunks embed into vector-space clusters
 *   2→3  a query streaks in; its cluster stays lit while the rest dim
 *   3→4  retrieved chunks settle into a thin answer beam, the rest fade
 *
 * Two compositions: landscape (wide page row, wide cluster ring) and
 * portrait (2×2 page grid, vertical cluster ring, beam below the text).
 */

const COUNT = 12000;
const CLUSTERS = 7;
const RELEVANT = 3;

type Mode = "landscape" | "portrait";

type SceneData = {
  posDoc: Float32Array;
  posChunk: Float32Array;
  posCloud: Float32Array;
  posLine: Float32Array;
  seed: Float32Array;
  flag: Float32Array;
  relevantCenter: THREE.Vector3;
  queryFrom: THREE.Vector3;
};

const LAYOUT = {
  landscape: {
    pages: 5,
    pageW: 2.7,
    pageH: 3.6,
    pagePos: (p: number) => ({ x: (p - 2) * 3.4, y: 0.4 }),
    relevantCenter: new THREE.Vector3(1.6, 0.1, 0.8),
    ringCenter: (th: number, c: number) =>
      new THREE.Vector3(
        Math.cos(th) * 5.4,
        Math.sin(c * 2.1) * 2.4,
        -2.5 - Math.sin(th) * 1.8
      ),
    beam: { halfWidth: 5.5, y: -1.55 },
    queryFrom: new THREE.Vector3(11, 4.5, 4),
  },
  portrait: {
    pages: 4,
    pageW: 1.9,
    pageH: 2.5,
    pagePos: (p: number) => ({
      x: p % 2 === 0 ? -1.15 : 1.15,
      y: p < 2 ? 2.0 : -1.4,
    }),
    relevantCenter: new THREE.Vector3(0.4, 0.7, 0.8),
    ringCenter: (th: number, c: number) =>
      new THREE.Vector3(
        Math.cos(th) * 1.55,
        Math.sin(c * 2.1) * 3.0,
        -2.5 - Math.sin(th) * 1.8
      ),
    beam: { halfWidth: 2.3, y: -2.95 },
    queryFrom: new THREE.Vector3(3.5, 6.5, 4),
  },
} as const;

const dataCache: Partial<Record<Mode, SceneData>> = {};

function getData(mode: Mode): SceneData {
  const cached = dataCache[mode];
  if (cached) return cached;

  const L = LAYOUT[mode];
  const posDoc = new Float32Array(COUNT * 3);
  const posChunk = new Float32Array(COUNT * 3);
  const posCloud = new Float32Array(COUNT * 3);
  const posLine = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const flag = new Float32Array(COUNT * 3); // x relevant, y color mix, z beam member

  const LINES = 20;
  const PARA = 4;

  // deterministic per-line lengths; paragraph-final lines run short
  const lineLen: number[][] = [];
  const paraCluster: number[][] = [];
  for (let p = 0; p < L.pages; p++) {
    lineLen.push(
      Array.from({ length: LINES }, (_, l) =>
        (l % PARA === PARA - 1
          ? 0.35 + Math.random() * 0.35
          : 0.6 + Math.random() * 0.4) * L.pageW
      )
    );
    paraCluster.push(
      Array.from({ length: LINES / PARA }, () =>
        Math.floor(Math.random() * CLUSTERS)
      )
    );
  }

  const centers: THREE.Vector3[] = [];
  for (let c = 0; c < CLUSTERS; c++) {
    centers.push(
      c === RELEVANT
        ? L.relevantCenter.clone()
        : L.ringCenter((c / CLUSTERS) * Math.PI * 2, c)
    );
  }

  const lineGap = L.pageH / (LINES + (LINES / PARA) * 0.9);
  const paraGap = lineGap * 0.9;

  for (let i = 0; i < COUNT; i++) {
    // interleaved so a reduced drawRange thins every page uniformly
    const page = i % L.pages;
    const line = Math.floor(Math.random() * LINES);
    const para = Math.floor(line / PARA);
    const t = Math.random();

    const { x: cx, y: cy } = L.pagePos(page);
    const pageTop = cy + L.pageH / 2;
    const len = lineLen[page][line];
    const x = cx - L.pageW / 2 + t * len + (Math.random() - 0.5) * 0.03;
    const y =
      pageTop - line * lineGap - para * paraGap + (Math.random() - 0.5) * 0.035;
    const z = (Math.random() - 0.5) * 0.04;
    posDoc[i * 3] = x;
    posDoc[i * 3 + 1] = y;
    posDoc[i * 3 + 2] = z;

    // chunk = the paragraph tile tearing away from its page
    const paraCy = pageTop - (para * PARA + PARA / 2) * lineGap - para * paraGap;
    const dirX = (cx === 0 ? 0.4 : cx * 0.22) + (Math.random() - 0.5) * 0.8;
    const dirY = (paraCy - cy) * 0.55 + (Math.random() - 0.5) * 0.8;
    const mag = 1.0 + Math.random() * 0.7;
    posChunk[i * 3] = x + dirX * mag * 0.35;
    posChunk[i * 3 + 1] = y + dirY * mag * 0.5;
    posChunk[i * 3 + 2] = z + (Math.random() - 0.5) * 2.6;

    // embedding cloud: tight gaussian around the paragraph's cluster centre
    const cluster = paraCluster[page][para];
    const cc = centers[cluster];
    const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.7;
    posCloud[i * 3] = cc.x + g() * (mode === "portrait" ? 0.8 : 1);
    posCloud[i * 3 + 1] = cc.y + g() * 0.85;
    posCloud[i * 3 + 2] = cc.z + g() * 0.85;

    const isRelevant = cluster === RELEVANT ? 1 : 0;
    const s = Math.random();
    const inBeam = isRelevant && s < 0.55 ? 1 : 0;
    flag[i * 3] = isRelevant;
    flag[i * 3 + 1] = cluster / (CLUSTERS - 1);
    flag[i * 3 + 2] = inBeam;
    seed[i] = s;

    // answer beam: a thin, quiet line placed clear of the finale text
    if (inBeam) {
      posLine[i * 3] = (Math.random() - 0.5) * 2 * L.beam.halfWidth;
      posLine[i * 3 + 1] = L.beam.y + g() * 0.09;
      posLine[i * 3 + 2] = 1.8;
    } else {
      posLine[i * 3] = posCloud[i * 3];
      posLine[i * 3 + 1] = posCloud[i * 3 + 1];
      posLine[i * 3 + 2] = posCloud[i * 3 + 2];
    }
  }

  const data: SceneData = {
    posDoc,
    posChunk,
    posCloud,
    posLine,
    seed,
    flag,
    relevantCenter: L.relevantCenter.clone(),
    queryFrom: L.queryFrom.clone(),
  };
  dataCache[mode] = data;
  return data;
}

const vertex = /* glsl */ `
  uniform float uP;
  uniform float uTime;
  attribute vec3 aChunk;
  attribute vec3 aCloud;
  attribute vec3 aLine;
  attribute float aSeed;
  attribute vec3 aFlag;
  varying vec3 vColor;
  varying float vAlpha;

  float ez(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    float e1 = ez(clamp((uP - 0.35 - aSeed * 0.25) / 0.55, 0.0, 1.0));
    float e2 = ez(clamp((uP - 1.15 - aSeed * 0.30) / 0.55, 0.0, 1.0));
    float e4 = ez(clamp((uP - 3.10 - aSeed * 0.25) / 0.55, 0.0, 1.0));

    vec3 p = mix(position, aChunk, e1);
    p = mix(p, aCloud, e2);
    p = mix(p, aLine, e4 * aFlag.x);

    float breathe = e2 * (1.0 - e4);
    p.x += sin(uTime * 0.55 + aSeed * 40.0) * 0.05 * breathe;
    p.y += cos(uTime * 0.45 + aSeed * 55.0) * 0.05 * breathe;

    float beam = e4 * aFlag.z;
    p.x += sin(uTime * 2.0 + aSeed * 90.0) * 0.03 * beam;

    float hl = smoothstep(2.25, 2.80, uP) * aFlag.x;
    float dim = (1.0 - aFlag.x) * smoothstep(2.25, 2.95, uP);
    float gone = (1.0 - aFlag.z) * ez(clamp((uP - 3.05) / 0.65, 0.0, 1.0));

    vec3 paper  = vec3(0.72, 0.71, 0.86);
    vec3 violet = vec3(0.545, 0.486, 1.0);
    vec3 cyan   = vec3(0.404, 0.910, 0.976);
    vec3 lit    = vec3(0.80, 0.76, 1.0);
    vec3 clusterColor = mix(violet, cyan, aFlag.y);
    vColor = mix(mix(paper, clusterColor, e2), lit, hl * 0.75);

    vAlpha = 0.62 * (1.0 - dim * 0.82) * (1.0 - gone);
    vAlpha = mix(vAlpha, 0.5, beam);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.05 + aSeed * 1.15) * (1.0 + hl * 0.45) * (30.0 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(vColor, soft * vAlpha);
  }
`;

const UNIFORMS = { uP: { value: 0 }, uTime: { value: 0 } };

function Pipeline({
  progress,
  mode,
}: {
  progress: MutableRefObject<number>;
  mode: Mode;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useRef<THREE.BufferGeometry>(null);
  const group = useRef<THREE.Group>(null);
  const query = useRef<THREE.Mesh>(null);
  const data = getData(mode);

  useEffect(() => {
    // smaller particle budget on phones
    if (geo.current && mode === "portrait") {
      geo.current.setDrawRange(0, Math.floor(COUNT * 0.55));
    }
  }, [mode]);

  useFrame((state) => {
    const p = progress.current;
    if (mat.current) {
      mat.current.uniforms.uP.value = p;
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    const g = group.current;
    if (g) {
      // portrait layout is composed for the frame already; landscape
      // shrinks a little on narrower windows
      const aspect = state.size.width / state.size.height;
      const fit =
        mode === "portrait" ? 1 : THREE.MathUtils.clamp(aspect / 1.7, 0.6, 1);
      g.scale.setScalar(fit);

      const cloudIn = THREE.MathUtils.smoothstep(p, 1.15, 2);
      const finale = THREE.MathUtils.smoothstep(p, 3.1, 4);
      g.position.z = cloudIn * 1.0 - finale * 0.5;
      g.rotation.y =
        cloudIn * 0.1 * (1 - finale) +
        Math.sin(state.clock.elapsedTime * 0.08) * 0.012;
    }
    const q = query.current;
    if (q) {
      const t = THREE.MathUtils.clamp((p - 2.0) / 0.55, 0, 1);
      const e = t * t * (3 - 2 * t);
      q.position.lerpVectors(data.queryFrom, data.relevantCenter, e);
      const alive = p > 2.02 && p < 3.1 ? 1 : 0;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
      q.scale.setScalar(
        alive * pulse * (1 - THREE.MathUtils.smoothstep(p, 2.85, 3.1))
      );
    }
  });

  return (
    <group ref={group}>
      <points key={mode}>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[data.posDoc, 3]} />
          <bufferAttribute attach="attributes-aChunk" args={[data.posChunk, 3]} />
          <bufferAttribute attach="attributes-aCloud" args={[data.posCloud, 3]} />
          <bufferAttribute attach="attributes-aLine" args={[data.posLine, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[data.seed, 1]} />
          <bufferAttribute attach="attributes-aFlag" args={[data.flag, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={UNIFORMS}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          ref={mat}
        />
      </points>
      <mesh ref={query} scale={0}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color={0xcfc7ff}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const CAPTIONS = [
  {
    k: "01 · The documents",
    t: "Thousands of internal documents — specs, procedures, standards — on a network no cloud AI is allowed to touch.",
    pos: "md:left-[5%] md:right-auto md:top-auto md:bottom-[10%]",
    window: [0.03, 0.9] as const,
  },
  {
    k: "02 · Chunk & embed",
    t: "Each document is parsed, split into chunks, and every chunk becomes a vector — meaning, mapped into space.",
    pos: "md:left-auto md:right-[5%] md:top-[16%] md:bottom-auto",
    window: [1.1, 2.0] as const,
  },
  {
    k: "03 · Retrieve & rerank",
    t: "A question flies in. Hybrid search pulls its nearest neighbors; a reranker keeps only what truly answers.",
    pos: "md:left-[5%] md:right-auto md:top-[16%] md:bottom-auto",
    window: [2.15, 3.0] as const,
  },
] as const;

const FINALE_WINDOW = [3.3, 4.4] as const;

function fadeFor(p: number, [a, b]: readonly [number, number]) {
  const inn = THREE.MathUtils.smoothstep(p, a, a + 0.2);
  const out = 1 - THREE.MathUtils.smoothstep(p, b - 0.16, b);
  return Math.min(inn, out);
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

const subscribeReduced = subscribeMedia("(prefers-reduced-motion: reduce)");
const subscribeNarrow = subscribeMedia("(max-width: 767px)");

export default function ScrollStory() {
  const wrap = useRef<HTMLElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(true);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  );
  const mode: Mode = narrow ? "portrait" : "landscape";

  useEffect(() => {
    if (reduced) return;
    const el = wrap.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate(self) {
        const p = self.progress * 4;
        progress.current = p;
        CAPTIONS.forEach((c, i) => {
          const node = capRefs.current[i];
          if (!node) return;
          const o = fadeFor(p, c.window);
          node.style.opacity = String(o);
          node.style.transform = `translateY(${(1 - o) * 22}px)`;
        });
        const fin = finaleRef.current;
        if (fin) {
          const o = fadeFor(p, FINALE_WINDOW);
          fin.style.opacity = String(o);
          fin.style.transform = `translateY(${(1 - o) * 26}px)`;
        }
      },
    });

    return () => {
      io.disconnect();
      st.kill();
    };
  }, [reduced]);

  if (reduced) {
    // static, motion-free telling of the same story
    return (
      <section className="border-t border-line">
        <div className="container-x py-28">
          <p className="eyebrow">How my systems work</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...CAPTIONS.map((c) => ({ k: c.k, t: c.t })), {
              k: "04 · Answer, grounded",
              t: "The answer assembles from retrieved sources — cited and verifiable. This is what I build.",
            }].map((c) => (
              <div key={c.k}>
                <p className="font-mono text-[11px] tracking-[0.2em] text-acc2">
                  {c.k.toUpperCase()}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink2">
                  {c.t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="relative h-[520vh] border-t border-line">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 10.5], fov: 50, near: 0.1, far: 60 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          frameloop={visible ? "always" : "never"}
        >
          <Pipeline progress={progress} mode={mode} />
        </Canvas>

        {/* header strip */}
        <div className="pointer-events-none absolute left-0 right-0 top-[84px] z-10">
          <div className="container-x">
            <p className="eyebrow">
              How my systems work — keep scrolling
            </p>
          </div>
        </div>

        {/* captions: bottom sheets on mobile, corner cards on desktop */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {CAPTIONS.map((c, i) => (
            <div
              key={c.k}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className={`absolute bottom-[7%] left-4 right-4 top-auto rounded-2xl border border-line bg-bg/80 p-5 opacity-0 backdrop-blur-sm md:max-w-[400px] md:bg-bg/70 md:p-6 ${c.pos}`}
            >
              <p className="font-mono text-[11px] tracking-[0.25em] text-acc2">
                {c.k.toUpperCase()}
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-ink2 md:text-[15px] md:leading-[1.75]">
                {c.t}
              </p>
            </div>
          ))}

          {/* finale */}
          <div
            ref={finaleRef}
            className="absolute inset-x-0 top-[30%] mx-auto max-w-[900px] px-6 text-center opacity-0 md:top-[36%]"
          >
            <p className="font-mono text-[11px] tracking-[0.25em] text-acc2">
              04 · ANSWER, GROUNDED
            </p>
            <p className="mt-5 text-[clamp(30px,5vw,64px)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink [text-shadow:0_2px_24px_rgba(8,8,13,0.85)]">
              This is what I <span className="serif-accent">build</span>.
            </p>
            <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink2 [text-shadow:0_1px_12px_rgba(8,8,13,0.9)]">
              Retrieval-grounded answers, cited to their sources — running
              on-premise at GE HealthCare, adopted by the engineers who use
              them every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
