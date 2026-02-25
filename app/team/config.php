<?php
declare(strict_types=1);

session_start();

$DB_HOST = 'localhost';
$DB_NAME = 'extorei_teams';
$DB_USER = 'root';
$DB_PASS = '';
$DB_CHARSET = 'utf8mb4';

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]
  );
} catch (Throwable $e) {
  http_response_code(500);
  echo "DB error.";
  exit;
}

/**
 * DEMO AUTH:
 * Itt most fixen bejelentkeztetünk egy usert.
 * Élesben ezt loginból állítod be.
 */
if (empty($_SESSION['user_id'])) {
  // owner@demo.hu
  $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
  $stmt->execute(['owner@demo.hu']);
  $u = $stmt->fetch();
  $_SESSION['user_id'] = (int)($u['id'] ?? 0);
}

function json_out(array $data, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function require_auth(): int {
  $uid = (int)($_SESSION['user_id'] ?? 0);
  if ($uid <= 0) json_out(['ok'=>false,'error'=>'Not logged in'], 401);
  return $uid;
}
