<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'user_id',
        'started_at',
        'submitted_at',
        'score',
        'is_graded',
        'graded_by_teacher_id',
        'teacher_comment',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'is_graded' => 'boolean',
        'score' => 'float',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function gradedBy()
    {
        return $this->belongsTo(Teacher::class, 'graded_by_teacher_id');
    }

    public function studentAnswers()
    {
        return $this->hasMany(StudentAnswer::class);
    }
}
