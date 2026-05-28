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

// Удаление заказа
if (isset($_GET['delete_order']) && is_numeric($_GET['delete_order'])) {
    $id = (int)$_GET['delete_order'];
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$id]);
    header('Location: admin.php');
    exit;
}

// Удаление пользователя
if (isset($_GET['delete_user']) && is_numeric($_GET['delete_user'])) {
    $id = (int)$_GET['delete_user'];
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    header('Location: admin.php');
    exit;
}

// Редактирование заказа
if (isset($_POST['edit_order'])) {
    $order_id = (int)$_POST['order_id'];
    $items = $_POST['items'];
    $total_price = (float)$_POST['total_price'];
    
    $pdo->prepare("UPDATE orders SET items = ?, total_price = ? WHERE id = ?")->execute([$items, $total_price, $order_id]);
    header('Location: admin.php');
    exit;
}

// Редактирование пользователя
if (isset($_POST['edit_user'])) {
    $user_id = (int)$_POST['user_id'];
    $full_name = $_POST['full_name'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $address = $_POST['address'];
    
    $pdo->prepare("UPDATE users SET full_name = ?, phone = ?, email = ?, address = ? WHERE id = ?")->execute([$full_name, $phone, $email, $address, $user_id]);
    header('Location: admin.php');
    exit;
}

// ========== ДАННЫЕ ==========
$users = $pdo->query("SELECT id, full_name, phone, email, login, address, created_at FROM users ORDER BY id DESC")->fetchAll();
$orders = $pdo->query("
    SELECT o.*, u.full_name, u.phone 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.id DESC
")->fetchAll();
$total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$total_orders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$total_revenue = $pdo->query("SELECT SUM(total_price) FROM orders")->fetchColumn();

// Получаем ID для редактирования
$edit_order_id = isset($_GET['edit_order_id']) ? (int)$_GET['edit_order_id'] : null;
$edit_user_id = isset($_GET['edit_user_id']) ? (int)$_GET['edit_user_id'] : null;

$edit_order_data = null;
if ($edit_order_id) {
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$edit_order_id]);
    $edit_order_data = $stmt->fetch();
}

$edit_user_data = null;
if ($edit_user_id) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$edit_user_id]);
    $edit_user_data = $stmt->fetch();
}
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
        .btn-edit { background: #28a745; color: white; }
        .btn-delete { background: #dc3545; color: white; }
        .btn-save { background: #28a745; color: white; margin-right: 5px; }
        .btn-cancel { background: #6c757d; color: white; }
        
        .edit-form {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }
        .edit-form h3 { margin-bottom: 15px; color: #dc3545; }
        .form-group { margin-bottom: 10px; }
        .form-group label { display: inline-block; width: 100px; font-weight: bold; }
        .form-group input, .form-group textarea { width: 300px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
        
        @media (max-width: 768px) {
            th, td { font-size: 0.7rem; padding: 5px; }
            .stat-card .num { font-size: 1.2rem; }
            .form-group input, .form-group textarea { width: 100%; }
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
    
    <!-- Форма редактирования заказа -->
    <?php if ($edit_order_data): ?>
    <div class="edit-form">
        <h3>✏️ Редактирование заказа #<?= $edit_order_data['id'] ?></h3>
        <form method="POST">
            <input type="hidden" name="order_id" value="<?= $edit_order_data['id'] ?>">
            <div class="form-group">
                <label>Состав заказа:</label>
                <textarea name="items" rows="3" style="width:400px;"><?= htmlspecialchars($edit_order_data['items']) ?></textarea>
            </div>
            <div class="form-group">
                <label>Сумма (₽):</label>
                <input type="number" name="total_price" step="0.01" value="<?= $edit_order_data['total_price'] ?>">
            </div>
            <div class="form-group">
                <label></label>
                <button type="submit" name="edit_order" class="btn btn-save">💾 Сохранить</button>
                <a href="admin.php" class="btn btn-cancel">Отмена</a>
            </div>
        </form>
    </div>
    <?php endif; ?>
    
    <!-- Форма редактирования пользователя -->
    <?php if ($edit_user_data): ?>
    <div class="edit-form">
        <h3>✏️ Редактирование пользователя #<?= $edit_user_data['id'] ?></h3>
        <form method="POST">
            <input type="hidden" name="user_id" value="<?= $edit_user_data['id'] ?>">
            <div class="form-group">
                <label>Имя:</label>
                <input type="text" name="full_name" value="<?= htmlspecialchars($edit_user_data['full_name']) ?>" required>
            </div>
            <div class="form-group">
                <label>Телефон:</label>
                <input type="text" name="phone" value="<?= htmlspecialchars($edit_user_data['phone']) ?>" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" value="<?= htmlspecialchars($edit_user_data['email']) ?>">
            </div>
            <div class="form-group">
                <label>Адрес:</label>
                <textarea name="address" rows="2" style="width:400px;"><?= htmlspecialchars($edit_user_data['address']) ?></textarea>
            </div>
            <div class="form-group">
                <label></label>
                <button type="submit" name="edit_user" class="btn btn-save">💾 Сохранить</button>
                <a href="admin.php" class="btn btn-cancel">Отмена</a>
            </div>
        </form>
    </div>
    <?php endif; ?>
    
    <div class="section">
        <h2>Заказы</h2>
        <table>
            <thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Состав</th><th>Сумма</th><th>Дата</th><th>Действия</th></tr></thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                <tr>
                    <td><?= $order['id'] ?></td>
                    <td><?= htmlspecialchars($order['full_name'] ?? '-') ?></td>
                    <td><?= htmlspecialchars($order['phone'] ?? '-') ?></td>
                    <td><?= htmlspecialchars(substr($order['items'] ?? '', 0, 40)) ?></td>
                    <td><?= number_format($order['total_price'], 0, '', ' ') ?> ₽</td>
                    <td><?= $order['created_at'] ?></td>
                    <td>
                        <a href="?edit_order_id=<?= $order['id'] ?>" class="btn btn-edit">✏️ Ред.</a>
                        <a href="?delete_order=<?= $order['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить заказ?')">🗑️ Удал.</a>
                    </td>
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
            <thead>
                <tr><th>ID</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Логин</th><th>Адрес</th><th>Дата</th><th>Действия</th></tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                <tr>
                    <td><?= $user['id'] ?></td>
                    <td><?= htmlspecialchars($user['full_name']) ?></td>
                    <td><?= htmlspecialchars($user['phone']) ?></td>
                    <td><?= htmlspecialchars($user['email'] ?? '-') ?></td>
                    <td><?= htmlspecialchars($user['login']) ?></td>
                    <td><?= htmlspecialchars(substr($user['address'] ?? '-', 0, 30)) ?></td>
                    <td><?= $user['created_at'] ?></td>
                    <td>
                        <a href="?edit_user_id=<?= $user['id'] ?>" class="btn btn-edit">✏️ Ред.</a>
                        <a href="?delete_user=<?= $user['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить пользователя?')">🗑️ Удал.</a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($users)): ?>
                <tr><td colspan="8" style="text-align:center;">Пользователей пока нет</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
