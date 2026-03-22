/**
 * Inpaint Canvas — vanilla TS (no React needed).
 * Upload image → paint mask with brush → enter prompt → send to backend.
 */

const API_URL = 'https://mygloven-api.aeoninfinitive.com';

export function createInpaintApp(root: HTMLElement) {
  // State
  let originalImage: HTMLImageElement | null = null;
  let painting = false;
  let brushSize = 30;
  let processing = false;

  // DOM
  root.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Canvas -->
      <div>
        <div class="relative bg-[#12121e] rounded-xl overflow-hidden border border-white/10" style="min-height: 400px;">
          <canvas id="ip-canvas" class="w-full cursor-crosshair" style="display:none;"></canvas>
          <div id="ip-dropzone" class="flex flex-col items-center justify-center p-12 text-center" style="min-height: 400px;">
            <div class="text-4xl mb-4">📸</div>
            <p class="text-gray-400 mb-2">Arrastra una imagen aquí</p>
            <p class="text-gray-500 text-xs mb-4">o</p>
            <label class="bg-[#e4665c] hover:bg-[#d86259] text-white px-6 py-2 rounded-full font-semibold cursor-pointer transition-all text-sm">
              Seleccionar archivo
              <input type="file" accept="image/*" id="ip-file" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Brush controls -->
        <div id="ip-controls" class="mt-4 flex items-center gap-4" style="display:none;">
          <label class="text-sm text-gray-400 flex items-center gap-2">
            Pincel:
            <input type="range" id="ip-brush" min="5" max="80" value="30" class="w-32 accent-[#e4665c]" />
            <span id="ip-brush-val" class="text-xs text-gray-500 w-8">30px</span>
          </label>
          <button id="ip-clear-mask" class="text-xs text-gray-400 hover:text-[#e4665c] border border-gray-600 px-3 py-1 rounded-full transition-all">
            Limpiar máscara
          </button>
          <button id="ip-reset" class="text-xs text-gray-400 hover:text-red-400 border border-gray-600 px-3 py-1 rounded-full transition-all">
            Nueva imagen
          </button>
        </div>
      </div>

      <!-- Right: Prompt & Result -->
      <div class="flex flex-col gap-4">
        <div>
          <label class="text-sm text-gray-400 block mb-2">¿Qué quieres generar en la zona pintada?</label>
          <textarea id="ip-prompt" rows="3" class="w-full bg-[#12121e] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e4665c] text-sm" placeholder="Ej: una terraza con luces cálidas y plantas, estilo lounge nocturno"></textarea>
        </div>

        <div class="flex gap-3">
          <button id="ip-generate" disabled class="flex-1 bg-[#e4665c] hover:bg-[#d86259] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold transition-all text-sm">
            Generar
          </button>
        </div>

        <div id="ip-status" class="text-xs text-gray-500 h-6"></div>

        <!-- Result -->
        <div id="ip-result" class="bg-[#12121e] rounded-xl overflow-hidden border border-white/10" style="display:none; min-height: 300px;">
          <img id="ip-result-img" class="w-full" />
        </div>

        <div id="ip-actions" class="flex gap-3" style="display:none;">
          <button id="ip-download" class="flex-1 border border-[#e4665c] text-[#e4665c] hover:bg-[#e4665c] hover:text-white px-6 py-2 rounded-full font-semibold transition-all text-sm">
            Descargar resultado
          </button>
          <button id="ip-use-result" class="flex-1 border border-white/20 text-gray-300 hover:bg-white/10 px-6 py-2 rounded-full font-semibold transition-all text-sm">
            Usar como base →
          </button>
        </div>
      </div>
    </div>
  `;

  // Elements
  const canvas = root.querySelector('#ip-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const dropzone = root.querySelector('#ip-dropzone') as HTMLElement;
  const fileInput = root.querySelector('#ip-file') as HTMLInputElement;
  const controls = root.querySelector('#ip-controls') as HTMLElement;
  const brushInput = root.querySelector('#ip-brush') as HTMLInputElement;
  const brushVal = root.querySelector('#ip-brush-val') as HTMLElement;
  const clearMaskBtn = root.querySelector('#ip-clear-mask') as HTMLElement;
  const resetBtn = root.querySelector('#ip-reset') as HTMLElement;
  const promptInput = root.querySelector('#ip-prompt') as HTMLTextAreaElement;
  const generateBtn = root.querySelector('#ip-generate') as HTMLButtonElement;
  const status = root.querySelector('#ip-status') as HTMLElement;
  const resultDiv = root.querySelector('#ip-result') as HTMLElement;
  const resultImg = root.querySelector('#ip-result-img') as HTMLImageElement;
  const actionsDiv = root.querySelector('#ip-actions') as HTMLElement;
  const downloadBtn = root.querySelector('#ip-download') as HTMLElement;
  const useResultBtn = root.querySelector('#ip-use-result') as HTMLElement;

  // Mask canvas (offscreen — stores only the painted mask)
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d')!;

  // Load image
  function loadImage(file: File) {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      
      // Set canvas dimensions matching image aspect ratio
      const maxW = canvas.parentElement!.clientWidth;
      const scale = Math.min(maxW / img.width, 600 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Clear mask
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Show canvas, hide dropzone
      canvas.style.display = 'block';
      dropzone.style.display = 'none';
      controls.style.display = 'flex';
      generateBtn.disabled = false;
      resultDiv.style.display = 'none';
      actionsDiv.style.display = 'none';
    };
    img.src = URL.createObjectURL(file);
  }

  // File input
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) loadImage(fileInput.files[0]);
  });

  // Drag & drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('ring-2', 'ring-[#e4665c]');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('ring-2', 'ring-[#e4665c]');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('ring-2', 'ring-[#e4665c]');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });

  // Brush size
  brushInput.addEventListener('input', () => {
    brushSize = parseInt(brushInput.value);
    brushVal.textContent = `${brushSize}px`;
  });

  // Painting (on main canvas, mirrored to mask canvas)
  function getPos(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function paintAt(x: number, y: number) {
    // Draw semi-transparent red on main canvas (visual feedback)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(228, 102, 92, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw white on mask canvas (actual mask)
    maskCtx.fillStyle = '#ffffff';
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
  }

  canvas.addEventListener('mousedown', (e) => { painting = true; const p = getPos(e); paintAt(p.x, p.y); });
  canvas.addEventListener('mousemove', (e) => { if (painting) { const p = getPos(e); paintAt(p.x, p.y); } });
  canvas.addEventListener('mouseup', () => { painting = false; });
  canvas.addEventListener('mouseleave', () => { painting = false; });
  
  // Touch support
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); painting = true; const p = getPos(e); paintAt(p.x, p.y); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (painting) { const p = getPos(e); paintAt(p.x, p.y); } }, { passive: false });
  canvas.addEventListener('touchend', () => { painting = false; });

  // Clear mask
  clearMaskBtn.addEventListener('click', () => {
    if (!originalImage) return;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    originalImage = null;
    canvas.style.display = 'none';
    dropzone.style.display = 'flex';
    controls.style.display = 'none';
    generateBtn.disabled = true;
    resultDiv.style.display = 'none';
    actionsDiv.style.display = 'none';
    status.textContent = '';
  });

  // Generate
  generateBtn.addEventListener('click', async () => {
    if (!originalImage || processing) return;
    processing = true;
    generateBtn.disabled = true;
    status.textContent = 'Procesando... (puede tardar 30-60s)';
    status.className = 'text-xs text-[#e4665c] h-6 animate-pulse';

    try {
      // Get original image as blob
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = canvas.width;
      imgCanvas.height = canvas.height;
      const imgCtx = imgCanvas.getContext('2d')!;
      imgCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
      
      const imgBlob = await new Promise<Blob>((res) => imgCanvas.toBlob(b => res(b!), 'image/png'));
      const maskBlob = await new Promise<Blob>((res) => maskCanvas.toBlob(b => res(b!), 'image/png'));

      const formData = new FormData();
      formData.append('image', imgBlob, 'image.png');
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('prompt', promptInput.value || 'photorealistic interior design, high quality');

      const res = await fetch(`${API_URL}/api/inpaint`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      const elapsed = res.headers.get('X-Elapsed') || '?';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      resultImg.src = url;
      resultDiv.style.display = 'block';
      actionsDiv.style.display = 'flex';
      status.textContent = `Generado en ${elapsed}`;
      status.className = 'text-xs text-green-400 h-6';
    } catch (err: any) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'text-xs text-red-400 h-6';
    } finally {
      processing = false;
      generateBtn.disabled = false;
    }
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = resultImg.src;
    a.download = `inpaint-${Date.now()}.png`;
    a.click();
  });

  // Use result as new base
  useResultBtn.addEventListener('click', () => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      resultDiv.style.display = 'none';
      actionsDiv.style.display = 'none';
      status.textContent = 'Resultado cargado como base — pinta la nueva zona';
      status.className = 'text-xs text-gray-400 h-6';
    };
    img.src = resultImg.src;
  });
}
