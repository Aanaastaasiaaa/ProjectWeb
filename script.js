// ========== МЕНЮ ==========
const menu = [
    { name: "Маргарита", price: 450 },
    { name: "Пепперони", price: 550 },
    { name: "Четыре сыра", price: 600 },
    { name: "Карбонара", price: 420 },
    { name: "Цезарь", price: 350 },
    { name: "Coca-Cola", price: 120 },
    { name: "Тирамису", price: 280 }
];

// Корзина
let cart = [];

// Загрузка меню
function loadMenu() {
    const container = document.getElementById('menuList');
    container.innerHTML = '';
    menu.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <span>${item.name} - ${item.price} ₽</span>
            <button onclick="addToCart('${item.name}', ${item.price})">+</button>
        `;
        container.appendChild(div);
    });
}

// Добавление в корзину
function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    renderCart();
}

// Отображение корзины
function renderCart() {
    const container = document.getElementById('cart');
    const totalSpan = document.getElementById('totalPrice');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = 'Корзина пуста';
        totalSpan.innerText = '0';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        html += `
            <div class="cart-item">
                <span>${item.name} x${item.qty} = ${item.price * item.qty} ₽</span>
                <button class="remove-btn" onclick="removeFromCart(${idx})">Удалить</button>
            </div>
        `;
    });
    container.innerHTML = html;
    totalSpan.innerText = total;
}

// Удаление из корзины
function removeFromCart(idx) {
    cart.splice(idx, 1);
    renderCart();
}

// ========== ОТПРАВКА ЗАКАЗА НА API ==========
document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;
    const address = document.getElementById('userAddress').value;

    if (!name || !phone) {
        alert('Заполните имя и телефон');
        return;
    }
    if (cart.length === 0) {
        alert('Добавьте хотя бы одну позицию');
        return;
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const orderData = {
        name, phone, email, address,
        items: cart,
        total
    };

    try {
        const response = await fetch('/api.php/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.login && result.password) {
                // Показываем логин/пароль (как в задании 5)
                document.getElementById('credsLogin').innerText = result.login;
                document.getElementById('credsPassword').innerText = result.password;
                document.getElementById('credsModal').style.display = 'block';
            }
            alert('Заказ оформлен!');
            cart = [];
            renderCart();
            document.getElementById('orderForm').reset();
        } else {
            alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
    }
});

function closeCredsModal() {
    document.getElementById('credsModal').style.display = 'none';
}

// Загрузка меню при старте
loadMenu();
