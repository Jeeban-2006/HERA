'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ScrollParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 860 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
    const N = isMobile ? 900 : 2600;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    // ── Glow sprite texture ─────────────────────────────────────────────────
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const randInRect = (cx: number, cy: number, hw: number, hy: number, zj: number): [number, number, number] =>
      [cx + rand(-hw, hw), cy + rand(-hy, hy), rand(-zj, zj)];
    const randInDisk = (cx: number, cy: number, r: number, zj: number): [number, number, number] => {
      const a = rand(0, Math.PI * 2), rr = r * Math.sqrt(Math.random());
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, rand(-zj, zj)];
    };

    // Colour palette matching the reference
    const cLavender: [number, number, number] = [0.78, 0.68, 0.88];
    const cWhite: [number, number, number]    = [0.96, 0.94, 0.99];
    const cPink: [number, number, number]     = [0.95, 0.79, 0.85];
    const cGold: [number, number, number]     = [0.95, 0.79, 0.66];
    const cBlue: [number, number, number]     = [0.66, 0.78, 0.91];
    const cVioletDeep: [number, number, number] = [0.42, 0.36, 0.62];

    const mixColor = (a: [number,number,number], b: [number,number,number], t: number): [number,number,number] =>
      [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)];

    // ── Shape generators ────────────────────────────────────────────────────
    function shapeCloud() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      for (let i = 0; i < N; i++) {
        const r = 2.4 * Math.cbrt(Math.random()); // tighter radius → stays in viewport
        const theta = rand(0, Math.PI*2), phi = Math.acos(rand(-1,1));
        pos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
        pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta)*0.65; // centred at 0
        pos[i*3+2] = r*Math.cos(phi)*0.5;
        const c = mixColor(cLavender, cWhite, Math.random());
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    function shapeSilhouette() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      const parts: { w: number; fn: () => [number,number,number] }[] = [
        { w: 0.10, fn: () => randInDisk(0, 2.05, 0.33, 0.22) },
        { w: 0.32, fn: () => randInRect(0, 1.05, 0.48, 0.52, 0.18) },
        { w: 0.10, fn: () => randInRect(0, 0.35, 0.40, 0.18, 0.18) },
        { w: 0.30, fn: () => randInRect(rand(0,1)<0.5?-0.19:0.19, -1.0, 0.13, 1.1, 0.16) },
        { w: 0.18, fn: () => randInRect(rand(0,1)<0.5?-0.66:0.66, 0.85, 0.11, 0.68, 0.14) },
      ];
      let acc = 0;
      const cum = parts.map(p => { acc += p.w; return acc; });
      for (let i = 0; i < N; i++) {
        const r2 = Math.random() * acc;
        const idx = cum.findIndex(c => r2 <= c);
        const [x, y, z] = parts[idx >= 0 ? idx : 0].fn();
        pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
        const c = mixColor(cBlue, cWhite, Math.random()*0.6+0.2);
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    function shapeRings() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      const phases = [
        { start: 0,          end: Math.PI*0.5,  color: cPink },
        { start: Math.PI*0.5,end: Math.PI*1.05, color: cLavender },
        { start: Math.PI*1.05,end:Math.PI*1.3,  color: cGold },
        { start: Math.PI*1.3,end: Math.PI*2,    color: cBlue },
      ];
      for (let i = 0; i < N; i++) {
        const ph = phases[Math.floor(Math.random()*phases.length)];
        const a  = rand(ph.start, ph.end);
        const rr = 2.15 + rand(-0.12, 0.12);
        pos[i*3]   = Math.cos(a)*rr;
        pos[i*3+1] = Math.sin(a)*rr*0.92;
        pos[i*3+2] = rand(-0.18, 0.18);
        const c = mixColor(ph.color, cWhite, rand(0,0.25));
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    const NODES = 20;
    let nodeCenters: THREE.Vector3[] = [];
    function shapeNetwork() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      nodeCenters = [];
      for (let n = 0; n < NODES; n++) {
        const r = 2.3 * Math.cbrt(Math.random());
        const theta = rand(0, Math.PI*2), phi = Math.acos(rand(-1,1));
        nodeCenters.push(new THREE.Vector3(
          r*Math.sin(phi)*Math.cos(theta),
          r*Math.sin(phi)*Math.sin(theta)*0.85,
          r*Math.cos(phi)*0.7,
        ));
      }
      for (let i = 0; i < N; i++) {
        const n = nodeCenters[i % NODES];
        pos[i*3]   = n.x + rand(-0.16, 0.16);
        pos[i*3+1] = n.y + rand(-0.16, 0.16);
        pos[i*3+2] = n.z + rand(-0.16, 0.16);
        const c = mixColor(cVioletDeep, cBlue, Math.random());
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    function buildNetworkLines() {
      const segs: number[] = [];
      for (let i = 0; i < nodeCenters.length; i++) {
        const sorted = nodeCenters
          .map((n, j) => ({ j, d: nodeCenters[i].distanceTo(n) }))
          .filter(o => o.j !== i)
          .sort((a, b) => a.d - b.d);
        for (let k = 0; k < 2; k++) {
          const j = sorted[k].j;
          segs.push(nodeCenters[i].x, nodeCenters[i].y, nodeCenters[i].z,
                    nodeCenters[j].x, nodeCenters[j].y, nodeCenters[j].z);
        }
      }
      return new Float32Array(segs);
    }

    function shapeTimeline() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      for (let i = 0; i < N; i++) {
        const x = rand(-3.2, 3.2);
        const trend = (x+3.2)/6.4;
        const y = Math.sin(x*1.35)*0.5*(0.4+trend) + (trend-0.5)*1.4;
        pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=rand(-0.22, 0.22);
        const t = (x+3.2)/6.4;
        const c = mixColor(cLavender, cPink, t);
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    function shapeConverge() {
      const pos = new Float32Array(N*3), col = new Float32Array(N*3);
      for (let i = 0; i < N; i++) {
        const r = 0.85 * Math.cbrt(Math.random());
        const theta = rand(0, Math.PI*2), phi = Math.acos(rand(-1,1));
        pos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
        pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta); // removed 0.2 offset → centred at 0
        pos[i*3+2] = r*Math.cos(phi);
        const c = mixColor(cGold, cWhite, Math.random()*0.5);
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }
      return { pos, col };
    }

    // Build all shapes (network must come before buildNetworkLines)
    const cloud      = shapeCloud();
    const silhouette = shapeSilhouette();
    const rings      = shapeRings();
    const network    = shapeNetwork();
    const netLinePos = buildNetworkLines();
    const timeline   = shapeTimeline();
    const converge   = shapeConverge();
    const shapes = [cloud, silhouette, rings, network, timeline, converge];

    // ── Particle geometry ────────────────────────────────────────────────────
    const positions = new Float32Array(N*3);
    const colors    = new Float32Array(N*3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.052 : 0.045,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Network lines (only visible at stage 3)
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(netLinePos.slice(), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.6,0.68,0.95), transparent: true, opacity: 0 });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // ── Scroll progress ──────────────────────────────────────────────────────
    let scrollProgress = 0;
    let smoothProgress = 0;
    let mouseX = 0, mouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

    const getScrollProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };

    const STAGES = shapes.length;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colAttr  = geo.attributes.color    as THREE.BufferAttribute;

    function updateParticles(p: number) {
      const stageFloat = p * (STAGES - 1);
      let i0 = Math.floor(stageFloat);
      if (i0 > STAGES-2) i0 = STAGES-2;
      if (i0 < 0) i0 = 0;
      const t = smoothstep(Math.min(1, Math.max(0, stageFloat - i0)));
      const A = shapes[i0], B = shapes[i0+1];
      for (let i = 0; i < N; i++) {
        const ix=i*3, iy=i*3+1, iz=i*3+2;
        positions[ix] = lerp(A.pos[ix], B.pos[ix], t);
        positions[iy] = lerp(A.pos[iy], B.pos[iy], t);
        positions[iz] = lerp(A.pos[iz], B.pos[iz], t);
        colors[ix] = lerp(A.col[ix], B.col[ix], t);
        colors[iy] = lerp(A.col[iy], B.col[iy], t);
        colors[iz] = lerp(A.col[iz], B.col[iz], t);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate  = true;

      // Network lines peak at stage 3
      const netW = Math.max(0, 1 - Math.abs(stageFloat - 3) * 1.6);
      lineMat.opacity = netW * 0.35;

      points.rotation.y   = p * 1.1;
      lineMesh.rotation.y = p * 1.1;
    }

    // ── Events ────────────────────────────────────────────────────────────────
    const onScroll = () => { scrollProgress = getScrollProgress(); };
    const onMouse  = (e: MouseEvent) => {
      mouseX =  (e.clientX / window.innerWidth)  - 0.5;
      mouseY =  (e.clientY / window.innerHeight) - 0.5;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('scroll',    onScroll,  { passive: true });
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize',    onResize);

    // ── Render loop ───────────────────────────────────────────────────────────
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      smoothProgress += (scrollProgress - smoothProgress) * (reduceMotion ? 1 : 0.08);
      updateParticles(smoothProgress);
      if (!reduceMotion) {
        smoothMouseX += (mouseX - smoothMouseX) * 0.04;
        smoothMouseY += (mouseY - smoothMouseY) * 0.04;
        camera.position.x =  smoothMouseX * 0.6;
        camera.position.y = -smoothMouseY * 0.4;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    scrollProgress = getScrollProgress();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll',    onScroll);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize',    onResize);
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose();
      glowTex.dispose(); renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
