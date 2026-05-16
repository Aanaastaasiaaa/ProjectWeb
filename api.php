<?php
// api.php
header('Content-Type: application/json');
require_once 'functions.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api.php', '', $path);

$pdo = getDB();

// GET /pizzas - получить список пицц
if ($method === 'GET' && $path === '/pizzas') {
    $stmt = $pdo->query("SELECT id, name, description, price, image FROM pizzas");
    echo json_encode($stmt->fetchAll());
    exit;
}

// POST /orders - создать заказ
if ($method === 'POST' && $path === '/orders') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Валидация
    $errors = validateOrderData($data);
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit;
    }
    
    $pdo->beginTransaction();
    
    // Проверяем авторизацию
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
    } else {
        // Новый пользователь
        $creds = generateCredentials();
        $stmt = $pdo->prepare("
            INSERT INTO pizza_users (full_name, phone, email, address, login, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['phone'],
            $data['email'] ?? '',
            $data['address'] ?? '',
            $creds['login'],
            password_hash($creds['password'], PASSWORD_DEFAULT)
        ]);
        $user_id = $pdo->lastInsertId();
        $_SESSION['new_credentials'] = $creds;
    }
    
    // Сохраняем заказ
    $stmt = $pdo->prepare("
        INSERT INTO pizza_orders 
        (user_id, pizza_name, size, quantity, delivery_method, address, 
         delivery_date, delivery_time, comment, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $total = (int)str_replace(' ₽', '', $data['total'] ?? '0');
    
    $stmt->execute([
        $user_id,
        $data['pizza'],
        $data['size'] ?? 'Средняя',
        (int)($data['quantity'] ?? 1),
        $data['delivery_method'] ?? 'Доставка',
        $data['address'] ?? '',
        $data['date'] ?? '',
        $data['time'] ?? '',
        $data['comment'] ?? '',
        $total
    ]);
    
    $pdo->commit();
    
    $response = ['success' => true, 'order_id' => $pdo->lastInsertId()];
    if (isset($_SESSION['new_credentials'])) {
        $response['login'] = $_SESSION['new_credentials']['login'];
        $response['password'] = $_SESSION['new_credentials']['password'];
        unset($_SESSION['new_credentials']);
    }
    
    echo json_encode($response);
    exit;
}

// POST /login - авторизация
if ($method === 'POST' && $path === '/login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT * FROM pizza_users WHERE login = ?");
    $stmt->execute([$data['login']]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный логин или пароль']);
    }
    exit;
}

// GET /orders - получить заказы текущего пользователя
if ($method === 'GET' && $path === '/orders' && isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("
        SELECT * FROM pizza_orders WHERE user_id = ? ORDER BY id DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
