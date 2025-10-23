<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevisionDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'teacher_id',
        'title',
        'description',
        'file_path',
        'original_name',
        'file_size',
        'mime',
        'category',
        'tags',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'tags' => 'array',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
