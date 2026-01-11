# ParadeOps Database Schema Diagram

This document provides a visual representation of the database structure and relationships.

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ParadeOps Database Schema                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     USERS        │
├──────────────────┤
│ PK user_id       │
│    username      │◄──────────┐
│    password_hash │           │
│    role          │           │ 1
│    email         │           │
│    is_active     │           │
└──────────────────┘           │
         △                     │
         │ 1                   │
         │                     │
         │ N                   │
         │                     │
┌────────▼─────────┐           │
│    SOLDIERS      │           │
├──────────────────┤           │
│ PK soldier_id    │           │
│ FK user_id       │───────────┘
│ FK company_id    │───────┐
│    service_number│       │
│    rank          │       │
│    full_name     │       │ N
│    phone         │       │
│    annual_leave  │       │
│    casual_leave  │       │ 1
│    rec_leave     │       │
│    current_status│       │
└──────────────────┘       │
         △                 │
         │ 1               │
         │                 │
         │ N               │
         │                 │
┌────────▼─────────┐  ┌────▼──────────────┐
│ LEAVE_REQUESTS   │  │    COMPANIES      │
├──────────────────┤  ├───────────────────┤
│ PK request_id    │  │ PK company_id     │
│ FK soldier_id    │  │    company_name   │
│    leave_type    │  │    company_code   │
│    start_date    │  │    total_strength │
│    end_date      │  └───────────────────┘
│    status        │            △
│    reason        │            │ 1
│    coy_approved  │            │
│    adjt_approved │            │
│    bsm_approved  │            │ N
│    co_approved   │            │
└──────────────────┘  ┌─────────▼──────────┐
         △            │ DAILY_PARADE_STATE │
         │ N          ├────────────────────┤
         │            │ PK parade_state_id │
         │ 1          │ FK company_id      │
         │            │    report_date     │
┌────────▼─────────┐  │    total_strength  │
│ ATTENDANCE_      │  │    present         │
│ RECORDS          │  │    on_leave        │
├──────────────────┤  │    on_duty         │
│ PK attendance_id │  │    awol            │
│ FK soldier_id    │  │    status          │
│    date          │  └────────────────────┘
│    morning_pt    │
│    office        │
│    afternoon_game│
│    roll_call     │
└──────────────────┘

┌──────────────────┐  ┌────────────────────┐
│   DUTY_ROSTER    │  │     NOTICES        │
├──────────────────┤  ├────────────────────┤
│ PK duty_id       │  │ PK notice_id       │
│ FK soldier_id    │  │    sender_role     │
│    duty_type     │  │    recipient_role  │
│    duty_date     │  │    notice_type     │
│    start_time    │  │    subject         │
│    end_time      │  │    content         │
│    location      │  │    priority        │
└──────────────────┘  │    is_read         │
                      └────────────────────┘

┌──────────────────┐
│   AUDIT_LOG      │
├──────────────────┤
│ PK log_id        │
│ FK user_id       │
│    action        │
│    table_name    │
│    record_id     │
│    ip_address    │
│    created_at    │
└──────────────────┘
```

## Table Descriptions

### Core Tables

#### 1. USERS
**Purpose:** Store user authentication and role information

**Key Fields:**
- `user_id` - Unique identifier
- `username` - Login username
- `password_hash` - Encrypted password (bcrypt)
- `role` - User role (soldier, coy_comd, adjutant, bsm, commanding_officer)

**Relationships:**
- One user can be linked to one soldier (optional)
- User actions are logged in audit_log

---

#### 2. COMPANIES
**Purpose:** Store military company/unit information

**Key Fields:**
- `company_id` - Unique identifier
- `company_name` - Full company name
- `company_code` - Short code (HQ, Radio, RR, BSC)

**Relationships:**
- One company has many soldiers
- One company has many daily parade states

---

#### 3. SOLDIERS
**Purpose:** Store soldier personal and service information

**Key Fields:**
- `soldier_id` - Unique identifier
- `service_number` - Military service number
- `rank` - Current rank
- `full_name` - Soldier's full name
- `annual_leave_balance` - Days of annual leave remaining
- `casual_leave_balance` - Days of casual leave remaining
- `recreational_leave_balance` - Days of recreational leave
- `current_status` - present, on_leave, on_duty, awol, medical

**Relationships:**
- Belongs to one company
- Can have one user account (optional)
- Has many leave requests
- Has many attendance records
- Has many duty assignments

---

#### 4. LEAVE_REQUESTS
**Purpose:** Store leave applications with approval workflow

**Key Fields:**
- `request_id` - Unique identifier
- `leave_type` - annual, casual, recreational, medical, emergency
- `start_date` - Leave start date
- `end_date` - Leave end date
- `status` - pending, approved_coy_comd, approved_adjutant, approved_bsm, approved_co, rejected

**Approval Workflow:**
1. Soldier submits → status: pending
2. Company Commander approves → status: approved_coy_comd
3. Adjutant approves → status: approved_adjutant
4. BSM approves → status: approved_bsm
5. CO approves → status: approved_co (final)

**Relationships:**
- Belongs to one soldier
- Tracks approver at each level

---

#### 5. ATTENDANCE_RECORDS
**Purpose:** Track daily attendance for multiple sessions

**Key Fields:**
- `morning_pt` - Morning physical training
- `office` - Office hours
- `afternoon_games` - Afternoon activities
- `roll_call` - Evening roll call

**Values:** present, absent, excused

**Relationships:**
- Belongs to one soldier
- One unique record per soldier per day

---

#### 6. DAILY_PARADE_STATE
**Purpose:** Store daily company strength reports

**Key Fields:**
- `report_date` - Date of the report
- `total_strength` - Total assigned personnel
- `present` - Personnel present
- `on_leave` - Personnel on leave
- `on_duty` - Personnel on duty
- `awol` - Absent without leave
- `status` - draft, submitted, approved

**Relationships:**
- Belongs to one company
- One report per company per day

---

### Supporting Tables

#### 7. NOTICES
**Purpose:** Store important notices and commitments

**Key Fields:**
- `sender_role` - Who sent the notice
- `recipient_role` - Who should receive it
- `notice_type` - next_day_commitment, urgent, information, directive
- `priority` - low, medium, high, urgent

**Use Cases:**
- BSM sends next day commitments to CO
- Adjutant sends information to CO
- Urgent directives to all roles

---

#### 8. DUTY_ROSTER
**Purpose:** Track duty assignments

**Key Fields:**
- `duty_type` - Type of duty (Guard, Orderly, etc.)
- `duty_date` - Date of duty
- `start_time` - Duty start time
- `end_time` - Duty end time
- `location` - Where the duty is assigned

**Relationships:**
- Belongs to one soldier

---

#### 9. AUDIT_LOG
**Purpose:** Security and compliance audit trail

**Key Fields:**
- `action` - What action was performed (login, approve_leave, etc.)
- `table_name` - Which table was affected
- `record_id` - Which record was affected
- `ip_address` - User's IP address

**Use Cases:**
- Track all login attempts
- Monitor leave approvals
- Security incident investigation
- Compliance reporting

---

## Database Views

### v_battalion_strength
Real-time battalion strength summary

**Columns:**
- total_strength
- present
- on_leave
- on_duty
- awol
- medical

**Usage:**
```sql
SELECT * FROM v_battalion_strength;
```

---

### v_company_strength
Company-wise strength breakdown

**Columns:**
- company_id, company_name, company_code
- total_strength, present, on_leave, on_duty, awol, medical

**Usage:**
```sql
SELECT * FROM v_company_strength ORDER BY company_name;
```

---

### v_pending_leaves
All pending leave requests with soldier details

**Columns:**
- request_id, service_number, full_name, rank
- company_name, leave_type, dates, status

**Usage:**
```sql
SELECT * FROM v_pending_leaves WHERE status = 'pending';
```

---

## Data Flow Examples

### 1. Leave Request Workflow

```
[Soldier] 
   ↓ Creates leave request
[LEAVE_REQUESTS] (status: pending)
   ↓
[Company Commander Dashboard]
   ↓ Approves
[LEAVE_REQUESTS] (status: approved_coy_comd)
   ↓
[Adjutant Dashboard]
   ↓ Approves
[LEAVE_REQUESTS] (status: approved_adjutant)
   ↓
[BSM Dashboard]
   ↓ Approves
[LEAVE_REQUESTS] (status: approved_bsm)
   ↓
[CO Dashboard]
   ↓ Final Approval
[LEAVE_REQUESTS] (status: approved_co)
   ↓
[Soldier] Receives notification
```

### 2. Daily Parade State Reporting

```
[Company Commander]
   ↓ Submits parade state
[DAILY_PARADE_STATE] (status: submitted)
   ↓
[BSM Dashboard] - Views all company reports
   ↓ Consolidates and forwards
[CO Dashboard] - Views battalion summary
   ↓ Reviews
[BATTALION_REPORT] Generated
```

### 3. User Authentication

```
[Login Page]
   ↓ Username, password, role
[Backend API] - /api/login
   ↓ Verify credentials
[USERS] Table
   ↓ Password hash check
[Success] - Generate token
   ↓ Log action
[AUDIT_LOG]
   ↓ Return dashboard URL
[User Dashboard]
```

---

## Indexes for Performance

### Primary Keys
All tables have primary keys for unique identification

### Foreign Key Indexes
- soldiers.user_id → users.user_id
- soldiers.company_id → companies.company_id
- leave_requests.soldier_id → soldiers.soldier_id
- attendance_records.soldier_id → soldiers.soldier_id
- daily_parade_state.company_id → companies.company_id

### Additional Indexes
- users(username) - Fast login lookups
- users(role) - Role-based queries
- soldiers(service_number) - Personnel searches
- soldiers(current_status) - Status filtering
- leave_requests(status) - Pending requests
- attendance_records(attendance_date) - Date-based queries
- daily_parade_state(report_date) - Report retrieval

---

## Data Integrity Rules

### Constraints
- **Unique Constraints:** usernames, service numbers, company codes
- **Foreign Keys:** Maintain referential integrity
- **Check Constraints:** Valid enum values (SQLite)
- **NOT NULL:** Required fields must have values

### Cascading Actions
- **ON DELETE CASCADE:** 
  - Delete soldier → delete attendance records
  - Delete soldier → delete leave requests
  - Delete company → delete parade states

- **ON DELETE SET NULL:**
  - Delete user → set soldier.user_id to NULL
  - Delete approver → set approval fields to NULL

- **ON DELETE RESTRICT:**
  - Cannot delete company if it has soldiers

---

## Security Considerations

### Password Security
- Passwords stored as bcrypt hashes
- Never stored in plain text
- Cost factor of 10 or higher

### SQL Injection Prevention
- All queries use prepared statements
- Input sanitization on all user data
- Parameterized queries only

### Access Control
- Role-based permissions enforced at database level
- Audit logging for all critical operations
- IP address tracking for security

### Data Privacy
- Personal information encrypted in transit
- Sensitive fields protected
- Access logs maintained

---

## Maintenance Queries

### Check Database Size
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'parade_ops'
ORDER BY (data_length + index_length) DESC;
```

### Find Old Records
```sql
-- Leave requests older than 1 year
SELECT COUNT(*) FROM leave_requests
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Active Users
```sql
SELECT role, COUNT(*) as count
FROM users
WHERE is_active = 1
GROUP BY role;
```

---

## Backup Strategy

### Daily Backups
```bash
mysqldump -u root -p parade_ops > parade_ops_backup_$(date +%Y%m%d).sql
```

### Weekly Full Backup
```bash
mysqldump -u root -p --all-databases > full_backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root -p parade_ops < parade_ops_backup_20260111.sql
```

---

## Related Documentation

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Setup instructions
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[backend/README.md](backend/README.md)** - API documentation
- **[README.md](README.md)** - Project overview
