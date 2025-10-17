Audit Logging System
====================

Overview
- Stores user actions in `audit_logs` table asynchronously via queue.
- Observes model CRUD, listens to auth events, and logs sensitive views.
- Admin-only Inertia UI at /admin/logs with filters and CSV export.

Setup
1) Run migrations and queue worker for audit queue.
2) Ensure your users have an Admin role named exactly `Admin`.
3) Optionally adjust retention in `config/audit.php`.

Commands
- `php artisan audit:prune --days=365` to prune old logs.

Notes
- Sensitive fields are redacted.
- Logs are immutable through UI; restrict DB access to maintain integrity.
