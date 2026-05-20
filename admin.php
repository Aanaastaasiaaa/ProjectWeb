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

// ========== HTTP АВТОРИЗАЦИЯ ==========
$admin_login = 'admin';
$admin_password = 'admin123';

if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] !== $admin_login || 
    $_SERVER['PHP_AUTH_PW'] !== $admin_password) {
    
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Доступ запрещен. Неверный логин или пароль.';
    exit;
}

// ========== ОБРАБОТКА ДЕЙСТВИЙ ==========
// Удаление заказа
if (isset($_GET['delete_order']) && is_numeric($_GET['delete_order'])) {
    $id = (int)$_GET['delete_order'];
    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: admin.php');
    exit;
}

// Удаление пользователя
if (isset($_GET['delete_user']) && is_numeric($_GET['delete_user'])) {
    $id = (int)$_GET['delete_user'];
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: admin.php');
    exit;
}

// Обновление статуса заказа
if (isset($_POST['update_status'])) {
    $order_id = (int)$_POST['order_id'];
    $status = $_POST['status'];
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $order_id]);
    header('Location: admin.php');
    exit;
}

// ========== ПОЛУЧЕНИЕ ДАННЫХ ==========
// Все пользователи
$users = $pdo->query("SELECT id, full_name, phone, email, address, login, created_at FROM users ORDER BY id DESC")->fetchAll();

// Все заказы с данными пользователей
$orders = $pdo->query("
    SELECT o.*, u.full_name, u.phone 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.id DESC
")->fetchAll();

// Статистика по заказам
$stats = $pdo->query("
    SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_order
    FROM orders
")->fetch();

// Статистика по статусам
$status_stats = $pdo->query("
    SELECT status, COUNT(*) as count 
    FROM orders 
    GROUP BY status
")->fetchAll();

// Общее количество пользователей
$total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель PizzaMania</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        
        /* Шапка */
        .header {
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 20px 25px;
            border-radius: 10px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .header h1 { font-size: 1.5rem; font-weight: 600; }
        .admin-user { background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 5px; }
        
        /* Карточки статистики */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card .number {
            font-size: 2rem;
            font-weight: bold;
            color: #dc3545;
        }
        .stat-card .label {
            color: #666;
            margin-top: 5px;
        }
        
        /* Секции */
        .section {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #dc3545;
            padding-bottom: 10px;
            font-size: 1.3rem;
        }
        
        /* Таблицы */
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #f8f9fa; color: #555; font-weight: 600; }
        tr:hover { background: #f8f9fa; }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        .status-new { background: #ffc107; color: #333; }
        .status-processing { background: #17a2b8; color: white; }
        .status-completed { background: #28a745; color: white; }
        .status-cancelled { background: #dc3545; color: white; }
        
        .btn {
            padding: 5px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.8rem;
        }
        .btn-edit { background: #ffc107; color: #333; }
        .btn-delete { background: #dc3545; color: white; }
        .btn-save { background: #28a745; color: white; }
        .btn:hover { opacity: 0.8; }
        
        select { padding: 4px 8px; border-radius: 5px; border: 1px solid #ddd; }
        
        @media (max-width: 768px) {
            th, td { font-size: 0.75rem; padding: 8px 5px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🍕 Админ-панель PizzaMania</h1>
        <div class="admin-user">👑 admin</div>
    </div>
    
    <!-- Статистика -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="number"><?= $total_users ?></div>
            <div class="label">Всего пользователей</div>
        </div>
        <div class="stat-card">
            <div class="number"><?= $stats['total_orders'] ?? 0 ?></div>
            <div class="label">Всего заказов</div>
        </div>
        <div class="stat-card">
            <div class="number"><?= number_format($stats['total_revenue'] ?? 0, 0, '', ' ') ?> ₽</div>
            <div class="label">Общая выручка</div>
        </div>
        <div class="stat-card">
            <div class="number"><?= number_format($stats['avg_order'] ?? 0, 0, '', ' ') ?> ₽</div>
            <div class="label">Средний чек</div>
        </div>
    </div>
    
    <!-- Статистика по статусам -->
    <div class="section">
        <h2>📊 Статистика по статусам заказов</h2>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
            <?php foreach ($status_stats as $stat): ?>
            <div class="stat-card">
                <div class="number"><?= $stat['count'] ?></div>
                <div class="label"><?= $stat['status'] == 'new' ? 'Новые' : ($stat['status'] == 'processing' ? 'В обработке' : ($stat['status'] == 'completed' ? 'Завершённые' : 'Отменённые')) ?></div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Список заказов -->
    <div class="section">
        <h2>📋 Заказы</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Состав заказа</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): ?>
                    <tr>
                        <td><?= $order['id'] ?></td>
                        <td><?= htmlspecialchars($order['full_name'] ?? 'Неизвестно') ?></td>
                        <td><?= htmlspecialchars($order['phone'] ?? '-') ?></td>
                        <td><?= htmlspecialchars(substr($order['items'] ?? '', 0, 50)) ?></td>
                        <td><?= number_format($order['total_price'], 0, '', ' ') ?> ₽</td>
                        <td>
                            <span class="status-badge status-<?= $order['status'] ?>">
                                <?= $order['status'] == 'new' ? 'Новый' : ($order['status'] == 'processing' ? 'В обработке' : ($order['status'] == 'completed' ? 'Завершён' : 'Отменён')) ?>
                            </span>
                        </td>
                        <td><?= $order['created_at'] ?></td>
                        <td style="white-space: nowrap;">
                            <form method="POST" style="display:inline;">
                                <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                                <select name="status">
                                    <option value="new" <?= $order['status'] == 'new' ? 'selected' : '' ?>>Новый</option>
                                    <option value="processing" <?= $order['status'] == 'processing' ? 'selected' : '' ?>>В обработке</option>
                                    <option value="completed" <?= $order['status'] == 'completed' ? 'selected' : '' ?>>Завершён</option>
                                    <option value="cancelled" <?= $order['status'] == 'cancelled' ? 'selected' : '' ?>>Отменён</option>
                                </select>
                                <button type="submit" name="update_status" class="btn btn-save">Сохранить</button>
                            </form>
                            <a href="?delete_order=<?= $order['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить заказ?')">Удалить</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    <?php if (empty($orders)): ?>
                    <tr><td colspan="8" style="text-align:center;">Заказов пока нет</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Список пользователей -->
    <div class="section">
        <h2>👥 Пользователи</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr><th>ID</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Логин</th><th>Адрес</th><th>Дата регистрации</th><th>Действия</th></tr>
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
                        <td><a href="?delete_user=<?= $user['id'] ?>" class="btn btn-delete" onclick="return confirm('Удалить пользователя?')">Удалить</a></td>
                    </tr>
                    <?php endforeach; ?>
                    <?php if (empty($users)): ?>
                    <tr><td colspan="8" style="text-align:center;">Пользователей пока нет</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
