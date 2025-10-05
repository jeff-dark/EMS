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
        'title',
        'duration_minutes',
        'passing_score',
        'is_published',
    ];

    /**
     * Get the unit that owns the exam (Inverse of the relationship).
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'passing_score' => 'float',
        ];
    }
}