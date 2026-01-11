<?php
/**
 * Login API Endpoint
 * 
 * This endpoint handles user authentication for ParadeOps.
 * It verifies credentials and returns user information on success.
 * 
 * Method: POST
 * Body: { "username": "string", "password": "string", "role": "string" }
 * 
 * Response: 
 * Success: { "success": true, "user": {...}, "token": "..." }
 * Error: { "success": false, "error": "message" }
 */

require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse([
        'success' => false,
        'error' => 'Method not allowed. Use POST.'
    ], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['username', 'password', 'role'];
$missing = validateRequiredFields($input, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse([
        'success' => false,
        'error' => 'Missing required fields: ' . implode(', ', $missing)
    ], 400);
}

// Sanitize input
$username = sanitizeInput($input['username']);
$password = $input['password'];  // Don't sanitize password (will be hashed)
$role = sanitizeInput($input['role']);

try {
    // Get database connection
    $db = getDatabaseConnection();
    
    // Query to find user by username and role
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.username,
            u.password_hash,
            u.role,
            u.email,
            u.is_active
        FROM users u
        WHERE u.username = :username 
        AND u.role = :role
        AND u.is_active = 1
        LIMIT 1
    ");
    
    $stmt->execute([
        ':username' => $username,
        ':role' => $role
    ]);
    
    $user = $stmt->fetch();
    
    // Check if user exists
    if (!$user) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Invalid credentials. Please check your username, password, and role.'
        ], 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Invalid credentials. Please check your username, password, and role.'
        ], 401);
    }
    
    // Update last login time
    $updateStmt = $db->prepare("
        UPDATE users 
        SET last_login = NOW() 
        WHERE user_id = :user_id
    ");
    $updateStmt->execute([':user_id' => $user['user_id']]);
    
    // If user is a soldier, get soldier details
    $soldierData = null;
    if ($role === 'soldier') {
        $soldierStmt = $db->prepare("
            SELECT 
                s.soldier_id,
                s.service_number,
                s.rank,
                s.full_name,
                s.annual_leave_balance,
                s.casual_leave_balance,
                s.recreational_leave_balance,
                s.medical_leave_balance,
                c.company_name
            FROM soldiers s
            JOIN companies c ON s.company_id = c.company_id
            WHERE s.user_id = :user_id
        ");
        $soldierStmt->execute([':user_id' => $user['user_id']]);
        $soldierData = $soldierStmt->fetch();
    }
    
    // Generate session token (simple version - use JWT for production)
    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    
    // Create simple token (for production, use JWT)
    $token = bin2hex(random_bytes(32));
    $_SESSION['token'] = $token;
    
    // Log the login (audit trail)
    $logStmt = $db->prepare("
        INSERT INTO audit_log (user_id, action, ip_address) 
        VALUES (:user_id, 'login', :ip)
    ");
    $logStmt->execute([
        ':user_id' => $user['user_id'],
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
    
    // Determine dashboard URL based on role
    $dashboards = [
        'commanding_officer' => 'frontend/CO/CO_dashboard.html',
        'coy_comd' => 'frontend/coy_commander/coy_dashboard.html',
        'adjutant' => 'frontend/adjutant/adjt_dashboard.html',
        'bsm' => 'frontend/bsm/bsm-dashboard.html',
        'soldier' => 'frontend/soldier/soldier_dashboard.html'
    ];
    
    // Prepare response
    $response = [
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'email' => $user['email']
        ],
        'dashboard' => $dashboards[$role] ?? 'login.html'
    ];
    
    // Add soldier data if available
    if ($soldierData) {
        $response['soldier'] = $soldierData;
    }
    
    sendJsonResponse($response, 200);
    
} catch (PDOException $e) {
    // Log error securely
    error_log("Login error: " . $e->getMessage());
    
    sendJsonResponse([
        'success' => false,
        'error' => 'An error occurred during login. Please try again.'
    ], 500);
}
?>
