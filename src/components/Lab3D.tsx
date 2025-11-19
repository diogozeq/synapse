import React, { useEffect, useRef } from 'react';

const Lab3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const init = async () => {
      try {
        const THREE = await import('three');
        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf6f8f8);
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x13ecc8 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(3, 3, 3);
        scene.add(light);
        let stopped = false;
        const animate = () => {
          if (stopped) return;
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.02;
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();
        cleanup = () => { stopped = true; renderer.dispose(); };
      } catch (e) {
        // three não disponível
      }
    };
    init();
    return () => { cleanup && cleanup(); };
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Laboratório 3D Colaborativo</h2>
      <p className="text-sm text-gray-600 mb-4">Protótipo com elementos interativos e hotspots (U.A.U!).</p>
      <div className="w-full h-[400px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Lab3D;