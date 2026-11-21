// ===== Config & helpers =====
const KEYS = { cart: 'shop_cart', users: 'shop_users', session: 'shop_session', orders: 'shop_orders' };
const NAV = [['index.html', 'Home'], ['products.html', 'Products'], ['cart.html', 'Cart'], ['contact.html', 'Contact']];

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + Number(n).toFixed(2);
const $ = sel => document.querySelector(sel);
const params = new URLSearchParams(location.search);

// ===== Cart (stored in localStorage so it persists across pages) =====
const Cart = {
  items() { return store.get(KEYS.cart, []); },
  save(items) { store.set(KEYS.cart, items); badge(); },
  add(id, qty = 1) {
    const items = this.items();
    const row = items.find(i => i.id === id);
    if (row) row.qty += qty; else items.push({ id, qty });
    this.save(items);
  },
  setQty(id, qty) { this.save(this.items().map(i => i.id === id ? { ...i, qty } : i).filter(i => i.qty > 0)); },
  remove(id) { this.save(this.items().filter(i => i.id !== id)); },
  clear() { this.save([]); },
  count() { return this.items().reduce((n, i) => n + i.qty, 0); }
};

// ===== Products: fetched and parsed from products.xml =====
let cache = null;
async function loadProducts() {
  if (cache) return cache;
  const res = await fetch('products.xml');
  if (!res.ok) throw new Error('Could not load products.xml (HTTP ' + res.status + ').');
  const doc = new DOMParser().parseFromString(await res.text(), 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('products.xml is not well-formed XML.');
  const get = (node, tag) => node.querySelector(tag)?.textContent.trim() ?? '';
  cache = [...doc.querySelectorAll('product')].map(p => ({
    id: p.getAttribute('id'),
    name: get(p, 'name'),
    category: get(p, 'category'),
    price: parseFloat(get(p, 'price')),
    stock: parseInt(get(p, 'stock'), 10) || 0,
    emoji: get(p, 'emoji'),
    description: get(p, 'description')
  }));
  return cache;
}
const findProduct = async id => (await loadProducts()).find(p => p.id === id);
const cartLines = async () => {
  const all = await loadProducts();
  return Cart.items().map(i => ({ qty: i.qty, product: all.find(p => p.id === i.id) })).filter(l => l.product);
};

// ===== Auth (demo only: accounts are kept in localStorage) =====
const Auth = {
  user() { return store.get(KEYS.session, null); },
  logout() { localStorage.removeItem(KEYS.session); location.href = 'index.html'; }
};

// ===== UI helpers =====
function badge() { const el = $('#cart-count'); if (el) el.textContent = Cart.count(); }

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 2200);
}

function renderChrome() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const user = Auth.user();
  $('#site-header').innerHTML = `
    <div class="container nav">
      <a href="index.html" class="brand">🛍️ ShopEasy</a>
      <nav>
        ${NAV.map(([href, label]) => `<a href="${href}" class="${href === here ? 'active' : ''}">${label}${href === 'cart.html' ? ' (<span id="cart-count">0</span>)' : ''}</a>`).join('')}
        ${user
          ? `<a href="#" id="logout">Logout (${esc(user.name)})</a>`
          : `<a href="login.html" class="${here === 'login.html' ? 'active' : ''}">Login</a>`}
      </nav>
    </div>`;
  $('#site-footer').innerHTML = `<div class="container">© ${new Date().getFullYear()} ShopEasy · Demo store</div>`;
}

const card = p => `
  <article class="card">
    <a href="product.html?id=${esc(p.id)}" class="thumb" aria-label="${esc(p.name)}">${esc(p.emoji)}</a>
    <div class="card-body">
      <span class="tag">${esc(p.category)}</span>
      <h3><a href="product.html?id=${esc(p.id)}">${esc(p.name)}</a></h3>
      <p class="price">${money(p.price)}</p>
      <button class="btn" data-add="${esc(p.id)}" ${p.stock < 1 ? 'disabled' : ''}>${p.stock < 1 ? 'Out of stock' : 'Add to cart'}</button>
    </div>
  </article>`;

// Global click handling: add-to-cart buttons and logout
document.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    Cart.add(addBtn.dataset.add);
    toast('Added to cart');
  }
  if (e.target.id === 'logout') {
    e.preventDefault();
    Auth.logout();
  }
});

// ===== Page controllers, selected by <body data-page="..."> =====
const pages = {
  async index() {
    $('#featured').innerHTML = (await loadProducts()).slice(0, 3).map(card).join('');
  },

  async products() {
    const all = await loadProducts();
    const cats = [...new Set(all.map(p => p.category))].sort();
    $('#category').innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      const cat = $('#category').value;
      const sort = $('#sort').value;
      const list = all
        .filter(p => (!cat || p.category === cat) && p.name.toLowerCase().includes(q))
        .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : a.name.localeCompare(b.name));
      $('#grid').innerHTML = list.length ? list.map(card).join('') : '<p class="muted">No products match your filters.</p>';
    };
    ['#search', '#category', '#sort'].forEach(sel => $(sel).addEventListener('input', draw));
    draw();
  },

  async product() {
    const p = await findProduct(params.get('id'));
    if (!p) {
      $('#detail').innerHTML = '<p>Product not found. <a href="products.html">Back to products</a></p>';
      return;
    }
    document.title = p.name + ' · ShopEasy';
    const out = p.stock < 1;
    $('#detail').innerHTML = `
      <div class="thumb big">${esc(p.emoji)}</div>
      <div>
        <span class="tag">${esc(p.category)}</span>
        <h1>${esc(p.name)}</h1>
        <p class="price big">${money(p.price)}</p>
        <p>${esc(p.description)}</p>
        <p class="muted">${out ? 'Out of stock' : p.stock + ' in stock'}</p>
        <div class="row">
          <input type="number" id="qty" min="1" max="${p.stock}" value="1" ${out ? 'disabled' : ''}>
          <button class="btn" id="add" ${out ? 'disabled' : ''}>Add to cart</button>
        </div>
      </div>`;
    $('#add')?.addEventListener('click', () => {
      const qty = Math.min(Math.max(parseInt($('#qty').value, 10) || 1, 1), p.stock);
      Cart.add(p.id, qty);
      toast(`Added ${qty} × ${p.name}`);
    });
  },

  async cart() {
    const render = async () => {
      const lines = await cartLines();
      if (!lines.length) {
        $('#cart').innerHTML = '<p>Your cart is empty.</p><a class="btn" href="products.html">Browse products</a>';
        return;
      }
      const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
      $('#cart').innerHTML = `
        <table class="cart-table">
          <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>${lines.map(l => `
            <tr>
              <td>${esc(l.product.emoji)} ${esc(l.product.name)}</td>
              <td>${money(l.product.price)}</td>
              <td><input type="number" min="1" class="qty" value="${l.qty}" data-qty="${esc(l.product.id)}"></td>
              <td>${money(l.product.price * l.qty)}</td>
              <td><button class="link" data-remove="${esc(l.product.id)}">Remove</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="summary">
          <p>Total: <strong>${money(total)}</strong></p>
          <a class="btn" href="checkout.html">Proceed to checkout</a>
        </div>`;
    };
    // Listeners are attached once to the stable container; only its contents re-render.
    $('#cart').addEventListener('change', e => {
      if (e.target.dataset.qty) {
        Cart.setQty(e.target.dataset.qty, Math.max(1, parseInt(e.target.value, 10) || 1));
        render();
      }
    });
    $('#cart').addEventListener('click', e => {
      if (e.target.dataset.remove) {
        Cart.remove(e.target.dataset.remove);
        render();
      }
    });
    return render();
  },

  async checkout() {
    if (!Auth.user()) {
      location.href = 'login.html?next=checkout.html';
      return;
    }
    const lines = await cartLines();
    if (!lines.length) {
      $('#checkout').innerHTML = '<p>Your cart is empty. <a href="products.html">Shop now</a></p>';
      return;
    }
    const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    $('#order-summary').innerHTML = lines.map(l =>
      `<li><span>${esc(l.product.name)} × ${l.qty}</span><span>${money(l.product.price * l.qty)}</span></li>`).join('') +
      `<li class="total"><span>Total</span><span>${money(total)}</span></li>`;

    $('#checkout-form').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const d = Object.fromEntries(new FormData(form));
      const orders = store.get(KEYS.orders, []);
      const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        user: Auth.user().email,
        items: lines.map(l => ({ id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price })),
        total,
        shipping: { name: d.name, address: d.address, city: d.city, zip: d.zip }
      };
      orders.push(order);
      store.set(KEYS.orders, orders);
      Cart.clear();
      $('#checkout').innerHTML = `
        <div class="notice success">
          <h2>Thank you, ${esc(d.name)}!</h2>
          <p>Your order <strong>${order.id}</strong> for ${money(total)} has been placed.</p>
          <a class="btn" href="products.html">Continue shopping</a>
        </div>`;
    });
  },

  login() {
    const next = params.get('next') || 'index.html';
    const users = () => store.get(KEYS.users, []);
    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
      $('#login-form').hidden = btn.dataset.tab !== 'login';
      $('#register-form').hidden = btn.dataset.tab !== 'register';
    }));

    $('#login-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const u = users().find(x => x.email === f.get('email').toLowerCase() && x.password === f.get('password'));
      if (!u) { $('#login-msg').textContent = 'Invalid email or password.'; return; }
      store.set(KEYS.session, { name: u.name, email: u.email });
      location.href = next;
    });

    $('#register-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const email = f.get('email').toLowerCase();
      const list = users();
      if (list.some(x => x.email === email)) { $('#reg-msg').textContent = 'That email is already registered.'; return; }
      if (f.get('password').length < 6) { $('#reg-msg').textContent = 'Password must be at least 6 characters.'; return; }
      const user = { name: f.get('name').trim(), email, password: f.get('password') };
      list.push(user);
      store.set(KEYS.users, list);
      store.set(KEYS.session, { name: user.name, email: user.email });
      location.href = next;
    });
  },

  contact() {
    $('#contact-form').addEventListener('submit', e => {
      e.preventDefault();
      if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
      e.target.reset();
      $('#contact-msg').textContent = 'Thanks! We will get back to you within 1–2 business days.';
      $('#contact-msg').classList.add('ok');
    });
  }
};

// ===== Boot =====
document.addEventListener('DOMContentLoaded', async () => {
  renderChrome();
  badge();
  try {
    await pages[document.body.dataset.page]?.();
  } catch (err) {
    document.querySelector('main').insertAdjacentHTML('afterbegin', `<div class="notice error">${esc(err.message)}</div>`);
  }
});

