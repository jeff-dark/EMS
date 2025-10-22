<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
    ];

    /**
     * The underlying user account for this student.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Courses the student is enrolled in.
     * Uses the existing course_student pivot (student_id, course_id).
     */
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_student', 'student_id', 'course_id')
            ->withTimestamps();
    }

    /**
     * Units the student is enrolled in.
     * Uses the existing student_unit pivot (student_id, unit_id).
     */
    public function units()
    {
        return $this->belongsToMany(Unit::class, 'student_unit', 'student_id', 'unit_id')
            ->withTimestamps();
    }

    /**
     * Exam sessions taken by this student (via the student's user_id).
     */
    public function sessions()
    {
        return $this->hasMany(ExamSession::class, 'user_id', 'user_id');
    }
}
