<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'summary',
        'order',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function exams()
    {
        // A Unit has many Exams
        return $this->hasMany(Exam::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_unit_assignments')
            ->withPivot(['assignment_status', 'start_date', 'end_date'])
            ->withTimestamps();
    }
}
