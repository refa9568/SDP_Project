<?php
/**
 * Leave Requests API Endpoint
 * 
 * This endpoint handles leave request operations.
 * 
 * Methods:
 * - GET: Retrieve leave requests (with optional filters)
 * - POST: Create new leave request
 * - PUT: Update leave request status (approve/reject)
 */

require_once '../config/database.php';

// Start session for authentication
session_start();

// Check if user is authenticated (basic check)
// For production, implement proper JWT token validation
if (!isset($_SESSION['user_id'])) {
    sendJsonResponse([
        'success' => false,
        'error' => 'Unauthorized. Please login first.'
    ], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabaseConnection();

/**
 * GET: Retrieve leave requests
 */
if ($method === 'GET') {
    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['role'];
        
        // Build query based on role
        $query = "
            SELECT 
                lr.request_id,
                lr.leave_type,
                lr.start_date,
                lr.end_date,
                lr.days_requested,
                lr.reason,
                lr.status,
                lr.created_at,
                s.service_number,
                s.full_name as soldier_name,
                s.rank,
                c.company_name
            FROM leave_requests lr
            JOIN soldiers s ON lr.soldier_id = s.soldier_id
            JOIN companies c ON s.company_id = c.company_id
        ";
        
        // Filter based on role
        $params = [];
        if ($userRole === 'soldier') {
            $query .= " WHERE s.user_id = :user_id";
            $params[':user_id'] = $userId;
        } elseif ($userRole === 'coy_comd') {
            $query .= " WHERE lr.status IN ('pending', 'approved_coy_comd')";
        } elseif ($userRole === 'adjutant') {
            $query .= " WHERE lr.status IN ('approved_coy_comd', 'approved_adjutant')";
        } elseif ($userRole === 'bsm') {
            $query .= " WHERE lr.status IN ('approved_adjutant', 'approved_bsm')";
        }
        // CO can see all requests
        
        $query .= " ORDER BY lr.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $requests = $stmt->fetchAll();
        
        sendJsonResponse([
            'success' => true,
            'data' => $requests,
            'count' => count($requests)
        ]);
        
    } catch (PDOException $e) {
        error_log("Get leave requests error: " . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'error' => 'Failed to retrieve leave requests.'
        ], 500);
    }
}

/**
 * POST: Create new leave request
 */
elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $requiredFields = ['soldier_id', 'leave_type', 'start_date', 'end_date', 'days_requested', 'reason'];
        $missing = validateRequiredFields($input, $requiredFields);
        
        if (!empty($missing)) {
            sendJsonResponse([
                'success' => false,
                'error' => 'Missing required fields: ' . implode(', ', $missing)
            ], 400);
        }
        
        // Insert leave request
        $stmt = $db->prepare("
            INSERT INTO leave_requests 
            (soldier_id, leave_type, start_date, end_date, days_requested, reason, address_on_leave, contact_number)
            VALUES 
            (:soldier_id, :leave_type, :start_date, :end_date, :days_requested, :reason, :address, :contact)
        ");
        
        $stmt->execute([
            ':soldier_id' => $input['soldier_id'],
            ':leave_type' => $input['leave_type'],
            ':start_date' => $input['start_date'],
            ':end_date' => $input['end_date'],
            ':days_requested' => $input['days_requested'],
            ':reason' => sanitizeInput($input['reason']),
            ':address' => sanitizeInput($input['address_on_leave'] ?? ''),
            ':contact' => sanitizeInput($input['contact_number'] ?? '')
        ]);
        
        $requestId = $db->lastInsertId();
        
        // Log the action
        $logStmt = $db->prepare("
            INSERT INTO audit_log (user_id, action, table_name, record_id)
            VALUES (:user_id, 'create_leave_request', 'leave_requests', :record_id)
        ");
        $logStmt->execute([
            ':user_id' => $_SESSION['user_id'],
            ':record_id' => $requestId
        ]);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Leave request submitted successfully',
            'request_id' => $requestId
        ], 201);
        
    } catch (PDOException $e) {
        error_log("Create leave request error: " . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'error' => 'Failed to create leave request.'
        ], 500);
    }
}

/**
 * PUT: Update leave request (approve/reject)
 */
elseif ($method === 'PUT') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $requiredFields = ['request_id', 'action'];
        $missing = validateRequiredFields($input, $requiredFields);
        
        if (!empty($missing)) {
            sendJsonResponse([
                'success' => false,
                'error' => 'Missing required fields: ' . implode(', ', $missing)
            ], 400);
        }
        
        $requestId = $input['request_id'];
        $action = $input['action']; // 'approve' or 'reject'
        $remarks = sanitizeInput($input['remarks'] ?? '');
        $userRole = $_SESSION['role'];
        $userId = $_SESSION['user_id'];
        
        // Determine new status and update fields based on role
        // Using whitelist approach for security - only predefined field names allowed
        $approvalFields = [
            'coy_comd' => [
                'status' => 'approved_coy_comd',
                'approver' => 'coy_comd_approved_by',
                'time' => 'coy_comd_approved_at',
                'remarks' => 'coy_comd_remarks'
            ],
            'adjutant' => [
                'status' => 'approved_adjutant',
                'approver' => 'adjutant_approved_by',
                'time' => 'adjutant_approved_at',
                'remarks' => 'adjutant_remarks'
            ],
            'bsm' => [
                'status' => 'approved_bsm',
                'approver' => 'bsm_approved_by',
                'time' => 'bsm_approved_at',
                'remarks' => 'bsm_remarks'
            ],
            'commanding_officer' => [
                'status' => 'approved_co',
                'approver' => 'co_approved_by',
                'time' => 'co_approved_at',
                'remarks' => 'co_remarks'
            ]
        ];
        
        if ($action === 'approve') {
            // Validate role exists in whitelist
            if (!isset($approvalFields[$userRole])) {
                sendJsonResponse([
                    'success' => false,
                    'error' => 'Invalid user role for approval'
                ], 403);
            }
            
            $fields = $approvalFields[$userRole];
            $newStatus = $fields['status'];
            $approverField = $fields['approver'];
            $approverTimeField = $fields['time'];
            $remarksField = $fields['remarks'];
            
            // Now safe to use these validated field names in query
            $stmt = $db->prepare("
                UPDATE leave_requests 
                SET status = :status,
                    $approverField = :user_id,
                    $approverTimeField = NOW(),
                    $remarksField = :remarks
                WHERE request_id = :request_id
            ");
            
        } else { // reject
            $stmt = $db->prepare("
                UPDATE leave_requests 
                SET status = 'rejected',
                    rejected_by = :user_id,
                    rejected_at = NOW(),
                    rejection_reason = :remarks
                WHERE request_id = :request_id
            ");
        }
        
        $stmt->execute([
            ':status' => $newStatus ?? 'rejected',
            ':user_id' => $userId,
            ':remarks' => $remarks,
            ':request_id' => $requestId
        ]);
        
        // Log the action
        $logStmt = $db->prepare("
            INSERT INTO audit_log (user_id, action, table_name, record_id)
            VALUES (:user_id, :action, 'leave_requests', :record_id)
        ");
        $logStmt->execute([
            ':user_id' => $userId,
            ':action' => $action . '_leave',
            ':record_id' => $requestId
        ]);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Leave request ' . ($action === 'approve' ? 'approved' : 'rejected') . ' successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Update leave request error: " . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'error' => 'Failed to update leave request.'
        ], 500);
    }
}

else {
    sendJsonResponse([
        'success' => false,
        'error' => 'Method not allowed'
    ], 405);
}
?>
