<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$uid = require_auth();

$action = $_POST['action'] ?? '';

/**
 * Helper: ellenőrizze, hogy a user benne van-e a csapatban
 */
function require_team_member(PDO $pdo, int $teamId, int $uid): void {
  $st = $pdo->prepare("SELECT 1 FROM team_members WHERE team_id=? AND user_id=? LIMIT 1");
  $st->execute([$teamId, $uid]);
  if (!$st->fetchColumn()) {
    json_out(['ok'=>false,'error'=>'No access to this team'], 403);
  }
}

if ($action === 'bootstrap') {
  // user csapatai + tagok + feladatok
  $teams = [];
  $st = $pdo->prepare("
    SELECT t.id, t.name, t.owner_user_id
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = ?
    ORDER BY t.created_at DESC
  ");
  $st->execute([$uid]);
  $teams = $st->fetchAll();

  $teamIds = array_map(fn($t) => (int)$t['id'], $teams);
  if (!$teamIds) json_out(['ok'=>true,'teams'=>[], 'members'=>[], 'tasks'=>[]]);

  $in = implode(',', array_fill(0, count($teamIds), '?'));

  $stm = $pdo->prepare("
    SELECT tm.team_id, u.id AS user_id, u.name, u.email, tm.role
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id IN ($in)
    ORDER BY tm.team_id, tm.role DESC, u.name
  ");
  $stm->execute($teamIds);
  $members = $stm->fetchAll();

  $stt = $pdo->prepare("
    SELECT tsk.id, tsk.team_id, tsk.title, tsk.description, tsk.status, tsk.due_date,
           tsk.assigned_to_user_id,
           au.name AS assigned_name,
           cu.name AS created_by_name
    FROM tasks tsk
    LEFT JOIN users au ON au.id = tsk.assigned_to_user_id
    JOIN users cu ON cu.id = tsk.created_by_user_id
    WHERE tsk.team_id IN ($in)
    ORDER BY tsk.created_at DESC
  ");
  $stt->execute($teamIds);
  $tasks = $stt->fetchAll();

  json_out(['ok'=>true, 'teams'=>$teams, 'members'=>$members, 'tasks'=>$tasks]);
}

if ($action === 'create_team') {
  $name = trim((string)($_POST['name'] ?? ''));
  if ($name === '' || mb_strlen($name) > 120) json_out(['ok'=>false,'error'=>'Invalid team name'], 422);

  $pdo->beginTransaction();
  try {
    $st = $pdo->prepare("INSERT INTO teams (name, owner_user_id) VALUES (?, ?)");
    $st->execute([$name, $uid]);
    $teamId = (int)$pdo->lastInsertId();

    $st2 = $pdo->prepare("INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'owner')");
    $st2->execute([$teamId, $uid]);

    $pdo->commit();
    json_out(['ok'=>true, 'team_id'=>$teamId]);
  } catch (Throwable $e) {
    $pdo->rollBack();
    json_out(['ok'=>false,'error'=>'Create team failed'], 500);
  }
}

if ($action === 'add_member') {
  $teamId = (int)($_POST['team_id'] ?? 0);
  $email  = trim((string)($_POST['email'] ?? ''));

  if ($teamId <= 0) json_out(['ok'=>false,'error'=>'Invalid team'], 422);
  if ($email === '' || mb_strlen($email) > 190) json_out(['ok'=>false,'error'=>'Invalid email'], 422);

  require_team_member($pdo, $teamId, $uid);

  // csak owner tudjon hozzáadni
  $stRole = $pdo->prepare("SELECT role FROM team_members WHERE team_id=? AND user_id=? LIMIT 1");
  $stRole->execute([$teamId, $uid]);
  $role = (string)($stRole->fetchColumn() ?? '');
  if ($role !== 'owner') json_out(['ok'=>false,'error'=>'Only owner can add members'], 403);

  $stU = $pdo->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
  $stU->execute([$email]);
  $newUserId = (int)($stU->fetchColumn() ?? 0);
  if ($newUserId <= 0) json_out(['ok'=>false,'error'=>'User not found with this email'], 404);

  try {
    $stIns = $pdo->prepare("INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'member')");
    $stIns->execute([$teamId, $newUserId]);
    json_out(['ok'=>true]);
  } catch (Throwable $e) {
    // ha már tag volt
    json_out(['ok'=>false,'error'=>'Already a member (or insert failed)'], 409);
  }
}

if ($action === 'create_task') {
  $teamId = (int)($_POST['team_id'] ?? 0);
  $title = trim((string)($_POST['title'] ?? ''));
  $desc  = trim((string)($_POST['description'] ?? ''));
  $assignee = (int)($_POST['assigned_to_user_id'] ?? 0);
  $due = trim((string)($_POST['due_date'] ?? ''));

  if ($teamId <= 0) json_out(['ok'=>false,'error'=>'Invalid team'], 422);
  if ($title === '' || mb_strlen($title) > 160) json_out(['ok'=>false,'error'=>'Invalid title'], 422);

  require_team_member($pdo, $teamId, $uid);

  if ($assignee > 0) {
    $stM = $pdo->prepare("SELECT 1 FROM team_members WHERE team_id=? AND user_id=? LIMIT 1");
    $stM->execute([$teamId, $assignee]);
    if (!$stM->fetchColumn()) json_out(['ok'=>false,'error'=>'Assignee is not in team'], 422);
  } else {
    $assignee = null;
  }

  $dueDate = null;
  if ($due !== '') {
    // YYYY-MM-DD
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $due)) json_out(['ok'=>false,'error'=>'Invalid due date'], 422);
    $dueDate = $due;
  }

  $st = $pdo->prepare("
    INSERT INTO tasks (team_id, title, description, assigned_to_user_id, due_date, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  ");
  $st->execute([$teamId, $title, ($desc === '' ? null : $desc), $assignee, $dueDate, $uid]);

  json_out(['ok'=>true, 'task_id'=>(int)$pdo->lastInsertId()]);
}

if ($action === 'set_task_status') {
  $taskId = (int)($_POST['task_id'] ?? 0);
  $status = (string)($_POST['status'] ?? '');

  if ($taskId <= 0) json_out(['ok'=>false,'error'=>'Invalid task'], 422);
  if (!in_array($status, ['open','in_progress','done'], true)) json_out(['ok'=>false,'error'=>'Invalid status'], 422);

  $st = $pdo->prepare("SELECT team_id FROM tasks WHERE id=? LIMIT 1");
  $st->execute([$taskId]);
  $teamId = (int)($st->fetchColumn() ?? 0);
  if ($teamId <= 0) json_out(['ok'=>false,'error'=>'Task not found'], 404);

  require_team_member($pdo, $teamId, $uid);

  $st2 = $pdo->prepare("UPDATE tasks SET status=? WHERE id=?");
  $st2->execute([$status, $taskId]);

  json_out(['ok'=>true]);
}

json_out(['ok'=>false,'error'=>'Unknown action'], 400);
