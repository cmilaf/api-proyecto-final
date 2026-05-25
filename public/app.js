const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token') || '';
let authMode = 'login'; 
let cart = [];

const authView = document.getElementById('auth-view');
const shopView = document.getElementById('shop-view');
const ordersView = document.getElementById('orders-view');
const navActions = document.getElementById('nav-actions');

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    if (token) {
        showShopView();
    } else {
        showAuthView();
    }
}

function showAuthView() {
    authView.classList.remove('hidden');
    shopView.classList.add('hidden');
    ordersView.classList.add('hidden');
    navActions.innerHTML = '';
}

async function showShopView() {
    authView.classList.add('hidden');
    shopView.classList.remove('hidden');
    ordersView.classList.add('hidden');
    
    navActions.innerHTML = `
        <span style="margin-right:1rem;">Hello, <b>${localStorage.getItem('username')}</b></span>
        <button id="btn-view-orders">My Orders</button>
        <button id="btn-logout" style="margin-left:0.5rem;">Logout</button>
    `;

    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('btn-view-orders').addEventListener('click', showOrdersView);

    fetchProducts();
}

async function showOrdersView() {
    authView.classList.add('hidden');
    shopView.classList.add('hidden');
    ordersView.classList.remove('hidden');
    fetchOrders();
}

function setupEventListeners() {
    document.getElementById('auth-toggle-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (authMode === 'login') {
            authMode = 'register';
            document.getElementById('auth-title').innerText = 'Create Account';
            document.getElementById('btn-submit-auth').innerText = 'Register';
            document.getElementById('auth-toggle-msg').innerText = 'Already have an account?';
            document.getElementById('auth-toggle-link').innerText = 'Login here';
        } else {
            authMode = 'login';
            document.getElementById('auth-title').innerText = 'Welcome to Navia';
            document.getElementById('btn-submit-auth').innerText = 'Login';
            document.getElementById('auth-toggle-msg').innerText = "Don't have an account?";
            document.getElementById('auth-toggle-link').innerText = 'Register here';
        }
    });

    document.getElementById('btn-submit-auth').addEventListener('click', handleAuth);

    document.getElementById('search-input').addEventListener('input', (e) => {
        fetchProducts(e.target.value);
    });

    document.getElementById('btn-back-shop').addEventListener('click', showShopView);
    document.getElementById('btn-checkout').addEventListener('click', handleCheckout);
}

async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) return alert('Fill out all inputs');

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        if (authMode === 'login') {
            token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);
            showShopView();
        } else {
            alert('Registration complete! Please login.');
            document.getElementById('auth-toggle-link').click();
        }
    } catch (err) {
        alert(err.message);
    }
}

async function fetchProducts(query = '') {
    const endpoint = query ? `/products/search?q=${encodeURIComponent(query)}` : '/products';
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await response.json();

        const container = document.getElementById('products-container');
        container.innerHTML = '';

        // Enlaces de imágenes provistos para el renderizado cíclico automático
        const sampleImages = [
            'https://marieclaire.com.mx/wp-content/uploads/2024/09/el-silencio-de-los-corderos-libros-de-misterio-1068x1582.jpg',
            'https://m.media-amazon.com/images/I/71OsAlMcW-L._SL1500_.jpg',
            'https://www.penguinlibros.com/es/3168246-thickbox_default/keeping-13-los-chicos-de-tommen-2.jpg',
            'https://m.media-amazon.com/images/I/81LTEfXYgcL.jpg?auto_optimize=low&width=655',
            'https://tse4.mm.bing.net/th/id/OIP.XSjNVHVMAaSjlm19QC_U7QHaLP?rs=1&pid=ImgDetMain&o=7&rm=3',
            'https://marieclaire.com.mx/wp-content/uploads/2024/10/libros-de-fantasia-recomendaciones-6-768x1138.jpg'
        ];

        products.forEach((product, idx) => {
            const imgUrl = sampleImages[idx % sampleImages.length];
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${imgUrl}" class="product-image" alt="Book cover">
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-desc">${product.description || 'No description available'}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="product-price">$${Number(product.price).toFixed(2)}</span>
                        <span class="product-stock">Stock: ${product.stock}</span>
                    </div>
                    <button class="btn-action" style="margin-top:1rem; padding:0.5rem;" ${product.stock === 0 ? 'disabled' : ''} onclick="addToCart(${product.id}, '${product.name}', ${product.price}, ${product.stock})">
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

window.addToCart = function(id, name, price, stock) {
    const existing = cart.find(item => item.product_id === id);
    if (existing) {
        if (existing.quantity >= stock) return alert('Cannot add more than available stock.');
        existing.quantity++;
    } else {
        cart.push({ product_id: id, name, price, quantity: 1, stock });
    }
    renderCart();
};

function renderCart() {
    const container = document.getElementById('cart-container');
    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <span><b>${item.name}</b> (x${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('cart-total').innerText = total.toFixed(2);
}

async function handleCheckout() {
    if (cart.length === 0) return alert('Your cart is empty');
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        alert('Purchase successful! Happy reading.');
        cart = [];
        renderCart();
        fetchProducts();
    } catch (err) {
        alert(err.message);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();
        const container = document.getElementById('orders-container');
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p>You have not placed any orders yet.</p>';
            return;
        }

        orders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'order-card';
            let itemsHtml = order.items.map(i => `<li>${i.name} - ${i.quantity} unit(s) x $${Number(i.price_at_purchase).toFixed(2)}</li>`).join('');
            div.innerHTML = `
                <p><strong>Order ID:</strong> #${order.id} | <strong>Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
                <ul>${itemsHtml}</ul>
                <p><strong>Total Amount Paid:</strong> <span style="color:var(--primary-color); font-weight:bold;">$${Number(order.total_amount).toFixed(2)}</span></p>
                <hr style="border: 0; border-top: 1px dashed var(--border-color);">
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    localStorage.clear();
    token = '';
    cart = [];
    showAuthView();
}