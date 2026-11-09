const starterProducts = [
  { id: 'p1', name: 'Camiseta Motion Pro', category: 'training', price: 29.99, stock: 18, emoji: '👕' },
  { id: 'p2', name: 'Zapatillas Velocity', category: 'running', price: 84.50, stock: 7, emoji: '👟' },
  { id: 'p3', name: 'Balón Match Elite', category: 'football', price: 34.00, stock: 12, emoji: '⚽' },
  { id: 'p4', name: 'Leggings Flex', category: 'training', price: 42.00, stock: 0, emoji: '🏃' },
  { id: 'p5', name: 'Botella Active', category: 'accessories', price: 16.50, stock: 24, emoji: '🥤' },
  { id: 'p6', name: 'Gorra Run Club', category: 'running', price: 21.00, stock: 9, emoji: '🧢' }
];

const categoryNames = {
  running: 'Running',
  training: 'Entrenamiento',
  football: 'Fútbol',
  accessories: 'Accesorios'
};

const storageKeys = {
  products: 'anezky-products-v2',
  sales: 'anezky-sales-v1',
  expenses: 'anezky-expenses-v1'
};

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const products = load(storageKeys.products, starterProducts);
let sales = load(storageKeys.sales, []);
let expenses = load(storageKeys.expenses, []);

const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const safe = (string) => String(string).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dateLabel = (isoDate) => new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(`${isoDate}T12:00:00`));

function persist() {
  localStorage.setItem(storageKeys.products, JSON.stringify(products));
  localStorage.setItem(storageKeys.sales, JSON.stringify(sales));
  localStorage.setItem(storageKeys.expenses, JSON.stringify(expenses));
}

function total(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function renderProducts() {
  const query = $('#search').value.trim().toLocaleLowerCase('es');
  const category = $('#category').value;

  const filtered = products.filter((product) => {
    const matchName = product.name.toLocaleLowerCase('es').includes(query);
    const matchCategory = category === 'all' || product.category === category;
    return matchName && matchCategory;
  });

  $('#product-count').textContent = products.length;
  $('#stock-count').textContent = products.reduce((sum, p) => sum + Number(p.stock), 0);
  $('#empty-state').hidden = filtered.length > 0;

  $('#product-grid').innerHTML = filtered.map((product, index) => {
    const stockStatus = product.stock === 0 ? 'Agotado' : `${product.stock} uds.`;
    const stockClass = product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : '';

    return `
      <article class="product-card">
        <div class="product-image">
          <span class="category-pill">${categoryNames[product.category] || 'Deporte'}</span>
          <span class="product-emoji" aria-hidden="true">${safe(product.emoji || '🏅')}</span>
          <span class="image-index">0${index + 1}</span>
        </div>
        <div class="product-info">
          <div class="product-title-row">
            <h3>${safe(product.name)}</h3>
            <span class="stock-dot ${stockClass}" title="${stockStatus}"></span>
          </div>
          <div class="product-meta">
            <span>${stockStatus}</span>
            <strong>${money(product.price)}</strong>
          </div>
          <button class="buy-button" type="button" data-sell="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>Registrar venta ↗</button>
        </div>
      </article>
    `;
  }).join('');

  $('#inventory-list').innerHTML = products.map((product) => `
    <div class="inventory-row">
      <span class="inventory-emoji" aria-hidden="true">${safe(product.emoji || '🏅')}</span>
      <div class="inventory-name">
        <strong>${safe(product.name)}</strong>
        <small>${categoryNames[product.category] || 'Deporte'}</small>
      </div>
      <span class="inventory-stock">${product.stock} uds.</span>
      <strong>${money(product.price)}</strong>
      <div class="row-actions">
        <button type="button" data-edit="${product.id}">Editar</button>
        <button type="button" class="delete-button" data-delete="${product.id}">Eliminar</button>
      </div>
    </div>
  `).join('') || '<p class="empty-state">Aún no hay productos.</p>';
}

function renderMovements() {
  const salesTotal = total(sales);
  const expensesTotal = total(expenses);
  const profit = salesTotal - expensesTotal;

  $('#sales-total').textContent = money(salesTotal);
  $('#expenses-total').textContent = money(expensesTotal);
  $('#profit-total').textContent = money(profit);
  $('#profit-total').classList.toggle('negative', profit < 0);
  $('#profit-sales').textContent = money(salesTotal);
  $('#profit-expenses').textContent = `−${money(expensesTotal)}`;
  $('#sales-count').textContent = `${sales.length} ${sales.length === 1 ? 'registro' : 'registros'}`;
  $('#expenses-count').textContent = `${expenses.length} ${expenses.length === 1 ? 'registro' : 'registros'}`;

  const renderRows = (list, type) => list.slice().reverse().map((item) => `
    <div class="movement-row">
      <div>
        <strong>${safe(item.description)}</strong>
        <small>${dateLabel(item.date)}</small>
      </div>
      <b class="${type === 'expense' ? 'red' : ''}">${type === 'expense' ? '−' : '+'}${money(item.amount)}</b>
      <button type="button" class="remove-movement" data-remove="${item.id}" data-type="${type}" aria-label="Eliminar registro">×</button>
    </div>
  `).join('') || '<p class="empty-state">Todavía no hay registros.</p>';

  $('#sales-list').innerHTML = renderRows(sales, 'sale');
  $('#expenses-list').innerHTML = renderRows(expenses, 'expense');
}

function render() {
  renderProducts();
  renderMovements();
}

function openProduct(product) {
  $('#product-form').reset();
  $('#product-id').value = product?.id || '';
  $('#dialog-title').textContent = product ? 'Editar producto' : 'Añadir producto';
  $('#name').value = product?.name || '';
  $('#product-category').value = product?.category || 'training';
  $('#price').value = product?.price ?? '';
  $('#stock').value = product?.stock ?? '';
  $('#emoji').value = product?.emoji || '';
  $('#product-dialog').showModal();
}

function openMovement(type, description = '') {
  $('#movement-form').reset();
  $('#movement-type').value = type;
  $('#movement-title').textContent = type === 'sale' ? 'Registrar venta' : 'Registrar gasto';
  $('#movement-eyebrow').textContent = type === 'sale' ? 'INGRESO DEL NEGOCIO' : 'EGRESO DEL NEGOCIO';
  $('#movement-description').placeholder = type === 'sale' ? 'Ej. Venta de camiseta' : 'Ej. Compra de mercancía';
  $('#movement-description').value = description;
  $('#movement-date').value = new Date().toISOString().slice(0, 10);
  $('#movement-dialog').showModal();
}

$('#search').addEventListener('input', renderProducts);
$('#category').addEventListener('change', renderProducts);
$('#add-product').addEventListener('click', () => openProduct());
$('#add-sale').addEventListener('click', () => openMovement('sale'));
$('#add-expense').addEventListener('click', () => openMovement('expense'));

$('#product-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const item = {
    id: $('#product-id').value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    name: $('#name').value.trim(),
    category: $('#product-category').value,
    price: Number($('#price').value),
    stock: Number($('#stock').value),
    emoji: $('#emoji').value.trim() || '🏅'
  };

  const existing = products.findIndex((product) => product.id === item.id);

  if (existing >= 0) {
    products[existing] = item;
  } else {
    products.unshift(item);
  }

  persist();
  render();
  $('#product-dialog').close();
});

$('#movement-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const type = $('#movement-type').value;
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    description: $('#movement-description').value.trim(),
    amount: Number($('#movement-amount').value),
    date: $('#movement-date').value
  };

  if (type === 'sale') sales.push(entry);
  else expenses.push(entry);

  persist();
  render();
  $('#movement-dialog').close();
});

document.addEventListener('click', (event) => {
  const sellButton = event.target.closest('[data-sell]');
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');
  const removeButton = event.target.closest('[data-remove]');
  const closeButton = event.target.closest('[data-close]');

  if (closeButton) {
    const dialog = closeButton.closest('dialog');
    if (dialog) dialog.close();
  }

  if (sellButton) {
    const product = products.find((item) => item.id === sellButton.dataset.sell);
    if (product) openMovement('sale', product.name);
  }

  if (editButton) {
    const product = products.find((item) => item.id === editButton.dataset.edit);
    if (product) openProduct(product);
  }

  if (deleteButton && window.confirm('¿Eliminar este producto del inventario?')) {
    const index = products.findIndex((item) => item.id === deleteButton.dataset.delete);
    if (index >= 0) products.splice(index, 1);
    persist();
    render();
  }

  if (removeButton && window.confirm('¿Eliminar este registro?')) {
    const type = removeButton.dataset.type;
    const list = type === 'sale' ? sales : expenses;
    const index = list.findIndex((item) => item.id === removeButton.dataset.remove);
    if (index >= 0) list.splice(index, 1);
    persist();
    render();
  }
});

[document.querySelector('#product-dialog'), document.querySelector('#movement-dialog')].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

render();
