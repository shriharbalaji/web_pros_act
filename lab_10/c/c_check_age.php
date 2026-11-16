<?php
require_once 'config.php';

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$age  = isset($_POST['age'])  ? trim($_POST['age'])  : '';

$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}

if ($age === '' || filter_var($age, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 120]]) === false) {
    $errors[] = 'Please enter a valid age between 0 and 120.';
}

$isAuthorized = empty($errors) && (int) $age >= 18;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Result</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="topbar">
        <span class="brand">Visitor Verification</span>
    </div>

    <div class="container">
        <div class="card">
            <?php if (!empty($errors)): ?>
                <h1>Invalid Input</h1>
                <?php foreach ($errors as $error): ?>
                    <p class="error"><?= e($error) ?></p>
                <?php endforeach; ?>
                <a href="c_age_form.html" class="btn">Go back</a>

            <?php elseif ($isAuthorized): ?>
                <h1>Access Granted</h1>
                <div class="message success">Welcome to this site</div>
                <p class="subtitle"><?= e($name) ?>, thank you for visiting.</p>

            <?php else: ?>
                <h1>Access Denied</h1>
                <div class="message warning">
                    Hello, <?= e($name) ?>, you are not authorized to visit the site.
                </div>
                <a href="c_age_form.html" class="btn">Go back</a>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
