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
    die("Ошибка БД");
}

// ========== HTTP АВТОРИЗАЦИЯ ==========
$admin_login = 'admin';
$admin_password = 'admin123';

if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] !== $admin_login || 
    $_SERVER['PHP_AUTH_PW'] !== $admin_password) {
    
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Доступ запрещен';
    exit;
}

// ========== ОБРАБОТКА ДЕЙСТВИЙ ==========
if (isset($_GET['delete_order']) && is_numeric($_GET['delete_order'])) {
    $id = (int)$_GET['delete_order'];
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$id]);
    header('Location: admin.php');
    exit;
}

if (isset($_GET['delete_user']) && is_numeric($_GET['delete_user'])) {
    $id = (int)$_GET['delete_user'];
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    header('Location: admin.php');
    exit;
}

// ========== ДАННЫЕ ==========
$users = $pdo->query("SELECT id, full_name, phone, email, login, created_at FROM users ORDER BY id DESC")->fetchAll();
$orders = $pdo->query("
    SELECT o.*, u.full_name, u.phone 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.id DESC
")->fetchAll();
$total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$total_orders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$total_revenue = $pdo->query("SELECT SUM(total_price) FROM orders")->fetchColumn();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админ-панель</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container { max-width: 1300px; margin: 0 auto; }
        
        .header {
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 1.3rem; }
        .admin-badge { background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 5px; font-size: 0.9rem; }
        
        .stats {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .stat-card {
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            text-align: center;
            flex: 1;
            min-width: 120px;
        }
        .stat-card .num { font-size: 1.8rem; font-weight: bold; color: #dc3545; }
        .stat-card .label { color: #666; font-size: 0.9rem; margin-top: 5px; }
        
        .section {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .section h2 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #dc3545;
        }
        
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #f8f9fa; }
        tr:hover { background: #f8f9fa; }
        
        .btn {
            padding: 3px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.75rem;
            text-decoration: none;
            display: inline-block;
        }
        .btn-delete { background: #dc3545; color: white; }
        
        @media (max-width: 768px) {
            th, td { font-size: 0.7rem; padding: 5px; }
            .stat-card .num { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Админ-панель</h1>
        <div class="admin-badge">admin</div>
    </div>
    
    <div class="stats">
        <div class="stat-card"><div class="num"><?= $total_users ?></div><div class="label">Пользователи</div></div>
        <div class="stat-card"><div class="num"><?= $total_orders ?></div><div class="label">Заказы</div></div>
        <div class="stat-card"><div class="num"><?= number_format($total_revenue ?? 0, 0, '', ' ') ?> ₽</div><div class="label">Выручка</div></div>
    </div>
    
    <div class="section">
        <h2>Заказы</h2>
        <table>
            <thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Состав</th><th>Сумма</th><th>Дата</th><th></th></tr></thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                <tr>
                    <td><?= $order['id'] ?></td>
                    <td><?= htmlspecialchars($order['full_name'] ?? '-') ?></td>
                    <td><?= htmlspecialchars($order['phone'] ?? '-') ?></td>
                    <td><?= htmlspecialchars(substr($order['items'] ?? '', 0, 40)) ?></td>
                    <td><?= number_format($order['total_price'], 0, '', ' ') ?> ₽</td>
                    <td><?= $order['created_at'] ?></td>
                    <td><a href="?delete_order=<?= $order['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить заказ?')">Удалить</a></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($orders)): ?>
                <tr><td colspan="7" style="text-align:center;">Заказов пока нет</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>Пользователи</h2>
        <table>
            <thead><tr><th>ID</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Логин</th><th>Дата</th><th></th></tr></thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                <tr>
                    <td><?= $user['id'] ?></td>
                    <td><?= htmlspecialchars($user['full_name']) ?></td>
                    <td><?= htmlspecialchars($user['phone']) ?></td>
                    <td><?= htmlspecialchars($user['email'] ?? '-') ?></td>
                    <td><?= htmlspecialchars($user['login']) ?></td>
                    <td><?= $user['created_at'] ?></td>
                    <td><a href="?delete_user=<?= $user['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить пользователя?')">Удалить</a></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($users)): ?>
                <tr><td colspan="7" style="text-align:center;">Пользователей пока нет</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
