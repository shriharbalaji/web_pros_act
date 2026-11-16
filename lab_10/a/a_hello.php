<?php
require_once 'config.php';
session_start();

// Read the name from the request (POST or GET).
// A new name starts a new session and resets the timer.
$requestName = isset($_REQUEST['name']) ? trim($_REQUEST['name']) : '';

if ($requestName !== '') {
    $_SESSION['name'] = $requestName;
    $_SESSION['start_time'] = time();
}

// If there is no name in the request or the session, return to the entry page.
if (empty($_SESSION['name'])) {
    header('Location: a_index.php');
    exit;
}

$name      = $_SESSION['name'];
$startTime = $_SESSION['start_time'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="topbar">
        <span class="brand">Session Application</span>
        <div class="session-info">
            <span>Started at: <?= e(date('h:i:s A', $startTime)) ?></span>
            <form method="post" action="a_logout.php" style="margin:0;">
                <button type="submit" class="btn btn-small btn-logout">Logout</button>
            </form>
        </div>
    </div>

    <div class="container">
        <div class="card">
            <h1>Hello, <?= e($name) ?></h1>
            <p class="subtitle">You are signed in. Click Logout when you are finished.</p>
        </div>
    </div>
</body>
</html>
