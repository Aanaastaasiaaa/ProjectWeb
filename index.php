<?php
session_start();

// ========== ПОДКЛЮЧЕНИЕ К БД ==========
$host = 'localhost';
$dbname = 'u82277';
$user = 'u82277';
$pass = '1452026';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Ошибка БД: " . $e->getMessage());
}

// ========== ОБРАБОТКА ЗАПРОСОВ ==========
$action = $_GET['action'] ?? '';

// РЕГИСТРАЦИЯ
if ($action === 'register') {
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $address = $_POST['address'] ?? '';
    
    if (!$name || !$phone) {
        echo json_encode(['error' => 'Имя и телефон обязательны']);
        exit;
    }
    
    $login = 'user_' . bin2hex(random_bytes(4));
    $password = bin2hex(random_bytes(8));
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (full_name, phone, email, address, login, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $phone, $email, $address, $login, $hash]);
        echo json_encode(['success' => true, 'login' => $login, 'password' => $password]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Ошибка: ' . $e->getMessage()]);
    }
    exit;
}

// ВХОД
if ($action === 'login') {
    $login = $_POST['login'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['error' => 'Неверный логин или пароль']);
    }
    exit;
}

// ВЫХОД
if ($action === 'logout') {
    session_destroy();
    header('Location: index.php');
    exit;
}

// ЗАКАЗ
if ($action === 'order') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Не авторизован']);
        exit;
    }
    
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $address = $_POST['address'] ?? '';
    $items = $_POST['items'] ?? '';
    $total = $_POST['total'] ?? 0;
    
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, items, total_price, status) VALUES (?, ?, ?, 'new')");
    $stmt->execute([$_SESSION['user_id'], $items, $total]);
    
    echo json_encode(['success' => true]);
    exit;
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PizzaMania - Лучшая пицца в городе</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; background: #f8f9fa; padding-top: 130px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; background: #dc3545; z-index: 1000; padding: 15px 0; }
        .nav-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .logo { font-size: 1.8rem; font-weight: 700; color: white; text-decoration: none; }
        .logo span { color: #ffd700; }
        .nav-menu { display: flex; list-style: none; gap: 30px; align-items: center; }
        .nav-link { color: white; text-decoration: none; font-weight: 500; }
        .nav-link:hover { color: #ffd700; }
        .dropdown { position: relative; }
        .dropdown-menu { position: absolute; top: 100%; left: 0; background: white; min-width: 200px; border-radius: 5px; opacity: 0; visibility: hidden; transition: 0.3s; list-style: none; padding: 10px 0; }
        .dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; }
        .dropdown-menu a { display: block; padding: 10px 20px; color: #333; text-decoration: none; }
        .dropdown-menu a:hover { background: #f8f9fa; color: #dc3545; }
        .login-btn { background: #ffd700; color: #333 !important; padding: 8px 20px; border-radius: 5px; }
        .btn { background: #dc3545; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; transition: 0.3s; }
        .btn:hover { background: #c82333; transform: translateY(-2px); }
        .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; margin-top: 30px; }
        .menu-item { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: 0.3s; }
        .menu-item:hover { transform: translateY(-5px); }
        .menu-item img { width: 100%; height: 200px; object-fit: cover; }
        .menu-item-content { padding: 20px; }
        .menu-item-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 10px; }
        .menu-item-price { font-size: 1.3rem; font-weight: 700; color: #dc3545; margin: 15px 0; }
        .category-title { font-size: 2rem; color: #dc3545; margin-bottom: 30px; padding-bottom: 10px; border-bottom: 3px solid #dc3545; display: inline-block; }
        .section { padding: 60px 0; }
        .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 50px; color: #dc3545; }
        
        /* Шапка с видео */
        .header { position: relative; height: 100vh; min-height: 600px; overflow: hidden; display: flex; align-items: center; justify-content: center; color: white; margin-top: -130px; }
        .header-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
        .header-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: -1; }
        .header-content { text-align: center; z-index: 1; padding: 0 20px; }
        .header h1 { font-size: 3rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .header p { font-size: 1.2rem; margin-bottom: 2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; justify-content: center; align-items: center; }
        .modal-content { background: white; padding: 40px; border-radius: 10px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; }
        .modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.8rem; cursor: pointer; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-control { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
        .menu-selector { border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-bottom: 20px; max-height: 250px; overflow-y: auto; }
        .menu-item-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid #eee; }
        .add-to-cart-btn { background: #28a745; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; }
        .cart-container { min-height: 60px; border: 1px solid #eee; padding: 10px; margin-bottom: 10px; background: #f9f9f9; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
        .remove-item { background: #dc3545; color: white; border: none; padding: 3px 10px; border-radius: 5px; cursor: pointer; }
        .cart-total { text-align: right; font-size: 1.2rem; padding-top: 10px; }
        .user-display { color: #ffd700; margin-right: 15px; }
        .warning { color: #dc3545; font-size: 0.9rem; margin-top: 10px; }
        .mobile-nav { display: none; flex-direction: column; gap: 10px; margin-top: 15px; }
        .mobile-nav-link { color: white; text-decoration: none; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center; }
        .product-modal { text-align: center; max-width: 500px; }
        .product-modal img { width: 100%; max-height: 250px; object-fit: cover; border-radius: 10px; margin-bottom: 15px; }
        .product-price { font-size: 1.5rem; font-weight: bold; color: #dc3545; margin: 15px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; }
        @media (max-width: 768px) { .nav-menu { display: none; } .mobile-nav { display: flex; } .header h1 { font-size: 2rem; } }
    </style>
</head>
<body>

<nav class="navbar">
    <div class="container nav-container">
        <a href="#" class="logo">Pizza<span>Mania</span></a>
        <ul class="nav-menu">
            <li><a href="#home" class="nav-link">Главная</a></li>
            <li class="dropdown"><a href="#menu" class="nav-link">Меню ▼</a>
                <ul class="dropdown-menu"><li><a href="#pizza">🍕 Пицца</a></li><li><a href="#pasta">🍝 Паста</a></li><li><a href="#salads">🥗 Салаты</a></li><li><a href="#drinks">🥤 Напитки</a></li><li><a href="#desserts">🍰 Десерты</a></li></ul>
            </li>
            <li><a href="#about" class="nav-link">О нас</a></li>
            <li><a href="#gallery" class="nav-link">Галерея</a></li>
            <li><span id="userDisplay" class="user-display"></span></li>
            <li><button class="btn login-btn" id="loginBtn">Войти</button></li>
            <li><button class="btn" id="orderBtn" style="display:none;">Заказать</button></li>
        </ul>
        <div class="mobile-nav" id="mobileNav">
            <a href="#home" class="mobile-nav-link">Главная</a>
            <a href="#pizza" class="mobile-nav-link">🍕 Пицца</a>
            <a href="#pasta" class="mobile-nav-link">🍝 Паста</a>
            <a href="#salads" class="mobile-nav-link">🥗 Салаты</a>
            <a href="#drinks" class="mobile-nav-link">🥤 Напитки</a>
            <a href="#desserts" class="mobile-nav-link">🍰 Десерты</a>
            <a href="#about" class="mobile-nav-link">О нас</a>
            <a href="#gallery" class="mobile-nav-link">Галерея</a>
            <button class="btn login-btn" id="mobileLoginBtn">Войти</button>
            <button class="btn" id="mobileOrderBtn" style="display:none;">Заказать</button>
        </div>
    </div>
</nav>

<header class="header" id="home">
    <video autoplay muted loop class="header-video">
        <source src="vid.mp4" type="video/mp4">
    </video>
    <div class="header-overlay"></div>
    <div class="header-content">
        <h1>Лучшая пицца в городе</h1>
        <p>Настоящая итальянская пицца с дровяной печи</p>
        <button class="btn" id="headerOrderBtn">Заказать сейчас</button>
    </div>
</header>

<section id="pizza" class="section"><div class="container"><h3 class="category-title">🍕 Пицца</h3><div class="menu-grid" id="pizzaGrid"></div></div></section>
<section id="pasta" class="section"><div class="container"><h3 class="category-title">🍝 Паста</h3><div class="menu-grid" id="pastaGrid"></div></div></section>
<section id="salads" class="section"><div class="container"><h3 class="category-title">🥗 Салаты</h3><div class="menu-grid" id="saladsGrid"></div></div></section>
<section id="drinks" class="section"><div class="container"><h3 class="category-title">🥤 Напитки</h3><div class="menu-grid" id="drinksGrid"></div></div></section>
<section id="desserts" class="section"><div class="container"><h3 class="category-title">🍰 Десерты</h3><div class="menu-grid" id="dessertsGrid"></div></div></section>
<section id="about" class="section"><div class="container"><h2 class="section-title">О нашей пиццерии</h2><p style="text-align:center;">Мы - семейная пиццерия с более чем 20-летним опытом приготовления настоящей итальянской пиццы.</p></div></section>
<section id="gallery" class="section"><div class="container"><h2 class="section-title">Наша галерея</h2><div style="height:300px; background:#ddd; display:flex; align-items:center; justify-content:center;">Здесь будут фото</div></div></section>
<footer class="footer" style="background:#343a40; color:white; text-align:center; padding:50px;"><p>Ежедневно с 10:00 до 23:00</p><p>Телефон: +7 (999) 999-99-99</p></footer>

<!-- Модалки -->
<div id="registerModal" class="modal"><div class="modal-content"><button class="modal-close" id="closeRegisterModal">×</button><h2>Регистрация</h2>
<form id="registerForm"><div class="form-group"><label>Имя *</label><input type="text" id="regName" class="form-control" required></div>
<div class="form-group"><label>Телефон *</label><input type="tel" id="regPhone" class="form-control" required></div>
<div class="form-group"><label>Email</label><input type="email" id="regEmail" class="form-control"></div>
<div class="form-group"><label>Адрес</label><textarea id="regAddress" class="form-control" rows="2"></textarea></div>
<div id="registerMessage"></div><button type="submit" class="btn" style="width:100%">Зарегистрироваться</button></form>
<hr><p style="text-align:center"><a href="#" id="showLoginFromReg">Уже есть аккаунт? Войти</a></p></div></div>

<div id="authModal" class="modal"><div class="modal-content"><button class="modal-close" id="closeAuthModal">×</button><h2>Вход</h2>
<form id="authForm"><div class="form-group"><label>Логин</label><input type="text" id="authLogin" class="form-control" required></div>
<div class="form-group"><label>Пароль</label><input type="password" id="authPassword" class="form-control" required></div>
<div id="authMessage"></div><button type="submit" class="btn" style="width:100%">Войти</button></form>
<hr><p style="text-align:center"><a href="#" id="showRegFromLogin">Нет аккаунта? Зарегистрироваться</a></p></div></div>

<div id="credsModal" class="modal"><div class="modal-content"><button class="modal-close" id="closeCredsModal">×</button><h2>Регистрация завершена!</h2>
<p>Ваши данные для входа:</p><p><strong>Логин:</strong> <span id="credsLogin"></span></p><p><strong>Пароль:</strong> <span id="credsPassword"></span></p>
<p class="warning">Сохраните их!</p>
<button id="goToLoginBtn" class="btn" style="width:100%; margin-top:10px; background:#28a745;">Перейти ко входу</button></div></div>

<div id="orderModal" class="modal"><div class="modal-content"><button class="modal-close" id="closeOrderModal">×</button><h2>Оформление заказа</h2>
<form id="orderForm"><div class="form-group"><label>Имя *</label><input type="text" id="orderName" class="form-control" required></div>
<div class="form-group"><label>Телефон *</label><input type="tel" id="orderPhone" class="form-control" required></div>
<div class="form-group"><label>Email</label><input type="email" id="orderEmail" class="form-control"></div>
<div class="form-group"><label>Адрес</label><textarea id="orderAddress" class="form-control" rows="2"></textarea></div>
<h3>Выберите позиции</h3><div id="modalMenuList" class="menu-selector"></div>
<h3>Корзина</h3><div id="cartItems" class="cart-container">Корзина пуста</div>
<div class="cart-total"><strong>Итого: <span id="orderTotal">0</span> ₽</strong></div>
<button type="submit" class="btn" style="width:100%; margin-top:20px">Оформить заказ</button></form></div></div>

<div id="productModal" class="modal"><div class="modal-content product-modal"><button class="modal-close" id="closeProductModal">×</button><img id="productImage" src=""><h3 id="productName"></h3><p id="productDesc"></p><div class="product-price" id="productPrice"></div><button id="orderFromProductBtn" class="btn">Заказать</button></div></div>

<script>
// ДАННЫЕ МЕНЮ
const menuData = {
    pizza: [
        { name: "Маргарита", desc: "Томатный соус, моцарелла, базилик", price: 450, image: "margarita.webp" },
        { name: "Пепперони", desc: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
        { name: "Четыре сыра", desc: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" }
    ],
    pasta: [{ name: "Карбонара", desc: "Спагетти, бекон, сливочный соус", price: 420, image: "carbonara.jpg" }],
    salads: [{ name: "Цезарь", desc: "Курица, пармезан, соус Цезарь", price: 350, image: "caesar.jpg" }],
    drinks: [{ name: "Coca-Cola", desc: "0.5 л", price: 120, image: "coca.jpg" }],
    desserts: [{ name: "Тирамису", desc: "Классический итальянский десерт", price: 280, image: "tiramisu.jpg" }]
};

function renderCategory(cat, id) {
    let c = document.getElementById(id);
    if(!c) return;
    c.innerHTML = '';
    menuData[cat].forEach(item => {
        c.innerHTML += `<div class="menu-item"><img src="${item.image}" alt="${item.name}"><div class="menu-item-content"><h3 class="menu-item-title">${item.name}</h3><p>${item.desc}</p><div class="menu-item-price">${item.price} ₽</div><button class="btn view-btn" data-name="${item.name}" data-price="${item.price}" data-desc="${item.desc}" data-img="${item.image}">Подробнее</button></div></div>`;
    });
}

renderCategory('pizza','pizzaGrid');
renderCategory('pasta','pastaGrid');
renderCategory('salads','saladsGrid');
renderCategory('drinks','drinksGrid');
renderCategory('desserts','dessertsGrid');

// КОРЗИНА
let cart = [];
let isLoggedIn = false;

function addToCart(name, price) {
    let existing = cart.find(i => i.name === name);
    if(existing) existing.qty++;
    else cart.push({name, price, qty: 1});
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    let container = document.getElementById('cartItems');
    let totalSpan = document.getElementById('orderTotal');
    if(!container) return;
    if(cart.length === 0) {
        container.innerHTML = 'Корзина пуста';
        if(totalSpan) totalSpan.innerText = '0';
        return;
    }
    let html = '', total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        html += `<div class="cart-item"><span>${item.name} x${item.qty} = ${item.price * item.qty} ₽</span><button class="remove-item" data-index="${idx}">Удалить</button></div>`;
    });
    container.innerHTML = html;
    if(totalSpan) totalSpan.innerText = total;
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
    });
}

function renderModalMenu() {
    let container = document.getElementById('modalMenuList');
    if(!container) return;
    container.innerHTML = '';
    let allItems = [
        ...menuData.pizza.map(i => ({name: i.name, price: i.price})),
        ...menuData.pasta.map(i => ({name: i.name, price: i.price})),
        ...menuData.salads.map(i => ({name: i.name, price: i.price})),
        ...menuData.drinks.map(i => ({name: i.name, price: i.price})),
        ...menuData.desserts.map(i => ({name: i.name, price: i.price}))
    ];
    allItems.forEach(item => {
        let row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `<span>${item.name} - ${item.price} ₽</span><button class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}">+</button>`;
        container.appendChild(row);
    });
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn.dataset.name, parseInt(btn.dataset.price)));
    });
}

// ПОДРОБНЕЕ
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('productImage').src = btn.dataset.img;
        document.getElementById('productName').innerText = btn.dataset.name;
        document.getElementById('productDesc').innerText = btn.dataset.desc;
        document.getElementById('productPrice').innerHTML = btn.dataset.price + ' ₽';
        window.currentProduct = {name: btn.dataset.name, price: parseInt(btn.dataset.price)};
        document.getElementById('productModal').style.display = 'flex';
    });
});

document.getElementById('closeProductModal')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

document.getElementById('orderFromProductBtn')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
    if(!isLoggedIn) {
        alert('Сначала зарегистрируйтесь');
        document.getElementById('registerModal').style.display = 'flex';
        return;
    }
    openOrderModal();
    addToCart(window.currentProduct.name, window.currentProduct.price);
});

function openOrderModal() {
    renderModalMenu();
    renderCart();
    document.getElementById('orderModal').style.display = 'flex';
}

// КНОПКИ ЗАКАЗА
document.getElementById('orderBtn')?.addEventListener('click', () => {
    if(!isLoggedIn) { alert('Сначала войдите'); document.getElementById('authModal').style.display = 'flex'; return; }
    openOrderModal();
});
document.getElementById('mobileOrderBtn')?.addEventListener('click', () => {
    if(!isLoggedIn) { alert('Сначала войдите'); document.getElementById('authModal').style.display = 'flex'; return; }
    openOrderModal();
});
document.getElementById('headerOrderBtn')?.addEventListener('click', () => {
    if(!isLoggedIn) { alert('Сначала войдите'); document.getElementById('authModal').style.display = 'flex'; return; }
    openOrderModal();
});

// РЕГИСТРАЦИЯ
document.getElementById('registerForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    let fd = new FormData();
    fd.append('name', document.getElementById('regName').value);
    fd.append('phone', document.getElementById('regPhone').value);
    fd.append('email', document.getElementById('regEmail').value);
    fd.append('address', document.getElementById('regAddress').value);
    let r = await fetch('?action=register', {method:'POST', body:fd});
    let d = await r.json();
    if(d.success) {
        document.getElementById('credsLogin').innerText = d.login;
        document.getElementById('credsPassword').innerText = d.password;
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('credsModal').style.display = 'flex';
    } else {
        document.getElementById('registerMessage').innerHTML = '<div class="error">'+d.error+'</div>';
    }
});

// ВХОД
document.getElementById('authForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    let fd = new FormData();
    fd.append('login', document.getElementById('authLogin').value);
    fd.append('password', document.getElementById('authPassword').value);
    let r = await fetch('?action=login', {method:'POST', body:fd});
    let d = await r.json();
    if(d.success) {
        isLoggedIn = true;
        document.getElementById('userDisplay').innerHTML = '👋 ' + d.user.full_name;
        document.getElementById('orderBtn').style.display = 'inline-block';
        document.getElementById('mobileOrderBtn').style.display = 'inline-block';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('mobileLoginBtn').style.display = 'none';
        document.getElementById('authModal').style.display = 'none';
        alert('Добро пожаловать!');
    } else {
        document.getElementById('authMessage').innerHTML = '<div class="error">'+d.error+'</div>';
    }
});

// ОФОРМЛЕНИЕ ЗАКАЗА (ТОЛЬКО ПО КНОПКЕ)
document.getElementById('orderForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    if(cart.length === 0) {
        alert('Добавьте позиции в корзину');
        return;
    }
    let itemsStr = cart.map(i => i.name + ' x' + i.qty).join(', ');
    let fd = new FormData();
    fd.append('name', document.getElementById('orderName').value);
    fd.append('phone', document.getElementById('orderPhone').value);
    fd.append('email', document.getElementById('orderEmail').value);
    fd.append('address', document.getElementById('orderAddress').value);
    fd.append('items', itemsStr);
    fd.append('total', document.getElementById('orderTotal').innerText);
    let r = await fetch('?action=order', {method:'POST', body:fd});
    let d = await r.json();
    if(d.success) {
        alert('Заказ оформлен! Сумма: ' + document.getElementById('orderTotal').innerText + ' ₽');
        cart = [];
        renderCart();
        document.getElementById('orderModal').style.display = 'none';
    } else {
        alert('Ошибка: ' + d.error);
    }
});

// КНОПКИ ПЕРЕКЛЮЧЕНИЯ
document.getElementById('loginBtn')?.addEventListener('click', () => { document.getElementById('authModal').style.display = 'flex'; });
document.getElementById('mobileLoginBtn')?.addEventListener('click', () => { document.getElementById('authModal').style.display = 'flex'; });
document.getElementById('closeRegisterModal')?.addEventListener('click', () => { document.getElementById('registerModal').style.display = 'none'; });
document.getElementById('closeAuthModal')?.addEventListener('click', () => { document.getElementById('authModal').style.display = 'none'; });
document.getElementById('closeCredsModal')?.addEventListener('click', () => { document.getElementById('credsModal').style.display = 'none'; });
document.getElementById('closeOrderModal')?.addEventListener('click', () => { document.getElementById('orderModal').style.display = 'none'; });
document.getElementById('showRegFromLogin')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('authModal').style.display = 'none'; document.getElementById('registerModal').style.display = 'flex'; });
document.getElementById('showLoginFromReg')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('registerModal').style.display = 'none'; document.getElementById('authModal').style.display = 'flex'; });
document.getElementById('goToLoginBtn')?.addEventListener('click', () => { document.getElementById('credsModal').style.display = 'none'; document.getElementById('authModal').style.display = 'flex'; });

// Мобильное меню
document.querySelectorAll('.mobile-dropdown-trigger')?.forEach(tr => {
    tr.addEventListener('click', e => { e.preventDefault(); tr.nextElementSibling?.classList.toggle('active'); });
});
window.addEventListener('click', (e) => {
    if(e.target.classList?.contains('modal')) e.target.style.display = 'none';
});
</script>
</body>
</html>
