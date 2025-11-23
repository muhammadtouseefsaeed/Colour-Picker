const colorInput = document.getElementById('colorInput');
const hexInput = document.getElementById('hexInput');
const colorBox = document.getElementById('colorBox');
const rgbVal = document.getElementById('rgbVal');
const hexVal = document.getElementById('hexVal');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const swatches = document.getElementById('swatches');
const copyOk = document.getElementById('copyOk');
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const previewImg = document.getElementById('previewImg');
const ctx = canvas.getContext('2d');

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function loadColor(hex) {
  colorInput.value = hex;
  hexInput.value = hex;
  colorBox.style.background = hex;
  hexVal.textContent = hex;
  rgbVal.textContent = rgbString(hexToRgb(hex));
}

function renderSaved() {
  swatches.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem('savedColors') || '[]');
  saved.forEach(c => {
    const d = document.createElement('div');
    d.className = 'sw';
    d.style.background = c;
    d.title = c;
    d.addEventListener('click', () => loadColor(c));
    swatches.appendChild(d);
  });
}

function saveColor(hex) {
  const saved = JSON.parse(localStorage.getItem('savedColors') || '[]');
  if (!saved.includes(hex)) {
    saved.unshift(hex);
    if (saved.length > 10) saved.pop();
    localStorage.setItem('savedColors', JSON.stringify(saved));
    renderSaved();
  }
}

colorInput.addEventListener('input', e => loadColor(e.target.value));

hexInput.addEventListener('change', e => {
  const val = e.target.value.trim();
  const hex = val.startsWith('#') ? val : '#' + val;
  if (/^#([0-9A-Fa-f]{6})$/.test(hex)) {
    loadColor(hex);
  } else {
    alert('Invalid HEX');
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(hexInput.value);
  copyOk.style.display = 'block';
  setTimeout(() => copyOk.style.display = 'none', 1200);
});

saveBtn.addEventListener('click', () => saveColor(hexInput.value));

renderSaved();
loadColor('#00aaff');

// Image upload and color pick
imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    previewImg.src = ev.target.result;
    previewImg.onload = () => {
      canvas.width = previewImg.width;
      canvas.height = previewImg.height;
      ctx.drawImage(previewImg, 0, 0);
      previewImg.addEventListener('click', ev2 => {
        const rect = previewImg.getBoundingClientRect();
        const x = ev2.clientX - rect.left;
        const y = ev2.clientY - rect.top;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const imgData = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        const hex = `#${((1 << 24) + (imgData[0] << 16) + (imgData[1] << 8) + imgData[2]).toString(16).slice(1)}`;
        loadColor(hex);
      });
    };
  };
  reader.readAsDataURL(file);
});
