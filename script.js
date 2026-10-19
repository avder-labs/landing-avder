/* ==========================================================================
   AVDER STUDIO — interactions & three.js scenes
   ========================================================================== */

/* ---------- custom cursor ---------- */
const cursorDot = document.getElementById('cursorDot');
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.style.width = '34px'; cursorDot.style.height = '34px'; cursorDot.style.background = 'rgba(230,187,119,0.25)'; });
    el.addEventListener('mouseleave', () => { cursorDot.style.width = '18px'; cursorDot.style.height = '18px'; cursorDot.style.background = 'transparent'; });
  });
}

/* ---------- mobile nav ---------- */
const burger = document.getElementById('burger');
const mnav = document.getElementById('mnav');
burger.addEventListener('click', () => {
  mnav.classList.toggle('open');
  burger.classList.toggle('open');
});
mnav.querySelectorAll('a, button').forEach(item => item.addEventListener('click', () => mnav.classList.remove('open')));

/* ---------- stat counters ---------- */
const stats = document.querySelectorAll('.stat__num');
const suffixMap = { 120: '+', 4: '', 99: '%' };
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      el.dataset.suffix = suffixMap[target] !== undefined ? suffixMap[target] : '';
      let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target; }
        else { el.textContent = cur; requestAnimationFrame(tick); }
      };
      tick();
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
stats.forEach(s => counterObserver.observe(s));

/* ==========================================================================
   THREE.JS — HERO SCENE
   ========================================================================== */
(function heroScene(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xe6bb77, wireframe: true, transparent: true, opacity: 0.85 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  const coreInnerGeo = new THREE.IcosahedronGeometry(1.55, 0);
  const coreInnerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.75 });
  const coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
  scene.add(coreInner);

  const NODE_COUNT = 90;
  const positions = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++){
    const r = 3.4 + Math.random() * 2.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({ color: 0xf3e5ab, size: 0.06, transparent: true, opacity: 1.0 });
  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  const lineGeo = new THREE.BufferGeometry();
  const linePositions = [];
  for (let i = 0; i < NODE_COUNT; i++){
    for (let j = i+1; j < NODE_COUNT; j++){
      const dx = positions[i*3]-positions[j*3], dy = positions[i*3+1]-positions[j*3+1], dz = positions[i*3+2]-positions[j*3+2];
      const dist = Math.sqrt(dx*dx+dy*dy+dz*dz);
      if (dist < 1.5 && Math.random() > 0.85){
        linePositions.push(positions[i*3], positions[i*3+1], positions[i*3+2]);
        linePositions.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xe6bb77, transparent: true, opacity: 0.35 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / innerWidth - 0.5);
    my = (e.clientY / innerHeight - 0.5);
  });

  resize();
  let t = 0;
  function animate(){
    t += 0.004;
    core.rotation.y = t * 0.7 + mx * 0.4;
    core.rotation.x = t * 0.3 + my * 0.3;
    coreInner.rotation.y = -t * 0.5;
    coreInner.rotation.x = t * 0.4;
    points.rotation.y = t * 0.35;
    lines.rotation.y = t * 0.35;
    camera.position.x += (mx * 1.2 - camera.position.x) * 0.02;
    camera.position.y += (-my * 1.2 - camera.position.y) * 0.02;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();


// ==========================================================================
// CONFIGURACIÓN DE ESCENAS 3D PARA CADA SERVICIO (CON TU NOMBRE EN BINARIO)
// ==========================================================================
const serviceScenes = document.querySelectorAll('.service-card__scene');

serviceScenes.forEach(container => {
  const sceneType = container.getAttribute('data-scene');
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 3.5;

  let subject;
  const matParams = { color: 0xe6bb77, wireframe: true, transparent: true, opacity: 0.9 };

  if (sceneType === 'web') {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 1.4, 0.1), 
      new THREE.MeshBasicMaterial({ color: 0xe6bb77, wireframe: true, transparent: true, opacity: 0.5 })
    );
    group.add(frame);

    function createBinarySprite(message) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#e6bb77';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
      return new THREE.Sprite(spriteMaterial);
    }

    const binaryName = [
      "01000001 01101110",
      "01100100 01110010",
      "01100101 01101111",
      "01000001 01101100",
      "01110110 01100001",
      "01000011 01101000",
      "01100001 01110110",
      "01100101 01111010"
    ];

    for (let i = 0; i < binaryName.length; i++) {
      const sprite = createBinarySprite(binaryName[i]);
      sprite.position.set(
        (Math.random() - 0.5) * 3.8,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 1.2 + 0.2
      );
      sprite.scale.set(1.8, 0.45, 1);
      group.add(sprite);
    }
    subject = group;

  } else if (sceneType === 'software') {
    const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    subject = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(matParams));

  } else if (sceneType === 'diseno') {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.4, 8), new THREE.MeshBasicMaterial(matParams));
    body.rotation.z = Math.PI / 4;
    
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0xf4d0d8, wireframe: true }));
    tip.position.set(-1.0, 1.0, 0);
    tip.rotation.z = Math.PI / 4;

    group.add(body);
    group.add(tip);
    subject = group;

  } else if (sceneType === 'community') {
    const group = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe6bb77 });
    
    const nodes = [];
    for (let i = 0; i < 9; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        (Math.random() - 0.5) * 2.8,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 1.2
      );
      nodes.push(node);
      group.add(node);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0xe6bb77, transparent: true, opacity: 0.5 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 2.2) {
          const points = [nodes[i].position, nodes[j].position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          group.add(new THREE.Line(lineGeo, lineMat));
        }
      }
    }
    subject = group;
  }

  if (subject) scene.add(subject);

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (subject) {
      subject.rotation.y += 0.007 + mouseX * 0.04;
      subject.rotation.x += 0.004 + mouseY * 0.04;
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});

/* ==========================================================================
   THREE.JS — CONTACT SECTION AMBIENT PARTICLES
   ========================================================================== */
(function contactScene(){
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 30);
  camera.position.z = 8;

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const COUNT = 160;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++){
    pos[i*3] = (Math.random() - 0.5) * 16;
    pos[i*3+1] = (Math.random() - 0.5) * 8;
    pos[i*3+2] = (Math.random() - 0.5) * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xe6bb77, size: 0.045, transparent: true, opacity: 0.9 });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  resize();
  window.addEventListener('resize', resize);
  let t = 0;
  function animate(){
    t += 0.0015;
    particles.rotation.y = t;
    particles.rotation.x = Math.sin(t) * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ==========================================================================
   THREE.JS — SCROLL RAIL
   ========================================================================== */
(function scrollRail(){
  const canvas = document.getElementById('railCanvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.z = 6;

  function resize(){
    const w = canvas.clientWidth || 64, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  }

  const trackGeo = new THREE.BufferGeometry();
  trackGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.82, 0, 0, -0.82, 0]), 3));
  const trackMat = new THREE.LineDashedMaterial({ color: 0x554433, dashSize: 0.04, gapSize: 0.03 });
  const track = new THREE.Line(trackGeo, trackMat);
  track.computeLineDistances();
  scene.add(track);

  const nodeGeo = new THREE.OctahedronGeometry(0.09, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe6bb77, wireframe: true });
  const node = new THREE.Mesh(nodeGeo, nodeMat);
  scene.add(node);

  resize();
  window.addEventListener('resize', resize);

  const stopEls = document.querySelectorAll('.rail__stops span');
  const sectionIds = ['hero','servicios','trabajo','proceso','contacto'];
  const sections = sectionIds.map(id => id === 'hero' ? document.querySelector('.hero') : document.getElementById(id));

  let scrollProgress = 0;
  function updateScroll(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;

    let activeIdx = 0;
    sections.forEach((sec, i) => {
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) activeIdx = i;
    });
    stopEls.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  let t = 0;
  function animate(){
    t += 0.02;
    const y = 0.82 - scrollProgress * 1.64;
    node.position.y += (y - node.position.y) * 0.12;
    node.rotation.y = t;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ==========================================================================
   PROCESO AUTOMÁTICO (BARRA DE CARGA PROGRESIVA Y AVANCE DE CUADROS)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const processItems = document.querySelectorAll('.process__item');
  const processProgress = document.getElementById('processProgress');
  if (processItems.length === 0) return;

  let currentIndex = 0;
  const intervalTime = 3000; // 3 segundos por cada paso
  let processInterval = null;

  function updateProcess(index) {
    // 1. Activar o desactivar las tarjetas visualmente
    processItems.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    // 2. Hacer que la línea avance progresivamente tramo por tramo (25% -> 50% -> 75% -> 100%)
    if (processProgress) {
      const percentage = ((index + 1) / processItems.length) * 100;
      processProgress.style.width = `${percentage}%`;
    }
  }

  function nextStep() {
    currentIndex = (currentIndex + 1) % processItems.length;
    updateProcess(currentIndex);
  }

  function startProcess() {
    processInterval = setInterval(nextStep, intervalTime);
  }

  function resetProcessTimer() {
    clearInterval(processInterval);
    startProcess();
  }

  // Permitir interacción haciendo clic manual en cualquier tarjeta de paso
  processItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      currentIndex = idx;
      updateProcess(currentIndex);
      resetProcessTimer();
    });
  });

  // Inicializar estado de arranque
  updateProcess(currentIndex);
  startProcess();
});

/* ==========================================================================
   FORMULARIO DE CONTACTO (ENVÍO ASÍNCRONO BLINDADO)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successBox = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("submitBtn");

  if (!form) {
    console.warn("No se encontró el formulario con id 'contactForm'");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // Detiene por completo el comportamiento predeterminado
    e.stopImmediatePropagation();

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Enviando... <span>⏳</span>";
    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { 
          'Accept': 'application/json' 
        }
      });

      if (response.ok) {
        form.style.display = "none";
        if (successBox) successBox.style.display = "block";
      } else {
        alert("Hubo un problema al enviar el mensaje. Inténtalo de nuevo.");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    } catch (error) {
      alert("Error de red. Verifica tu conexión.");
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});

/* ==========================================================================
   THREE.JS — ABOUT MODAL 3D SCENE (TEXTO 3D AVDER CON VAIVÉN SUAVE)
   ========================================================================== */
(function aboutModalScene(){
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;
  
  const container = document.getElementById('aboutSceneContainer');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  function resize(){
    if (!container) return;
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const group = new THREE.Group();
  scene.add(group);

  const fontLoader = new THREE.FontLoader();
  fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo = new THREE.TextGeometry('AVDER', {
      font: font,
      size: 0.65,
      height: 0.18,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 3
    });
    textGeo.center();

    const textMat = new THREE.MeshBasicMaterial({ 
      color: 0xe6bb77, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.85 
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    group.add(textMesh);

    const innerGeo = new THREE.IcosahedronGeometry(0.35, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.6 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);
  });

  let mx = 0, my = 0;
  if (container) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      my = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
    });
  }

  let t = 0;
  function animate(){
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal && aboutModal.classList.contains('open')) {
      t += 0.015;
      const targetRotationY = Math.sin(t) * 0.5 + (mx * 0.6);
      const targetRotationX = Math.cos(t * 0.7) * 0.2 + (my * 0.6);

      group.rotation.y += (targetRotationY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.08;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
  animate();

  const observer = new MutationObserver(() => {
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal && aboutModal.classList.contains('open')) {
      setTimeout(resize, 50);
    }
  });
  const aboutModal = document.getElementById('aboutModal');
  if (aboutModal) observer.observe(aboutModal, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', resize);
})();

/* ==========================================================================
   CASE DATA + MODAL CON VIDEOS DE EVIDENCIA
   ========================================================================== */
const CASE_DATA = {
  web1: { idx:'CASE_01', title:'Plataforma corporativa — Grupo Horizonte', url:'avder.studio/grupohorizonte', client:'Grupo Horizonte', year:'2025', stack:'Next.js · Sanity CMS · Vercel', desc:'Rediseño integral del sitio corporativo con arquitectura headless.', results:['Carga inicial < 1s','Panel autogestionable','+52% permanencia'], videoUrl:'assets/videos/web1.mp4' },
  web2: { idx:'CASE_02', title:'Tienda en línea — Nova Studio', url:'avder.studio/novastudio', client:'Nova Studio', year:'2024', stack:'Shopify Custom · Liquid · React', desc:'Relanzamiento de tienda con checkout optimizado.', results:['+38% conversión','-24% abandono carrito','Buscador en tiempo real'], videoUrl:'assets/videos/web2.mp4' },
  web3: { idx:'CASE_03', title:'Landing de producto — Vértice SaaS', url:'avder.studio/vertice', client:'Vértice SaaS', year:'2025', stack:'Astro · Tailwind · Framer Motion', desc:'Página enfocada en performance extremo.', results:['98+ Core Web Vitals','+61% registros','Carga < 400kb'], videoUrl:'assets/videos/web3.mp4' },
  sw1: { idx:'CASE_04', title:'App de logística — FlotaX', url:'avder.studio/flotax', client:'FlotaX', year:'2025', stack:'React Native · Node.js · PostgreSQL', desc:'App móvil para seguimiento de flotas en tiempo real.', results:['Ahorro 18% combustible','Push notifications','94% adopción flota'], videoUrl:'assets/videos/sw1.mp4' },
  sw2: { idx:'CASE_05', title:'ERP a medida — Manufacturas del Sur', url:'avder.studio/manufacturas', client:'Manufacturas del Sur', year:'2024', stack:'Vue.js · Laravel · MySQL', desc:'Sistema interno para gestión de inventario y producción.', results:['-70% tiempo conteo','Reportes en tiempo real','Multi-planta'], videoUrl:'assets/videos/sw2.mp4' },
  sw3: { idx:'CASE_06', title:'Integración de pagos — Pagolink', url:'avder.studio/pagolink', client:'Pagolink', year:'2025', stack:'Node.js · Docker · Kubernetes', desc:'Microservicios para transacciones a alta disponibilidad.', results:['99.98% uptime','+40K transacciones/día','Latencia < 120ms'], videoUrl:'assets/videos/sw3.mp4' },
  d1: { idx:'CASE_07', title:'Rebranding — Café Meridiano', url:'avder.studio/meridiano', client:'Café Meridiano', year:'2024', stack:'Identidad · Packaging · Guía de marca', desc:'Sistema de marca completo desde cero.', results:['Manual 40+ páginas','12 puntos de venta','+45% reconocimiento'], videoUrl:'assets/videos/d1.mp4' },
  d2: { idx:'CASE_08', title:'Marca desde cero — Runa Labs', url:'avder.studio/runalabs', client:'Runa Labs', year:'2025', stack:'Naming · Identidad visual · Web', desc:'Creación de nombre y sistema visual para startup biotech.', results:['Validado en inversión','Pitch deck optimizado','Sistema cromático propio'], videoUrl:'assets/videos/d2.mp4' },
  d3: { idx:'CASE_09', title:'Sistema editorial — Revista Órbita', url:'avder.studio/orbita', client:'Revista Órbita', year:'2024', stack:'Figma · InDesign · Modular', desc:'Sistema de maquetación modular para publicación digital.', results:['-35% tiempo maquetación','12 ediciones','Plantillas reutilizables'], videoUrl:'assets/videos/d3.mp4' },
  c1: { idx:'CASE_10', title:'Crecimiento orgánico — Studio Fit', url:'avder.studio/studiofit', client:'Studio Fit', year:'2025', stack:'Instagram · TikTok · Contenido nativo', desc:'Estrategia de contenido constante y crecimiento de comunidad.', results:['2K a 48K seguidores','Engagement 6.8%','+120 leads/mes'], videoUrl:'assets/videos/c1.mp4' },
  c2: { idx:'CASE_11', title:'Comunidad activa — Fintech Andina', url:'avder.studio/fintech', client:'Fintech Andina', year:'2024', stack:'Moderación · Soporte · Educación', desc:'Gestión integral de comunidad y soporte activo.', results:['Respuesta < 15 min','+30% retención','60+ piezas educativas'], videoUrl:'assets/videos/c2.mp4' },
  c3: { idx:'CASE_12', title:'Lanzamiento de producto — Kaia Beauty', url:'avder.studio/kaiabeauty', client:'Kaia Beauty', year:'2025', stack:'Campaña multicanal · Creadores', desc:'Campaña coordinada con creadores locales.', results:['Inventario agotado 1ª semana','+8M alcance','32 creadores activados'], videoUrl:'assets/videos/c3.mp4' }
};

const modal = document.getElementById('caseModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');

function openCaseModal(key){
  const data = CASE_DATA[key];
  if (!data) return;
  document.getElementById('modalIdx').textContent = data.idx;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDesc').textContent = data.desc;
  document.getElementById('modalUrl').textContent = data.url;
  document.getElementById('modalClient').textContent = data.client;
  document.getElementById('modalYear').textContent = data.year;
  document.getElementById('modalStack').textContent = data.stack;

  const resultsEl = document.getElementById('modalResults');
  resultsEl.innerHTML = '';
  data.results.forEach(r => {
    const d = document.createElement('div');
    d.textContent = r;
    resultsEl.appendChild(d);
  });

  const modalVideo = document.getElementById('modalVideo');
  if (modalVideo && data.videoUrl) {
    modalVideo.src = data.videoUrl;
    modalVideo.play().catch(e => console.log("Reproducción pendiente:", e));
  }

  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCaseModal(){
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  const modalVideo = document.getElementById('modalVideo');
  if (modalVideo) { modalVideo.pause(); modalVideo.currentTime = 0; }
}

document.querySelectorAll('.case[data-case]').forEach(card => {
  card.addEventListener('click', () => openCaseModal(card.dataset.case));
});

if (modalBackdrop) modalBackdrop.addEventListener('click', closeCaseModal);
if (modalClose) modalClose.addEventListener('click', closeCaseModal);

/* ==========================================================================
   MODAL "SOBRE NOSOTROS" — CONTROL DE APERTURA Y CIERRE
   ========================================================================== */
const aboutModal = document.getElementById('aboutModal');
const aboutOpenBtn = document.getElementById('aboutOpenBtn');
const aboutOpenBtnMobile = document.getElementById('aboutOpenBtnMobile');
const aboutClose = document.getElementById('aboutClose');
const aboutBackdrop = document.getElementById('aboutBackdrop');

function openAboutModal(e) {
  if (e) e.preventDefault();
  if (aboutModal) {
    aboutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAboutModal() {
  if (aboutModal) {
    aboutModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

if (aboutOpenBtn) aboutOpenBtn.addEventListener('click', openAboutModal);
if (aboutOpenBtnMobile) {
  aboutOpenBtnMobile.addEventListener('click', () => {
    mnav.classList.remove('open');
    openAboutModal();
  });
}
if (aboutBackdrop) aboutBackdrop.addEventListener('click', closeAboutModal);
if (aboutClose) aboutClose.addEventListener('click', closeAboutModal);

window.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape') {
    closeCaseModal();
    closeAboutModal();
  }
});

/* ==========================================================================
   SERVICE CARD -> WORK PANEL TAB SYNC
   ========================================================================== */
const serviceCards = document.querySelectorAll('.service-card');
const wtabs = document.querySelectorAll('.wtab');
const wpanels = document.querySelectorAll('.wpanel');
const workPanel = document.getElementById('trabajo');

function activateTab(key){
  wtabs.forEach(t => t.classList.toggle('active', t.dataset.tab === key));
  wpanels.forEach(p => p.classList.toggle('active', p.dataset.panel === key));
  serviceCards.forEach(c => c.classList.toggle('active', c.dataset.service === key));
}

serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.service;
    activateTab(key);
    if (workPanel) workPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

wtabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});