<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Hash};
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
        // Fetch actual teacher records, and also show users with teacher role lacking a Teacher profile yet
        $teacherRoleId = Role::where('name','teacher')->value('id');

        $teachers = Teacher::with(['user:id,name,email', 'units.course'])->get()->map(function($t){
            return [
                'id' => $t->id,
                'name' => $t->user->name,
                'email' => $t->user->email,
                'units_count' => $t->units->count(),
                'courses' => $t->units->pluck('course.name')->unique()->values(),
                'status' => 'registered',
            ];
        });

        $unregistered = User::where('role_id', $teacherRoleId)
            ->whereDoesntHave('teacher')
            ->get(['id','name','email'])
            ->map(function($u){
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'units_count' => 0,
                    'courses' => collect(),
                    'status' => 'unregistered',
                ];
            });

        $combined = $teachers->concat($unregistered)->sortBy('name')->values();

        return Inertia::render('Teachers/Index', [
            'teachers' => $combined,
        ]);
    }

    public function create()
    {
        $courses = Course::with('units:id,course_id,title')->get(['id','name']);
        return Inertia::render('Teachers/Create', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
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
            $teacherRoleId = Role::where('name','teacher')->value('id');
            $newUser = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'username' => $data['username'],
                'password' => Hash::make($data['password']),
                'role_id' => $teacherRoleId,
                'email_verified_at' => now(),
            ]);

            $teacher = Teacher::create([
                'user_id' => $newUser->id,
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
                ])->values(),
            ],
            'courses' => $courses,
        ]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $unitsRule = $teacher->units()->count() === 0 ? 'array' : 'required|array|min:1';
        $data = $request->validate([
            'contact_phone' => 'nullable|string|max:50',
            'hire_date' => 'nullable|date',
            'courses' => 'required|array|min:1',
            'courses.*' => 'integer|exists:courses,id',
            'units' => $unitsRule,
            'units.*' => 'integer|exists:units,id',
        ]);

        if (!empty($data['units'])) {
            $unitCourses = Unit::whereIn('id', $data['units'])->pluck('course_id','id');
            $invalidUnits = $unitCourses->reject(fn($courseId) => in_array($courseId, $data['courses']))->keys();
            if ($invalidUnits->isNotEmpty()) {
                return back()->withErrors(['units' => 'One or more units do not belong to selected courses.'])->withInput();
            }
        }

        DB::transaction(function() use ($teacher, $data) {
            $teacher->update([
                'contact_phone' => $data['contact_phone'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
            ]);

            $syncData = [];
            $now = now();
            if (!empty($data['units'])) {
                foreach ($data['units'] as $unitId) {
                    $syncData[$unitId] = [
                        'assignment_status' => 'active',
                        'start_date' => $now->toDateString(),
                        'updated_at' => $now,
                    ];
                }
                $teacher->units()->sync($syncData);
            }
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
