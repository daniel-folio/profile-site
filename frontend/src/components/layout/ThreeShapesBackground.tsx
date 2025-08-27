'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const pastelColors = [
  0xA7C7E7, // 파스텔 블루
  0xFFD1DC, // 파스텔 핑크
  0xB5EAD7, // 파스텔 민트
  0xFFFACD, // 파스텔 옐로우
];

const ThreeShapesBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(width, height);

    const mountNode = mountRef.current;
    if (mountNode) {
      mountNode.appendChild(renderer.domElement);
    }

    // 도형 생성 함수들
    function createTorus(radius: number, tube: number, color: number, position: [number, number, number]) {
      const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7, linewidth: 3 });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);
      wireframe.position.set(...position);
      return wireframe;
    }

    function createThickCircle(radius: number, thickness: number, color: number, position: [number, number, number]) {
      const geometry = new THREE.RingGeometry(radius - thickness / 2, radius + thickness / 2, 64);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      return mesh;
    }

    function createPolygon(radius: number, sides: number, color: number, position: [number, number, number]) {
      const geometry = new THREE.CircleGeometry(radius, sides);
      geometry.deleteAttribute('normal');
      geometry.deleteAttribute('uv');
      const points = geometry.getAttribute('position');
      const positions = [];
      for (let i = 1; i < points.count; i++) {
        positions.push(new THREE.Vector3(points.getX(i), points.getY(i), points.getZ(i)));
      }
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7, linewidth: 3 });
      const polygon = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(positions), material);
      polygon.position.set(...position);
      return polygon;
    }

    // 하늘색 토러스(wireframe) 생성
    function createSkyBlueTorus(position: [number, number, number]) {
      const geometry = new THREE.TorusGeometry(6, 1.0, 16, 100);
      const material = new THREE.LineBasicMaterial({ color: 0xA7C7E7, transparent: true, opacity: 0.7 });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);
      wireframe.position.set(...position);
      return wireframe;
    }

    // 다이아몬드(정사면체, 빨간색)
    function createRedDiamond(position: [number, number, number]) {
      const geometry = new THREE.TetrahedronGeometry(4);
      const material = new THREE.MeshBasicMaterial({ color: pastelColors[1], wireframe: true, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      return mesh;
    }

    // 3차원 삼각형(정사면체, 초록색)
    function createTetrahedron(color: number, position: [number, number, number]) {
      const geometry = new THREE.TetrahedronGeometry(3);
      const material = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      return mesh;
    }

    // 3차원 Icosahedron(보라색 wireframe) 생성
    function createIcosahedron(color: number, position: [number, number, number]) {
      const geometry = new THREE.IcosahedronGeometry(5, 0);
      const material = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      return mesh;
    }

    // 노란색 토러스(기존)
    const blueTorus = createSkyBlueTorus([-8, 3, 0]);
    const redDiamond = createRedDiamond([10, 5, -2]);
    const greenTetra = createTetrahedron(pastelColors[2], [0, -7, 0]);
    const purpleIcosahedron = createIcosahedron(0xD8B4FE, [7, -6, 2]);

    const shapes = [blueTorus, redDiamond, greenTetra, purpleIcosahedron];
    shapes.forEach(shape => scene.add(shape));

    // 애니메이션
    let t = 0;
    const animate = () => {
      blueTorus.rotation.x += 0.0005;
      blueTorus.rotation.y += 0.0005;
      greenTetra.rotation.x -= 0.008;
      greenTetra.rotation.y += 0.012;
      purpleIcosahedron.rotation.x -= 0.001;
      purpleIcosahedron.rotation.y -= 0.001;
      redDiamond.rotation.x += 0.012;
      redDiamond.rotation.y += 0.014;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 반응형
    const handleResize = () => {
      if (!mountNode) return;
      
      const newWidth = mountNode.clientWidth || window.innerWidth;
      const newHeight = mountNode.clientHeight || window.innerHeight;
      
      if (newWidth === 0 || newHeight === 0) return;
      
      width = newWidth;
      height = newHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // ResizeObserver를 사용하여 부모 요소 크기 변경 감지
    if (mountNode) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(mountNode);
    }

    // 초기 리사이즈
    handleResize();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      
      // 씬의 모든 객체 정리
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) 
            ? object.material 
            : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      
      renderer.dispose();
      
      if (mountNode && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ThreeShapesBackground; 