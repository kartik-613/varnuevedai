# Developer Guidelines & Engineering Standards

**Version:** 1.1.1  
**Last Updated:** 29 April 2026
**Last Updated By:** Ishu Sahu

This document outlines the core architectural principles, coding standards, and operational guidelines for the ChefboxAI project.

---

## 1. Backend Architecture & Folder Structure

The backend follows a service-oriented architectural pattern.

```text
chefboxai-api/
│
├── src/
│   ├── config/                # Environment, DB, Email, Razorpay configs (NO hardcoded values elsewhere)
│   ├── controllers/           # Route controllers (Auth, CRUD, Payments, Analytics)
│   ├── middlewares/           # Auth, Security, Validation, Upload, Error handler
│   ├── models/                # Sequelize models
│   ├── migrations/            # DB migrations
│   ├── seeders/               # Seed data
│   ├── repositories/          # DB query layer (optional but recommended)
│   ├── services/
│   │   ├── domain/            # Business logic (Orders, Users, Employees)
│   │   └── email/             # Email system
│   ├── routes/                # Express routers
│   ├── utils/                 # Helpers, constants, enums
│   ├── templates/             # Email / HTML templates
│   ├── public/                # Uploads & exported files
│   ├── logs/                  # Error & system logs
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
│
├── tests/                     # Unit & Integration tests
├── docs/                      # API & Architecture docs
├── scripts/                   # Maintenance scripts
├── .env.template
├── package.json
└── DEVELOPER_GUIDELINES.md
```

---

## 2. Configuration Management

**Rule: Zero Hardcoded Values**
- Remove all hardcoded credentials, timeouts, and thresholds from the codebase.
- Move rate limiting options, connection timeouts, pagination defaults, and integration keys to config files (`src/config/`).
- Utilize environment variables (`.env`) heavily to support distinct environments (`dev`, `stage`, `prod`).

---

## 3. Database Schema & Definitions

### 3.1 Schema Rules
- Use **Integer/UUID** for Primary Keys.
- Implement **Soft Delete** logic everywhere (Never delete records physically).
- Use **Audit Fields** on all tables.
- Use **Entity Prefix Naming** for all columns (e.g., `cf_user_name`).
- Utilize **2 Schemas**: `master` (reference data) and `public` (transactional data).

### 3.2 Naming Conventions
| Element    | Convention / Example |
| ---------- | --------------- |
| Table      | `cf_users`      |
| PK         | `cf_user_id`    |
| FK         | `cf_user_role_id`|
| Email      | `VARCHAR(150)`  |
| Phone      | `VARCHAR(15)`   |
| Money      | `DECIMAL(12,2)` |
| DateTime   | `TIMESTAMP`     |

### 3.3 Mandatory Database Columns
Every new table must include these core audit columns:
* `created_by` (Integer)
* `created_at` (TIMESTAMP)
* `modified_by` (Integer)
* `modified_at` (TIMESTAMP)
* `deleted_by` (Integer)
* `deleted_at` (TIMESTAMP)
* `status` (SMALLINT, Default 1)
* `is_deleted` (BOOLEAN, Default FALSE)

### 3.4 Table Template
```sql
CREATE TABLE public.cf_<entity> (
    cf_<entity>_id Integer PRIMARY KEY DEFAULT nextval('cf_<entity>_seq'),

    -- Business Columns
    cf_<entity>_name VARCHAR(150),

    -- Audit Fields (MANDATORY)
    cf_<entity>_created_by Integer,
    cf_<entity>_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cf_<entity>_modified_by Integer,
    cf_<entity>_modified_at TIMESTAMP,
    cf_<entity>_deleted_by Integer,
    cf_<entity>_deleted_at TIMESTAMP,
    cf_<entity>_status SMALLINT DEFAULT 1,
    cf_<entity>_is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_cf_<entity>_status ON public.cf_<entity> (cf_<entity>_status);
CREATE INDEX idx_cf_<entity>_isdeleted ON public.cf_<entity> (cf_<entity>_is_deleted);
```

---

## 4. API Standardization

### 4.1 Success Response (List / Paginated)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "rows": [
      { "Id": 1, "Name": "Example Item" }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 4.2 Success Response (Single Object)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "Id": 1,
    "Name": "Example Item"
  }
}
```

### 4.3 Failure / Global Error Response
```json
{
  "success": false,
  "message": "A database error occurred. Please try again or contact support.",
  "error": "Error stack trace... (Only sent in non-production environments)"
}
```

### 4.4 Validation Error Response
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "Email",
      "message": "Email is required"
    }
  ]
}
```

### 4.5 Centralized Response Messages & Constants
- **No Hardcoded Strings:** Never hardcode success or error messages directly inside specific route controllers or services.
- **Message Dictionary:** Store all application messages centrally inside `src/config/messages.js` as exported constants (e.g., `MSG.CRUD.OK`, `MSG.AUTH.INVALID_LOGIN`). 
- **Consistency & Maintainability:** By passing these mapped constants to the `respond.js` utility, we guarantee identical phrasing is sent to the frontend everywhere. This prevents scattered typos and makes future copy changes or multi-language support effortless.

---

## 5. Error Logging & Diagnostics

**Rule: Centralized Backend Logging via Winston**
- Implement centralized error logging across the entire backend ecosystem using `winston` and `winston-daily-rotate-file`.
- All fatal exceptions, API failures, and downstream system errors must be logged permanently to rotating file logs configured via the `.env` `LOG_FILE_PATH` variable (e.g., `error-YYYY-MM-DD.log`, `combined-YYYY-MM-DD.log`, `exceptions-YYYY-MM-DD.log`, `rejections-YYYY-MM-DD.log`).
- **Data Sanitization:** Sensitive fields in payloads (like `password`, `token`, `otp`) must be reliably sanitized and masked before being recorded in any log output.

**Required Log Details:**
* API Name / Route (`apiName`)
* HTTP Method (`method`)
* Request Payload (`payload` - strictly sanitized)
* Query Parameters (`query`)
* User ID (`userId` or Anonymous)
* Status Code (`status`)
* Stack Trace (`stack`)
* Error Message (`message`)
* Timestamp (`timestamp`)

**Example Log Record:**
```json
{
  "level": "error",
  "message": "Internal Server Error",
  "timestamp": "2026-04-04 10:00:00",
  "stack": "Error: Database connection timeout\\n    at...",
  "apiName": "/api/auth/login",
  "method": "POST",
  "userId": "Anonymous",
  "payload": {
    "email": "admin@local.com",
    "password": "********"
  },
  "query": {},
  "status": 500
}
```

---

## 6. File Handling (Imports & Exports)

### 6.1 Excel Import Handling
- **File Upload:** When an admin or user uploads an Excel file, the raw file **must** be saved to a specific server directory.
- **Processing:** The system must parse the uploaded file directly from disk and insert the data into the database.
- **Constraint:** Do not rely on the frontend parsing the file and sending JSON in the API payload. The backend assumes full responsibility for parsing the stored physical file to guarantee data integrity.

### 6.2 Export File Storage
- **File Output:** Every exported file (Excel, CSV, PDF) generated by the system must be physically stored.
- **Storage Location:** Save to the designated Contabo server directory. Maintain a structured folder hierarchy dynamically (e.g., `exports/YYYY/MM/DD/`).
- **Extensibility:** The storage utility must be abstracted via a service or configuration so that we can easily switch storage paths or migrate to remote buckets (e.g., AWS S3) in the future.

---

## 7. Frontend Optimization Guidelines

- **Limit API Calls:** Eliminate unnecessary background or duplicate API requests. 
- **Context-Specific Loading:** Ensure a page **only** requests data it actively needs to render.
- **No Over-fetching:** Do not preemptively load data for hidden tabs or separate modules until the user explicitly navigates to them.
- **Caching & Local State:** Leverage efficient caching strategies to retain data between navigations instead of refetching statically typed or rarely updated data.

---

## 8. Environment Database Strategy

Strict isolation between lifecycle phases is mandatory. Maintain entirely separate databases for:
* Development
* Integration testing
* User Acceptance Testing (UAT)
* Production
* Separate DB per specific enterprise client (where applicable, multi-tenant physical isolation)

---

## 9. Final Engineering Goals

If executing properly, the following objectives are achieved by default:
* **Enterprise-grade Architecture:** Resilient, robust, and scalable.
* **Config-driven Backend:** Variables, toggles, and setups are modular, not hardcoded.
* **Standardized Interactions:** Every API responds identically in structure.
* **100% Auditability:** Complete history recorded via full audit trails and soft deletes.
* **Test-Ready Code:** Decoupled systems via repositories and services making unit testing effortless.
* **Maintainable Paradigm:** Clean code requiring minimal onboarding for new developers.