<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherUnitAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'unit_id',
        'assignment_status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
