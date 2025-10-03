<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // No custom casting needed yet, but we include the method for consistency.
        ];
    }
    
    // In the future, you can add relationships here, like:
    // public function units()
    // {
    //     return $this->hasMany(Unit::class);
    // }
}