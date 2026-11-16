<?php
require_once 'config.php';
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="topbar">
        <span class="brand">Session Application</span>
    </div>

    <div class="container">
        <div class="card">
            <h1>Enter your name</h1>
            <p class="subtitle">Please provide your name to continue.</p>

            <form method="post" action="a_hello.php">
                <label for="name">Full name</label>
                <input type="text" id="name" name="name" required maxlength="100" autofocus>
                <button type="submit" class="btn">Submit</button>
            </form>
        </div>
    </div>
</body>
</html>
