// Slider simples (mantive a lógica original)
const sliders = document.querySelectorAll('.slider');
const btnPrev = document.getElementById('prev-button');
const btnNext = document.getElementById('next-button');

let currentSlide = 0;
function hideSlider() { sliders.forEach(i => i.classList.remove('on')); }
function showSlider() { if (sliders[currentSlide]) sliders[currentSlide].classList.add('on'); }
function nextSlider() { hideSlider(); currentSlide = (currentSlide + 1) % sliders.length; showSlider(); }
function prevSlider() { hideSlider(); currentSlide = (currentSlide - 1 + sliders.length) % sliders.length; showSlider(); }

if (btnNext && btnPrev && sliders.length) {
  btnNext.addEventListener('click', nextSlider);
  btnPrev.addEventListener('click', prevSlider);
  showSlider();
}

// Visualizador 360 por frames
// Arquivos esperados: images/360/frame_00.jpg ... frame_35.jpg (padrão 36 frames). Ajuste frameCount se tiver outro número.
(function setup360() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  const frameCount = 36; // número de frames (ex: 36)
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const idx = String(i).padStart(2, '0');
    frames.push(`images/360/frame_${idx}.jpg`);
  }

  // preload (opcional leve)
  const imgEl = document.getElementById('viewer-fallback');
  if (imgEl) imgEl.src = frames[0];

  let isDown = false;
  let startX = 0;
  let current = 0;
  let sensitivity = 6; // quanto menor, mais sensível

  function setFrame(n) {
    current = ((n % frameCount) + frameCount) % frameCount;
    // troca src do img dentro do viewer
    if (!viewer.img) {
      viewer.img = document.createElement('img');
      viewer.img.draggable = false;
      viewer.innerHTML = '';
      viewer.appendChild(viewer.img);
    }
    viewer.img.src = frames[current];
  }

  function pointerDown(e) {
    isDown = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    viewer.classList.add('dragging');
  }
  function pointerMove(e) {
    if (!isDown) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const dx = x - startX;
    const deltaFrames = Math.floor(dx / sensitivity);
    if (deltaFrames !== 0) {
      setFrame(current - deltaFrames);
      startX = x;
    }
  }
  function pointerUp() {
    isDown = false;
    viewer.classList.remove('dragging');
  }

  // desktop
  viewer.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);

  // touch
  viewer.addEventListener('touchstart', pointerDown, {passive: true});
  viewer.addEventListener('touchmove', pointerMove, {passive: true});
  viewer.addEventListener('touchend', pointerUp);

  // keyboard acessibilidade (opcional)
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setFrame(current - 1);
    if (e.key === 'ArrowRight') setFrame(current + 1);
  });

  // inicial
  setFrame(0);
})();


// Visualizador panorama (imagem equiretangular)
(function setupPanorama() {
  const viewer = document.getElementById('pan-viewer');
  const img = document.getElementById('pan-img');
  if (!viewer || !img) return;

  // Ajustes iniciais
  let isDown = false;
  let startX = 0;
  let offset = 0; // deslocamento horizontal em pixels
  const speed = 0.6; // sensibilidade (ajuste conforme necessário)

  // Garante que a imagem esteja carregada para capturar dimensões
  function fitImage() {
    // se a imagem for menor que o container em largura, escale-a via width: auto / height:100% já definido
    // deixamos a imagem com height:100% e width:auto para preservar proporção
    // offset é usado para deslocar via transform
    img.style.transform = `translateY(-50%) translateX(${offset}px)`;
  }

  // Eventos
  function pointerDown(e) {
    isDown = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    viewer.classList.add('dragging');
  }

  function pointerMove(e) {
    if (!isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - startX;
    startX = x;
    offset += dx * speed;
    // loop contínuo: quando a imagem rolar além das bordas, ajustamos para efeito infinito
    const imgW = img.getBoundingClientRect().width;
    const vw = viewer.getBoundingClientRect().width;
    // se a imagem for menor que o viewport, nada a animar
    if (imgW <= vw) {
      img.style.transform = `translateY(-50%) translateX(0px)`;
      return;
    }
    // normalize offset para manter dentro de [-imgW, imgW] e evitar números grandes
    if (Math.abs(offset) > imgW) offset = offset % imgW;
    // aplica transform
    img.style.transform = `translateY(-50%) translateX(${offset}px)`;
  }

  function pointerUp() {
    isDown = false;
    viewer.classList.remove('dragging');
  }

  // suporte mouse
  viewer.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);

  // suporte touch
  viewer.addEventListener('touchstart', pointerDown, { passive: true });
  viewer.addEventListener('touchmove', pointerMove, { passive: true });
  viewer.addEventListener('touchend', pointerUp);

  // teclado (setas para girar)
  viewer.addEventListener('keydown', (e) => {
    const step = 20;
    if (e.key === 'ArrowLeft') { offset += step; pointerMove({ touches: [{ clientX: startX - step }] }); }
    if (e.key === 'ArrowRight') { offset -= step; pointerMove({ touches: [{ clientX: startX + step }] }); }
  });

  // resize / load
  window.addEventListener('resize', fitImage);
  if (img.complete) fitImage(); else img.addEventListener('load', fitImage);
})();
