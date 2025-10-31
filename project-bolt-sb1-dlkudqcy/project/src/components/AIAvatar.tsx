import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EmotionType, EMOTION_COLORS } from '../utils/emotions';

interface AIAvatarProps {
  emotion: EmotionType;
  intensity: number;
  isThinking?: boolean;
}

export default function AIAvatar({ emotion, intensity, isThinking = false }: AIAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    head: THREE.Mesh;
    leftEye: THREE.Mesh;
    rightEye: THREE.Mesh;
    mouth: THREE.Mesh;
    aura: THREE.Mesh;
    animationId?: number;
  }>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(400, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 5;

    const headGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.5,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 0.3, 1.3);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 0.3, 1.3);
    head.add(rightEye);

    const mouthGeometry = new THREE.TorusGeometry(0.3, 0.08, 16, 32, Math.PI);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.3,
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 1.3);
    mouth.rotation.z = Math.PI;
    head.add(mouth);

    const auraGeometry = new THREE.SphereGeometry(2.2, 32, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    scene.add(aura);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      head,
      leftEye,
      rightEye,
      mouth,
      aura,
    };

    const animate = () => {
      if (!sceneRef.current) return;

      const { head, aura } = sceneRef.current;

      head.rotation.y += 0.005;
      aura.rotation.y -= 0.003;
      aura.scale.set(
        1 + Math.sin(Date.now() * 0.001) * 0.05,
        1 + Math.sin(Date.now() * 0.001) * 0.05,
        1 + Math.sin(Date.now() * 0.001) * 0.05
      );

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { leftEye, rightEye, mouth, aura } = sceneRef.current;
    const color = new THREE.Color(EMOTION_COLORS[emotion]);

    (aura.material as THREE.MeshBasicMaterial).color = color;
    (aura.material as THREE.MeshBasicMaterial).opacity = 0.2 + intensity * 0.3;

    (leftEye.material as THREE.MeshStandardMaterial).emissive = color;
    (rightEye.material as THREE.MeshStandardMaterial).emissive = color;
    (mouth.material as THREE.MeshStandardMaterial).emissive = color;

    switch (emotion) {
      case 'joy':
        leftEye.scale.set(1.2, 1.2, 1.2);
        rightEye.scale.set(1.2, 1.2, 1.2);
        mouth.rotation.z = Math.PI;
        mouth.position.y = -0.3;
        break;
      case 'curiosity':
        leftEye.scale.set(1.3, 1.3, 1.3);
        rightEye.scale.set(1.3, 1.3, 1.3);
        mouth.rotation.z = Math.PI * 1.1;
        mouth.position.y = -0.3;
        break;
      case 'calm':
        leftEye.scale.set(1, 1, 1);
        rightEye.scale.set(1, 1, 1);
        mouth.rotation.z = Math.PI;
        mouth.position.y = -0.4;
        break;
      case 'anger':
        leftEye.scale.set(0.8, 1.2, 1);
        rightEye.scale.set(0.8, 1.2, 1);
        mouth.rotation.z = 0;
        mouth.position.y = -0.5;
        break;
      case 'confusion':
        leftEye.scale.set(1.1, 0.9, 1);
        rightEye.scale.set(0.9, 1.1, 1);
        mouth.rotation.z = Math.PI * 0.9;
        mouth.position.y = -0.3;
        break;
      case 'confidence':
        leftEye.scale.set(1, 1, 1);
        rightEye.scale.set(1, 1, 1);
        mouth.rotation.z = Math.PI * 1.2;
        mouth.position.y = -0.2;
        break;
    }
  }, [emotion, intensity]);

  useEffect(() => {
    if (!sceneRef.current || !isThinking) return;

    const { leftEye, rightEye } = sceneRef.current;
    let blinkInterval: NodeJS.Timeout;

    const blink = () => {
      leftEye.scale.y = 0.1;
      rightEye.scale.y = 0.1;
      setTimeout(() => {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }, 100);
    };

    blinkInterval = setInterval(blink, 2000);

    return () => {
      clearInterval(blinkInterval);
    };
  }, [isThinking]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      {isThinking && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}
