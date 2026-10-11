/* Lime Premium — PWA katalog toko statis, tanpa backend/pembayaran otomatis. */
(() => {
'use strict';
const PRODUCTS = (window.PRODUCTS || []).map(p => ({...p, prices: p.prices.map(Number)}));
const DEFAULT = window.STORE_DEFAULTS || { name:'Lime Premium', whatsapp:'' };
const PRICE_LABELS = ['Harian', 'Bulanan', 'Tahunan'];
const PRICE_DURATIONS = ['1 hari', '1 bulan', '1 tahun'];
const CATEGORIES = ['Semua','Editing','Streaming','AI','Produktivitas','Musik','Belajar','Bacaan','Utilitas'];
const $ = s => document.querySelector(s);
const byId = id => document.getElementById(id);
const getLocal = (key, fallback) => {try {const val=JSON.parse(localStorage.getItem('lime_'+key)); return val === null ? fallback : val;} catch{return fallback;}};
const setLocal = (key,value) => {try{localStorage.setItem('lime_'+key,JSON.stringify(value));}catch(e){console.warn('Penyimpanan tidak tersedia',e);}};
const validId = id => PRODUCTS.some(p=>p.id===id);
let cart = (getLocal('cart',[])).filter(row=>validId(row.id)&&[0,1,2].includes(row.plan)&&Number.isInteger(row.qty)&&row.qty>0&&row.qty<1000);
let favorites = getLocal('favorites',[]).filter(validId);
let settings = {...DEFAULT,...getLocal('settings',{})};
let currentFilter = 'Semua', currentSearch = '', chosenProduct = null, chosenPlan = 1, currentView = 'home';
let deferredInstall = null, toastTimer;
const price = n => 'Rp' + new Intl.NumberFormat('id-ID').format(n);
const productById = id => PRODUCTS.find(p=>p.id===id);
const el = (id) => byId(id);
const html = val => String(val).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = p => `${p.id}.svg`;

function save(){setLocal('cart',cart);setLocal('favorites',favorites);}
function toast(msg) {const node=el('toast'); node.textContent=msg; node.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),2700);}
function productCard(p) {
 const liked=favorites.includes(p.id);
 return `<article class="product-card" aria-label="${html(p.name)}">
   <button class="favorite-button ${liked?'liked':''}" data-favorite="${p.id}" aria-label="${liked?'Hapus dari':'Tambah ke'} favorit: ${html(p.name)}" aria-pressed="${liked}">${liked?'♥':'♡'}</button>
   <button class="product-hit" data-product="${p.id}" aria-label="Lihat paket ${html(p.name)}">
     <span class="product-art" style="--art-tint:${html(p.color)}"><img src="${icon(p)}" alt="Ikon ${html(p.name)}" loading="lazy" /></span>
     <span class="product-category">${html(p.category)}</span>
     <span class="product-name">${html(p.name)}</span>
     <span class="product-tag">${html(p.tag)}</span>
     <span class="price-caption">Mulai dari</span>
     <span class="product-price">${price(p.prices[0])}<small> / hari</small></span>
     <span class="card-link">Lihat paket <span aria-hidden="true">↗</span></span>
   </button>
 </article>`;
}
function paintHome(){
 const pick=['netflix','canva','capcut','spotify','chatgpt','disney'];
 el('featuredGrid').innerHTML=pick.map(productById).filter(Boolean).map(productCard).join('');
 const tiles=[['Editing','✳','Bikin karya makin keren'],['Streaming','▶','Binge-watch favorit'],['AI','✦','Asisten serba bisa'],['Produktivitas','▤','Kerja makin ringan']];
 el('categoryTiles').innerHTML=tiles.map(([name,sym,desc])=>`<button data-category-go="${name}" class="category-tile"><span class="category-mark">${sym}</span><strong>${name}</strong><small>${desc}</small><span class="category-arrow">↗</span></button>`).join('');
}
function paintCatalog(){
 el('filterRow').innerHTML=CATEGORIES.map(c=>`<button class="filter-chip ${c===currentFilter?'on':''}" data-filter="${c}" aria-pressed="${c===currentFilter}">${c}</button>`).join('');
 const filtered=PRODUCTS.filter(p=>(currentFilter==='Semua'||p.category===currentFilter)&&`${p.name} ${p.tag} ${p.category}`.toLowerCase().includes(currentSearch.toLowerCase().trim()));
 el('catalogGrid').innerHTML=filtered.map(productCard).join(''); el('resultCount').textContent=`${filtered.length} aplikasi`;
 el('noResults').hidden=filtered.length>0;
}
function paintFavorites(){const rows=PRODUCTS.filter(p=>favorites.includes(p.id));el('favoritesGrid').innerHTML=rows.map(productCard).join('');el('emptyFavorites').hidden=rows.length>0;}
function countCart(){return cart.reduce((s,r)=>s+r.qty,0);}
function totalCart(){return cart.reduce((s,r)=>s+productById(r.id).prices[r.plan]*r.qty,0);}
function paintCart(){
 el('cartList').innerHTML=cart.map((row,i)=>{const p=productById(row.id);return `<article class="cart-item">
  <div class="cart-icon" style="--art-tint:${html(p.color)}"><img src="${icon(p)}" alt=""/></div><div class="cart-info"><div class="cart-title-line"><strong>${html(p.name)}</strong><button class="trash-button" data-remove="${i}" title="Hapus ${html(p.name)}" aria-label="Hapus ${html(p.name)}">×</button></div>
  <label class="cart-plan">Paket <select data-cart-plan="${i}" aria-label="Ganti durasi ${html(p.name)}">${PRICE_LABELS.map((label,plan)=>`<option value="${plan}" ${row.plan===plan?'selected':''}>${label} · ${price(p.prices[plan])}</option>`).join('')}</select></label>
  <div class="cart-bottom"><strong>${price(p.prices[row.plan]*row.qty)}</strong><div class="qty-control"><button data-qty="${i}" data-delta="-1" aria-label="Kurangi jumlah ${html(p.name)}">−</button><span>${row.qty}</span><button data-qty="${i}" data-delta="1" aria-label="Tambah jumlah ${html(p.name)}">+</button></div></div></div></article>`;}).join('');
 const empty=cart.length===0;el('emptyCart').hidden=!empty;el('cartSummary').hidden=empty;el('subtotal').textContent=price(totalCart());el('checkoutTotal').textContent=price(totalCart());
 const amount=countCart(); el('cartBadge').textContent=amount;el('navCartBadge').textContent=amount;el('cartBadge').hidden=amount===0;el('navCartBadge').hidden=amount===0;
}
function repaint(){paintHome();paintCatalog();paintFavorites();paintCart();}
function setView(view){
 if(!['home','catalog','favorites','cart'].includes(view))view='home';currentView=view;
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
 document.querySelectorAll('.nav-item').forEach(b=>{const selected=b.dataset.view===view;b.classList.toggle('selected',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(location.hash!==`#${view}`) history.replaceState({},'',`#${view}`);
 if(view==='cart') paintCart(); if(view==='catalog')paintCatalog(); if(view==='favorites')paintFavorites();
 window.scrollTo({top:0,behavior:'instant'});
}
function addToCart(id,plan){
 const existing=cart.find(r=>r.id===id&&r.plan===plan);
 if(existing){existing.qty=Math.min(existing.qty+1,99);}else{cart.push({id,plan,qty:1});}
 save();paintCart();toast('Berhasil masuk keranjang ♡');
}
function openProduct(id){
 const p=productById(id);if(!p)return;chosenProduct=p;chosenPlan=1;
 paintDetail();el('productDialog').showModal();
}
function paintDetail(){const p=chosenProduct;if(!p)return;const liked=favorites.includes(p.id);
 el('productDetail').innerHTML=`<div class="modal-topline"><span class="overline">PICK YOUR PLAN</span><button class="close-button" data-close aria-label="Tutup">×</button></div>
  <div class="detail-intro"><span class="detail-art" style="--art-tint:${html(p.color)}"><img src="${icon(p)}" alt="Ikon ${html(p.name)}"/></span><div><span class="product-category">${html(p.category)}</span><h2>${html(p.name)}</h2><p>${html(p.tag)}</p></div></div>
  <div class="detail-help">Pilih durasi paket</div><div class="plan-grid">${PRICE_LABELS.map((label,i)=>`<button class="plan-choice ${chosenPlan===i?'selected':''}" data-plan="${i}" aria-pressed="${chosenPlan===i}"><strong>${label}</strong><small>${PRICE_DURATIONS[i]}</small><b>${price(p.prices[i])}</b></button>`).join('')}</div>
  <div class="detail-total"><span>Total untuk 1 paket</span><strong>${price(p.prices[chosenPlan])}</strong></div>
  <div class="detail-actions"><button id="addProductBtn" class="checkout-button">Tambah ke keranjang <span>↗</span></button><button class="outline-cta icon-heart ${liked?'liked':''}" data-favorite="${p.id}" aria-label="Favorit">${liked?'♥':'♡'}</button></div>
  <p class="detail-note">Harga di atas hanya contoh, bukan harga resmi penyedia aplikasi. Konfirmasi legalitas paket dan ketersediaan dengan toko sebelum pembayaran.</p>`;
}
function toggleFavorite(id){if(favorites.includes(id))favorites=favorites.filter(f=>f!==id);else favorites.push(id);save();paintHome();paintCatalog();paintFavorites();if(el('productDialog').open) paintDetail();toast(favorites.includes(id)?'Ditambahkan ke favorit ♡':'Dihapus dari favorit');}
function openCheckout(){if(!cart.length){toast('Keranjangmu masih kosong');return;}el('checkoutForm').hidden=false;el('orderResult').hidden=true;el('checkoutTotal').textContent=price(totalCart());el('checkoutDialog').showModal();}
function makeOrder(form){
 const name=form.buyerName.value.trim(), phone=form.buyerPhone.value.trim(), note=form.note.value.trim();
 if(!name||!phone)return null;
 const lines=[`🌿 PESANAN ${settings.name.toUpperCase()}`,`Kode: LP-${new Date().getTime().toString().slice(-9)}`,`Tanggal: ${new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}`,'',`Nama: ${name}`,`WhatsApp: ${phone}`,'','Pesanan:'];
 cart.forEach((row,i)=>{const p=productById(row.id);lines.push(`${i+1}. ${p.name} - ${PRICE_LABELS[row.plan]} × ${row.qty}`,`   ${price(p.prices[row.plan]*row.qty)}`);});
 lines.push('',`TOTAL ESTIMASI: ${price(totalCart())}`);if(note)lines.push(`Catatan: ${note}`);
 lines.push('','Mohon konfirmasi ketersediaan, jenis paket, dan harga sebelum pembayaran.');return lines.join('\n');
}
function finishOrder(){cart=[];save();paintCart();el('checkoutDialog').close();setView('home');toast('Terima kasih! Silakan konfirmasi ke penjual.');}
function saveSettings(e){e.preventDefault();const fd=new FormData(e.currentTarget);const name=String(fd.get('storeName')||'').trim();const wa=String(fd.get('storeWhatsapp')||'').replace(/\D/g,'');if(!name){toast('Nama toko tidak boleh kosong');return;}settings={...settings,name,whatsapp:wa};setLocal('settings',settings);showStoreName();el('settingsDialog').close();toast('Pengaturan tersimpan di perangkat ini');}
function showStoreName(){el('storeName').textContent=settings.name;document.title=`${settings.name} — Toko Aplikasi Premium`;}
function openSettings(){el('settingsForm').elements.storeName.value=settings.name;el('settingsForm').elements.storeWhatsapp.value=settings.whatsapp;el('settingsDialog').showModal();}
async function copyOrder(){const txt=el('orderText').value;try{await navigator.clipboard.writeText(txt);toast('Pesanan berhasil disalin ✓');}catch{el('orderText').focus();el('orderText').select();try{document.execCommand('copy');toast('Pesanan disalin ✓');}catch{toast('Tekan lama teks untuk menyalin');}}}
function initListeners(){
 document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){close.closest('dialog')?.close();return;}
  const view=e.target.closest('[data-view]');if(view){setView(view.dataset.view);return;}
  const favor=e.target.closest('[data-favorite]');if(favor){toggleFavorite(favor.dataset.favorite);return;}
  const prod=e.target.closest('[data-product]');if(prod){openProduct(prod.dataset.product);return;}
  const filt=e.target.closest('[data-filter]');if(filt){currentFilter=filt.dataset.filter;paintCatalog();return;}
  const cat=e.target.closest('[data-category-go]');if(cat){currentFilter=cat.dataset.categoryGo;currentSearch='';el('searchInput').value='';setView('catalog');return;}
  const plan=e.target.closest('[data-plan]');if(plan){chosenPlan=Number(plan.dataset.plan);paintDetail();return;}
  if(e.target.closest('#addProductBtn')){addToCart(chosenProduct.id,chosenPlan);el('productDialog').close();return;}
  const rm=e.target.closest('[data-remove]');if(rm){cart.splice(Number(rm.dataset.remove),1);save();paintCart();toast('Paket dihapus');return;}
  const qty=e.target.closest('[data-qty]');if(qty){const i=Number(qty.dataset.qty),d=Number(qty.dataset.delta);if(!cart[i])return;cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);else cart[i].qty=Math.min(cart[i].qty,99);save();paintCart();return;}
 });
 el('searchInput').addEventListener('input',e=>{currentSearch=e.target.value;paintCatalog();});
 el('clearSearch').addEventListener('click',()=>{currentSearch='';currentFilter='Semua';el('searchInput').value='';paintCatalog();});
 el('cartList').addEventListener('change',e=>{const select=e.target.closest('[data-cart-plan]');if(!select)return;const i=Number(select.dataset.cartPlan);if(cart[i]){cart[i].plan=Number(select.value);const first=cart.findIndex((row,j)=>j!==i&&row.id===cart[i].id&&row.plan===cart[i].plan);if(first!==-1){cart[first].qty+=cart[i].qty;cart.splice(i,1);}save();paintCart();}});
 el('checkoutBtn').addEventListener('click',openCheckout);
 el('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();const msg=makeOrder(e.currentTarget.elements);if(!msg)return;
  el('orderText').value=msg;el('checkoutForm').hidden=true;el('orderResult').hidden=false;
  const wa=String(settings.whatsapp||'').replace(/\D/g,'');
  el('waOrderBtn').hidden=!wa;el('orderHelp').textContent=wa?'Kirim detail berikut ke WhatsApp penjual untuk konfirmasi.':'Nomor WhatsApp toko belum diisi. Salin pesanan ini dan kirim ke penjual.';
  if(wa)el('waOrderBtn').href=`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  el('orderResult').scrollIntoView({block:'nearest'});
 });
 el('copyOrderBtn').addEventListener('click',copyOrder);
 el('finishOrderBtn').addEventListener('click',finishOrder);
 el('settingsBtn').addEventListener('click',openSettings);
 el('settingsForm').addEventListener('submit',saveSettings);
 el('installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;}else el('installDialog').showModal();});
 el('brandHome').addEventListener('click',()=>setView('home'));
 el('brandHome').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setView('home');}});
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
 window.addEventListener('hashchange',()=>setView(location.hash.replace('#','')));
}
showStoreName();initListeners();repaint();setView(location.hash.replace('#','')||'home');
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.info('SW',err)));}
})();
