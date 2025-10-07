<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Course, Role, Teacher, TeacherUnitAssignment, Unit, User};
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function __construct()
    {
        // Ensure user is authenticated for all teacher routes
        $this->middleware('auth');
    }

    public function index()
    {
        $teachers = Teacher::with(['user:id,name,email', 'units.course'])->get();
        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers->map(function($t){
                return [
                    'id' => $t->id,
                    'name' => $t->user->name,
                    'email' => $t->user->email,
                    'units_count' => $t->units->count(),
                    'courses' => $t->units->pluck('course.name')->unique()->values(),
                ];
            })
        ]);
    }

    public function create()
    {
        $courses = Course::with('units:id,course_id,title')->get(['id','name']);

        // Provide users who have teacher role but not yet linked in teachers table
        $teacherRole = Role::where('name','teacher')->first();
        $availableUsers = User::where('role_id', $teacherRole?->id)
            ->whereDoesntHave('teacher')
            ->get(['id','name','email']);

        return Inertia::render('Teachers/Create', [
            'courses' => $courses,
            'availableUsers' => $availableUsers,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id|unique:teachers,user_id',
            'contact_phone' => 'nullable|string|max:50',
            'hire_date' => 'nullable|date',
            'courses' => 'required|array|min:1',
            'courses.*' => 'integer|exists:courses,id',
            'units' => 'required|array|min:1',
            'units.*' => 'integer|exists:units,id',
        ]);

        // Ensure units belong to selected courses
        $unitCourses = Unit::whereIn('id', $data['units'])->pluck('course_id','id');
        $invalidUnits = $unitCourses->reject(fn($courseId) => in_array($courseId, $data['courses']))->keys();
        if ($invalidUnits->isNotEmpty()) {
            return back()->withErrors(['units' => 'One or more selected units are not part of the chosen courses.'])->withInput();
        }

        DB::transaction(function() use ($data) {
            $teacher = Teacher::create([
                'user_id' => $data['user_id'],
                'contact_phone' => $data['contact_phone'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
            ]);

            $now = now();
            $pivotData = [];
            foreach ($data['units'] as $unitId) {
                $pivotData[$unitId] = [
                    'assignment_status' => 'active',
                    'start_date' => $now->toDateString(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            $teacher->units()->attach($pivotData);
        });

        return redirect()->route('teachers.index')->with('message', 'Teacher registered and assignments saved.');
    }

    public function edit(Teacher $teacher)
    {
        $teacher->load(['user','units.course']);
        $courses = Course::with('units:id,course_id,title')->get(['id','name']);
        return Inertia::render('Teachers/Edit', [
            'teacher' => [
                'id' => $teacher->id,
                'user' => [
                    'id' => $teacher->user->id,
                    'name' => $teacher->user->name,
                    'email' => $teacher->user->email,
                ],
                'contact_phone' => $teacher->contact_phone,
                'hire_date' => $teacher->hire_date?->toDateString(),
                'units' => $teacher->units->map(fn($u) => [
                    'id' => $u->id,
                    'title' => $u->title,
                    'course_id' => $u->course_id,
                    'assignment_status' => $u->pivot->assignment_status,
                ])
            ],
            'courses' => $courses,
        ]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $data = $request->validate([
            'contact_phone' => 'nullable|string|max:50',
            'hire_date' => 'nullable|date',
            'courses' => 'required|array|min:1',
            'courses.*' => 'integer|exists:courses,id',
            'units' => 'required|array|min:1',
            'units.*' => 'integer|exists:units,id',
        ]);

        $unitCourses = Unit::whereIn('id', $data['units'])->pluck('course_id','id');
        $invalidUnits = $unitCourses->reject(fn($courseId) => in_array($courseId, $data['courses']))->keys();
        if ($invalidUnits->isNotEmpty()) {
            return back()->withErrors(['units' => 'One or more units do not belong to selected courses.'])->withInput();
        }

        DB::transaction(function() use ($teacher, $data) {
            $teacher->update([
                'contact_phone' => $data['contact_phone'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
            ]);

            $syncData = [];
            $now = now();
            foreach ($data['units'] as $unitId) {
                $syncData[$unitId] = [
                    'assignment_status' => 'active',
                    'start_date' => $now->toDateString(),
                    'updated_at' => $now,
                ];
            }
            $teacher->units()->sync($syncData);
        });

        return redirect()->route('teachers.index')->with('message', 'Teacher updated successfully.');
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        return redirect()->route('teachers.index')->with('message', 'Teacher deleted successfully.');
    }

    public function loadReport(Teacher $teacher)
    {
        $teacher->load(['user:id,name','units.course']);
        return Inertia::render('Teachers/Reports/Load', [
            'teacher' => $teacher,
            'units' => $teacher->units->map(function($unit){
                return [
                    'id' => $unit->id,
                    'title' => $unit->title,
                    'course' => [
                        'id' => $unit->course->id,
                        'name' => $unit->course->name,
                    ],
                    'assignment_status' => $unit->pivot->assignment_status,
                ];
            })
        ]);
    }

    public function courseAssignments(Course $course)
    {
        $course->load(['units.teachers.user']);
        $teachers = $course->units->flatMap->teachers->unique('id')->values()->map(function($t) use ($course) {
            return [
                'id' => $t->id,
                'name' => $t->user->name,
                'email' => $t->user->email,
                'units' => $t->units->where('course_id', $course->id)->pluck('title'),
            ];
        });
        return Inertia::render('Teachers/Reports/CourseAssignments', [
            'course' => $course->only(['id','name']),
            'teachers' => $teachers,
        ]);
    }

    public function unitAssignments(Unit $unit)
    {
        $unit->load(['course','teachers.user']);
        return Inertia::render('Teachers/Reports/UnitAssignments', [
            'unit' => [
                'id' => $unit->id,
                'title' => $unit->title,
                'course' => $unit->course->only(['id','name']),
            ],
            'teachers' => $unit->teachers->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name,
                'email' => $t->user->email,
                'assignment_status' => $t->pivot->assignment_status,
            ])
        ]);
    }
}
