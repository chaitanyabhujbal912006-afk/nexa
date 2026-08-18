"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function KineticBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // NEXA Central Core Icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(2.2, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0xadc6ff,
      emissive: 0x4d8eff,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Inner Glow Sphere
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x4cd7f6, transparent: true, opacity: 0.35 })
    );
    scene.add(innerCore);

    // Rotating Rings
    const ringGroup = new THREE.Group();
    const ringMaterials: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(3.5 + i * 1.2, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xadc6ff : i === 1 ? 0x4cd7f6 : 0xc0c1ff,
        transparent: true,
        opacity: 0.4,
      });
      ringMaterials.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    // Orbital Nodes (Source files representation)
    const nodes: THREE.Mesh[] = [];
    const nodeCount = 6;
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.BoxGeometry(0.7, 0.9, 0.08);
      const nodeMat = new THREE.MeshPhongMaterial({ color: 0x191f31, emissive: 0x0c1324 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);

      const angle = (i / nodeCount) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 7.5, Math.sin(angle) * 7.5, 0);
      nodes.push(node);
      scene.add(node);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        node.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x4d8eff, transparent: true, opacity: 0.2 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x4d8eff, 1.2, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      core.rotation.x = elapsedTime * 0.2;
      core.rotation.y = elapsedTime * 0.3;

      ringGroup.children.forEach((ring, idx) => {
        ring.rotation.x += 0.003 * (idx + 1);
        ring.rotation.y += 0.005 * (idx + 1);
      });

      nodes.forEach((node, idx) => {
        const angle = (idx / nodeCount) * Math.PI * 2 + elapsedTime * 0.2;
        node.position.x = Math.cos(angle) * 7.5;
        node.position.y = Math.sin(angle) * 7.5;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0" />;
}
