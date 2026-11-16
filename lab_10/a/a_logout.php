<?php
require_once 'config.php';
session_start();

$name      = $_SESSION['name'] ?? 'Guest';
$startTime = $_SESSION['start_time'] ?? null;
$endTime   = time();

$durationSeconds = ($startTime !== null) ? ($endTime - $startTime) : 0;

/**
 * Convert seconds into "H hour(s), M minute(s), S second(s)".
 */
function formatDuration(int $seconds): string
{
    $hours   = intdiv($seconds, 3600);
    $minutes = intdiv($seconds % 3600, 60);
    $secs    = $seconds % 60;

    return sprintf('%d hour(s), %d minute(s), %d second(s)', $hours, $minutes, $secs);
}

// End the session completely, including its cookie.
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logged Out</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="topbar">
        <span class="brand">Session Application</span>
    </div>

    <div class="container">
        <div class="card">
            <h1>Thank you, <?= e($name) ?></h1>
            <p class="subtitle">You have been logged out successfully.</p>

            <table class="details">
                <tr>
                    <td>Session started</td>
                    <td><?= $startTime ? e(date('d M Y, h:i:s A', $startTime)) : 'N/A' ?></td>
                </tr>
                <tr>
                    <td>Session ended</td>
                    <td><?= e(date('d M Y, h:i:s A', $endTime)) ?></td>
                </tr>
                <tr>
                    <td>Duration of usage</td>
                    <td><?= e(formatDuration($durationSeconds)) ?></td>
                </tr>
            </table>

            <a href="a_index.php" class="btn">Start a new session</a>
        </div>
    </div>
</body>
</html>
