<?php
/**
 * Database Configuration for ParadeOps
 * 
 * This file contains database connection settings.
 * Update these values based on your environment.
 */

// Database configuration
define('DB_HOST', 'localhost');        // Database server (usually 'localhost')
define('DB_NAME', 'parade_ops');       // Database name
define('DB_USER', 'root');             // Database username
define('DB_PASS', '');                 // Database password (empty for XAMPP default)
define('DB_CHARSET', 'utf8mb4');       // Character set

/**
 * Create database connection using PDO (recommended)
 * PDO provides security features like prepared statements
 */
function getDatabaseConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // Enable exceptions
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // Fetch as associative array
            PDO::ATTR_EMULATE_PREPARES   => false,                   // Use real prepared statements
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
        
    } catch (PDOException $e) {
        // Log error securely (don't expose database details to users)
        error_log("Database connection failed: " . $e->getMessage());
        
        // Return user-friendly error
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed. Please contact system administrator.'
        ]);
        exit;
    }
}

/**
 * Alternative: MySQLi connection (also secure)
 * Uncomment if you prefer MySQLi over PDO
 */
/*
function getDatabaseConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed.'
        ]);
        exit;
    }
    
    $conn->set_charset(DB_CHARSET);
    return $conn;
}
*/

/**
 * Close database connection
 */
function closeDatabaseConnection($conn) {
    if ($conn instanceof PDO) {
        $conn = null;
    } elseif ($conn instanceof mysqli) {
        $conn->close();
    }
}

// Enable CORS for API requests (adjust origins as needed)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Helper function to send JSON response
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Helper function to validate required fields
 */
function validateRequiredFields($data, $requiredFields) {
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Helper function to sanitize input
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}
?>
