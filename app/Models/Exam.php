<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'unit_id', // The foreign key
        'teacher_id',
        'title',
        'duration_minutes',
        'passing_score',
        'is_published',
        'start_time',
        'end_time',
    ];

    /**
     * Get the unit that owns the exam (Inverse of the relationship).
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Questions that belong to this exam.
     */
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Sessions (student attempts) associated with this exam.
     */
    public function sessions()
    {
        return $this->hasMany(ExamSession::class);
    }

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'is_published' => 'boolean',
        'passing_score' => 'float',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    /**
     * Ensure `end_time` is computed from `start_time` + `duration_minutes` when saving.
     */
    protected static function booted()
    {
        static::saving(function (Exam $exam) {
            // Only compute end_time if it's not already set (preserve explicit end_time).
            if ($exam->start_time && $exam->duration_minutes && is_null($exam->end_time)) {
                $start = $exam->start_time instanceof \Illuminate\Support\Carbon
                    ? $exam->start_time
                    : \Illuminate\Support\Carbon::parse($exam->start_time);

                $exam->end_time = $start->copy()->addMinutes((int) $exam->duration_minutes);
            }
        });
    }
}