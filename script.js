const CONFIG_KEY = 'gold_poster_data_v14';
const SHOPS_KEY = 'gold_poster_shops_v14';

const DEFAULT_SHOPS = ['FORTUNE JEWELLERS', 'ROYAL JEWELLERS', 'BAITUL JEWELRY'];
const CARDS = [
  { id: '22', title: '22K', small: false, gram: '৳ ১২,৫০০', vori: '১,৪৫,৮০০' },
  { id: '21', title: '21K', small: false, gram: '৳ ১১,৯৫০', vori: '১,৩৯,৩০০' },
  { id: '18', title: '18K', small: false, gram: '৳ ১০,২৪০', vori: '১,১৯,৪৪০' },
  { id: 'sn', title: 'SONATON', small: true, gram: '৳ ৮,৪০০', vori: '৯৭,৯৮০' }
];

const $ = id => document.getElementById(id);

let state = {
  shop: DEFAULT_SHOPS[0],
  date: '',
  address: 'Shop:- 28, Baitul Mukarram (Ground Floor) Dhaka - 1000',
  phone: '+880 1324503708 · WhatsApp: +8801324503708',
  theme: 'theme-classic',
  colors: { bg: '#000000', text: '#ffffff', accent: '#f1c40f', border: '#c5a059' },
  logo: '',
  cards: Object.fromEntries(CARDS.map(c => [c.id, { gram: c.gram, vori: c.vori }])),
  shops: [...DEFAULT_SHOPS]
};

let saveTimer;

function formatToday() {
  const d = new Date();
  return `DATE. ${String(d.getDate()).padStart(2,'0')} . ${String(d.getMonth()+1).padStart(2,'0')} . ${d.getFullYear()}`;
}

function renderShopOptions() {
  const select = $('shop-select');
  select.innerHTML = state.shops.map(shop => 
    `<option value="${escapeHtml(shop)}" ${shop === state.shop ? 'selected' : ''}>${escapeHtml(shop)}</option>`
  ).join('');
}

function renderCardInputs() {
  $('card-inputs').innerHTML = CARDS.map(c => `
    <div class="card-inputs-grid">
      <h4>${escapeHtml(c.title)} Rate (Gram / Vori)</h4>
      <div class="input-row">
        <input type="text" data-card="${c.id}" data-type="gram" value="${escapeHtml(state.cards[c.id].gram)}" placeholder="প্রতি গ্রাম">
        <input type="text" data-card="${c.id}" data-type="vori" value="${escapeHtml(state.cards[c.id].vori)}" placeholder="প্রতি ভরি">
      </div>
    </div>
  `).join('');
}

function renderPriceCards() {
  $('price-cards').innerHTML = CARDS.map(c => `
    <div class="card">
      <div class="card-header ${c.small ? 'sonaton-title' : ''}">${escapeHtml(c.title)}</div>
      <div class="card-body">
        <span class="label">PER GRAM</span>
        <span class="price-gram" id="out-${c.id}-gram">${escapeHtml(state.cards[c.id].gram)}</span>
        <hr>
        <span class="label">PER VORI</span>
        <span class="currency-symbol">৳</span>
        <span class="price-vori" id="out-${c.id}-vori">${escapeHtml(state.cards[c.id].vori)}</span>
        <span class="subtext">TODAY'S RATE</span>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updatePoster() {
  $('out-shop').textContent = state.shop;
  $('out-date').textContent = state.date;
  $('out-address').textContent = state.address;
  $('out-phone').textContent = state.phone;
  
  for (const id of Object.keys(state.cards)) {
    $(`out-${id}-gram`).textContent = state.cards[id].gram || '--';
    $(`out-${id}-vori`).textContent = state.cards[id].vori || '--';
  }

  const poster = $('poster');
  if (state.theme === 'custom') {
    poster.className = 'poster';
    poster.style.setProperty('--bg-color', state.colors.bg);
    poster.style.setProperty('--text-color', state.colors.text);
    poster.style.setProperty('--accent-color', state.colors.accent);
    poster.style.setProperty('--border-color', state.colors.border);
  } else {
    poster.className = 'poster ' + state.theme;
    ['--bg-color','--text-color','--accent-color','--border-color'].forEach(p => poster.style.removeProperty(p));
  }

  $('out-logo').src = state.logo;
  $('logo-wrapper').style.display = state.logo ? 'flex' : 'none';
}

function syncInputsToState() {
  state.shop = $('shop-select').value;
  state.date = $('input-date').value;
  state.address = $('input-address').value;
  state.phone = $('input-phone').value;
  state.theme = $('theme-select').value;
  state.colors = {
    bg: $('picker-bg').value,
    text: $('picker-text').value,
    accent: $('picker-accent').value,
    border: $('picker-border').value
  };
  document.querySelectorAll('[data-card][data-type]').forEach(input => {
    const id = input.dataset.card;
    const type = input.dataset.type;
    state.cards[id][type] = input.value;
  });
}

function syncStateToInputs() {
  $('input-date').value = state.date;
  $('input-address').value = state.address;
  $('input-phone').value = state.phone;
  $('theme-select').value = state.theme;
  $('picker-bg').value = state.colors.bg;
  $('picker-text').value = state.colors.text;
  $('picker-accent').value = state.colors.accent;
  $('picker-border').value = state.colors.border;
  renderShopOptions();
  renderCardInputs();
}

function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(state)); } catch(e){}
  }, 300);
}

function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2500);
}

function loadData() {
  try {
    const shops = localStorage.getItem(SHOPS_KEY);
    if (shops) state.shops = JSON.parse(shops);
  } catch(e) {}

  state.date = formatToday();

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      Object.assign(state, {
        shop: config.shop ?? state.shop,
        date: config.date ?? state.date,
        address: config.address ?? state.address,
        phone: config.phone ?? state.phone,
        theme: config.theme ?? state.theme,
        colors: config.colors ?? state.colors,
        logo: config.logo ?? state.logo,
        cards: config.cards ?? state.cards
      });
    }
  } catch(e) {}

  syncStateToInputs();
  renderPriceCards();
  updatePoster();
}

function addShop() {
  const input = $('new-shop-input');
  const name = input.value.trim();
  if (name && !state.shops.includes(name)) {
    state.shops.push(name);
    state.shop = name;
    localStorage.setItem(SHOPS_KEY, JSON.stringify(state.shops));
    input.value = '';
    renderShopOptions();
    updatePoster();
    autoSave();
    showToast('নতুন শপের নাম সেভ হয়েছে!');
  }
}

function deleteShop() {
  if (state.shops.length <= 1) return alert('নূন্যতম একটি শপ থাকতে হবে!');
  state.shops = state.shops.filter(s => s !== state.shop);
  state.shop = state.shops[0];
  localStorage.setItem(SHOPS_KEY, JSON.stringify(state.shops));
  renderShopOptions();
  updatePoster();
  autoSave();
  showToast('শপ মুছে ফেলা হয়েছে!');
}

function uploadLogo(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.logo = e.target.result;
    updatePoster();
    autoSave();
  };
  reader.readAsDataURL(file);
}

function downloadPoster() {
  html2canvas($('poster'), { scale: 3, useCORS: true, backgroundColor: null })
    .then(canvas => {
      const link = document.createElement('a');
      link.download = 'Gold_Price_Poster.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
}

function resetAll() {
  if (!confirm('আপনি কি সব সেটিংস রিসেট করতে চান?')) return;
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(SHOPS_KEY);
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  document.querySelector('.editor-section').addEventListener('input', e => {
    if (e.target.matches('[data-card]') || 
        e.target.matches('#input-date, #input-address, #input-phone') ||
        e.target.matches('input[type="color"]')) {
      syncInputsToState();
      updatePoster();
      autoSave();
    }
  });

  document.querySelector('.editor-section').addEventListener('change', e => {
    if (e.target.matches('#shop-select, #theme-select')) {
      syncInputsToState();
      updatePoster();
      autoSave();
    }
    if (e.target.matches('#input-logo')) {
      uploadLogo(e.target.files[0]);
    }
  });

  document.querySelector('.editor-section').addEventListener('click', e => {
    const action = e.target.dataset.action;
    if (action === 'add-shop') addShop();
    if (action === 'delete-shop') deleteShop();
  });

  $('new-shop-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') addShop();
  });

  $('download-btn').addEventListener('click', downloadPoster);
  $('reset-btn').addEventListener('click', resetAll);
});