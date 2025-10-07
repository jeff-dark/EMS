# EMS Platform

## Teacher Registration & Assignment System

This system allows registering a Teacher (based on an existing `User` record with the `teacher` role) and assigning them to multiple Courses and specific Units under those Courses in a single form.

### Schema Overview

Tables involved:
- `teachers` (id, user_id, contact_phone, hire_date, timestamps)
- `teacher_unit_assignments` (id, teacher_id, unit_id, assignment_status, start_date, end_date, timestamps)
- `courses` (id, name, description, timestamps)
- `units` (id, course_id, title, order, summary, timestamps)

Key constraints:
- `units.course_id` enforces a Unit belongs to exactly one Course.
- Many-to-Many between Teachers and Units via `teacher_unit_assignments` with unique `(teacher_id, unit_id)`.

### Eloquent Relationships
- `Teacher` -> `units()` belongsToMany with pivot data (status, start/end dates)
- `Unit` -> `teachers()` belongsToMany
- `TeacherUnitAssignment` pivot model for reporting/manipulation (optional usage)

### Registration Workflow
1. Admin selects an existing `User` with role `teacher` not yet linked to `teachers` table.
2. Admin selects one or more Courses.
3. Units list dynamically filters to only Units from chosen Courses.
4. Admin selects multiple Units across the selected Courses.
5. Submission validates that every Unit belongs to a selected Course; otherwise returns validation error.
6. A `Teacher` record is created and assignments inserted into `teacher_unit_assignments` with default `active` status.

### Reporting Endpoints
- Teacher Load Report: `/teachers/{teacher}/load-report` — lists all (Course, Unit, Status) for a teacher.
- Course Assignment Report: `/courses/{course}/teacher-assignments` — lists all teachers teaching any Unit in a Course with Units they teach.
- Unit Assignment Report: `/units/{unit}/teacher-assignments` — lists all teachers for a specific Unit.

### Validation Rules
- `user_id` must be unique in `teachers` table.
- `courses[]` and `units[]` required arrays.
- Server verifies each `unit.course_id` is in selected `courses[]`.

### Extending
- Add policy for `Teacher` to restrict which roles can manage assignments.
- Add ability to set `assignment_status` or end assignments (update pivot fields).
- Add soft deletes to `teacher_unit_assignments` if historical tracking is needed.

### Example Query Snippets
Retrieve teacher load:
```php
Teacher::with('units.course')->find($id);
```

Teachers per course:
```php
$teachers = Teacher::whereHas('units', fn($q) => $q->where('course_id', $courseId))->get();
```

Teachers for a unit:
```php
$unit = Unit::with('teachers.user')->find($unitId);
```

### Migrations
Run:
```bash
php artisan migrate
```

### Frontend
React + Inertia pages under `resources/js/Pages/Teachers` implement dynamic filtering and CRUD.
