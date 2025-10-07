<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'contact_phone',
        'hire_date',
    ];

    protected $casts = [
        'hire_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function units()
    {
        return $this->belongsToMany(Unit::class, 'teacher_unit_assignments')
            ->withPivot(['assignment_status', 'start_date', 'end_date'])
            ->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(TeacherUnitAssignment::class);
    }
}
