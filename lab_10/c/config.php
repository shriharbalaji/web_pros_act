<?php
// Central settings and helpers used by all parts.
date_default_timezone_set('Asia/Kolkata');

/**
 * Escape a value for safe output in HTML.
 */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
