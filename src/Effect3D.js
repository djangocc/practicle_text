import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #181818;
  overflow: hidden;
`;

// 3D场景容器
const ThreeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 创建动态的字体样式组件
const CustomFontStyle = styled.style`
  @font-face {
    font-family: '${props => props.fontName}';
    src: url('${props => props.fontUrl}') format('woff2');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
`;

const Effect3D = ({ 
  frontText = "G", 
  backText = "R",
  canvasSize = 300,                    // 画布大小
  canvasBackground = "#000000",        // 画布背景色
  fontSize = 200,                      // 文字大小
  font = {                            // 字体配置
    name: "Arial Black",              // 字体名称
    url: null,                        // 可选的字体URL
    weight: "bold"                    // 字体粗细
  },
  rotationSpeed = 0.005,              // 旋转速度
  particleScaleSpeed = 3,             // 粒子缩放速度
  particleMinScale = 0.5,             // 粒子最小缩放
  particleMaxScale = 1.5,             // 粒子最大缩放
  particleColor = 0xffffff,           // 粒子颜色
  particleGap = 10                    // 粒子间隔
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const rotatingRef = useRef(false);
  const animationRef = useRef(null);
  const groupRef = useRef(null);
  const targetRotationRef = useRef({ y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(!font.url);
  const [customFontFamily, setCustomFontFamily] = useState(font.name);

  // 初始化Three.js场景
  const initThree = () => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // 创建正交相机替代透视相机
    const frustumSize = 300;
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      2000
    );
    camera.position.z = 400;
    cameraRef.current = camera;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      precision: 'highp',
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // 使用设备的像素比
    renderer.setClearColor(0x181818);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 创建粒子组
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    
    // 生成粒子
    generateParticles();
    
    // 启动动画循环
    animate();
    
    // 设置窗口调整大小事件
    window.addEventListener('resize', handleResize);
    
    // 设置旋转计时器
    const rotationTimer = setTimeout(() => {
      rotatingRef.current = true;
      // 从当前位置旋转到目标位置
      if (Math.abs(groupRef.current.rotation.y) < 0.1 || Math.abs(groupRef.current.rotation.y - Math.PI/2) < 0.1) {
        targetRotationRef.current = { 
          y: Math.abs(groupRef.current.rotation.y) < 0.1 ? Math.PI/2 : 0 
        };
      }
    }, 1000); // 等5秒触发一次旋转
    
    setIsInitialized(true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(rotationTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // 清除所有资源
      disposeResources();
    };
  };
  
  // 资源释放
  const disposeResources = () => {
    if (particlesRef.current.length > 0) {
      particlesRef.current.forEach(particle => {
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
        if (groupRef.current) groupRef.current.remove(particle);
      });
      particlesRef.current = [];
    }
  };
  
  // 处理窗口大小变化
  const handleResize = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    const frustumSize = 300;
    const aspect = window.innerWidth / window.innerHeight;
    
    cameraRef.current.left = frustumSize * aspect / -2;
    cameraRef.current.right = frustumSize * aspect / 2;
    cameraRef.current.top = frustumSize / 2;
    cameraRef.current.bottom = frustumSize / -2;
    
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio); // 在resize时也更新像素比
  };
  
  // 处理自定义字体加载
  useEffect(() => {
    if (font.url) {
      // 生成唯一的字体名称，避免冲突
      const uniqueFontName = `CustomFont-${Math.random().toString(36).substr(2, 9)}`;
      setCustomFontFamily(uniqueFontName);

      const customFont = new FontFace(uniqueFontName, `url(${font.url})`);
      customFont.load().then(loadedFont => {
        document.fonts.add(loadedFont);
        setFontLoaded(true);
      }).catch(error => {
        console.warn('Custom font loading failed:', error);
        setCustomFontFamily(font.name); // 回退到系统字体
        setFontLoaded(true);
      });
    } else {
      setCustomFontFamily(font.name);
      setFontLoaded(true);
    }
  }, [font.url, font.name]);

  // 修改文本渲染函数
  const textToPoints = (text, font, size, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = 'white';
    ctx.font = `${font.weight} ${height}px ${customFontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(text, size/2, size/2);
    
    const imageData = ctx.getImageData(0, 0, size, size).data;
    const points = [];
    
    for (let y = 0; y < size; y += particleGap) {
      for (let x = 0; x < size; x += particleGap) {
        const i = (y * size + x) * 4;
        if (imageData[i] > 128) {
          points.push({
            x: x - size/2,
            y: y - size/2,
            z: 0
          });
        }
      }
    }
    
    return points;
  };

  const joinPointsSets = (points0,points1) => {
    const ret = []
    // Generate set of unique Y values from points0
    const yValues = new Set(points0.map(point => point.y));
    for (const y of yValues) {
      const matchedPoints0 = points0.filter(point => point.y === y)
      const matchedPoints1 = points1.filter(point => point.y === y)
      const minPoints = matchedPoints0.length < matchedPoints1.length ? matchedPoints0 : matchedPoints1
      const maxPoints = matchedPoints0.length < matchedPoints1.length ? matchedPoints1 : matchedPoints0
      const originMinPointsLength = minPoints.length
      const originMaxPointsLength = maxPoints.length
      if (minPoints.length === 0){
        continue
      }
      let iForMinPoints = 0
      for(let i = 0; i < originMaxPointsLength - originMinPointsLength; i++){
        minPoints.push(minPoints[iForMinPoints])
        iForMinPoints = (iForMinPoints + 1) % originMinPointsLength
      }
      for(let i = 0; i < matchedPoints0.length; i++){
        ret.push({
          x: matchedPoints0[i].x,
          y: matchedPoints0[i].y,
          z: matchedPoints1[i].x,
        })
      }
    }
    return ret
  };
  
  // 生成3D粒子
  const generateParticles = () => {
    if (!groupRef.current) return;
    
    disposeResources();
    
    const frontPoints = textToPoints(frontText, font, canvasSize, fontSize);
    const backPoints = textToPoints(backText, font, canvasSize, fontSize);
    let finalPoints = joinPointsSets(frontPoints, backPoints);
    
    const particles = [];
    const material = new THREE.MeshBasicMaterial({ 
      color: particleColor,
      precision: 'highp',
    });
    
    finalPoints.forEach((point, index) => {
      const baseSize = 3;
      const sphereGeometry = new THREE.SphereGeometry(baseSize, 32, 32);
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.set(point.x, -point.y, point.z);
      mesh.userData = {
        originalX: point.x,
        originalY: -point.y,
        originalZ: point.z,
        isFront: false,
        baseSize: baseSize,
        scaleOffset: Math.random() * Math.PI * 2,
        currentScale: 1
      };
      groupRef.current.add(mesh);
      particles.push(mesh);
    });
    
    particlesRef.current = particles;
  };
  
  // 动画循环
  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !groupRef.current) return;
    
    // 处理旋转动画
    if (rotatingRef.current) {
      if (targetRotationRef.current.y > groupRef.current.rotation.y) {
        groupRef.current.rotation.y = Math.min(
          groupRef.current.rotation.y + rotationSpeed,
          targetRotationRef.current.y
        );
      } else {
        groupRef.current.rotation.y = Math.max(
          groupRef.current.rotation.y - rotationSpeed,
          targetRotationRef.current.y
        );
      }
      
      if (Math.abs(groupRef.current.rotation.y - targetRotationRef.current.y) < rotationSpeed) {
        groupRef.current.rotation.y = targetRotationRef.current.y;
        rotatingRef.current = false;
      }
    }
    
    // 更新粒子大小
    const time = Date.now() * 0.001;
    
    particlesRef.current.forEach(particle => {
      const scale = particleMinScale + (Math.sin(time * particleScaleSpeed + particle.userData.scaleOffset) + 1) * (particleMaxScale - particleMinScale) / 2;
      particle.scale.set(scale, scale, scale);
    });
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // 修改初始化函数，等待字体加载
  useEffect(() => {
    if (fontLoaded) {
      console.time('initThree');
      const cleanup = initThree();
      console.timeEnd('initThree');
      return cleanup;
    }
  }, [fontLoaded]);
  
  // 当文本更改时重新生成粒子
  useEffect(() => {
    if (isInitialized && groupRef.current) {
      generateParticles();
    }
  }, [frontText, backText, isInitialized]);

  return (
    <>
      {font.url && (
        <CustomFontStyle fontName={customFontFamily} fontUrl={font.url} />
      )}
      <Container>
        <ThreeContainer ref={containerRef} />
      </Container>
    </>
  );
};

export default Effect3D; 