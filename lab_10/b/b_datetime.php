<?php
require_once 'config.php';

$now = new DateTime();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Current Date and Time</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="topbar">
        <span class="brand">Date and Time</span>
    </div>

    <div class="container">
        <div class="card">
            <h1>Current Date and Time</h1>
            <p class="subtitle">Server time zone: <?= e(date_default_timezone_get()) ?></p>

            <table class="details">
                <tr>
                    <td>Day</td>
                    <td><?= e($now->format('l')) ?></td>
                </tr>
                <tr>
                    <td>Date</td>
                    <td><?= e($now->format('d F Y')) ?></td>
                </tr>
                <tr>
                    <td>Time</td>
                    <td><?= e($now->format('h:i:s A')) ?></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
