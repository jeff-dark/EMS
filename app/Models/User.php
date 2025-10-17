<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

        public function courses()
        {
            return $this->belongsToMany(Course::class, 'course_student', 'student_id', 'course_id')->withTimestamps();
        }

        public function units()
        {
            return $this->belongsToMany(Unit::class, 'student_unit', 'student_id', 'unit_id')->withTimestamps();
        }

    public function hasRole(string $roleName): bool
    {
        if (!$this->role || !$this->role->name) {
            return false;
        }
        // Normalize both strings: lowercase, trim, remove spaces and dashes
        $normalize = function (string $name) {
            return strtolower(str_replace([' ', '-'], '', trim($name)));
        };
        $userRole = $normalize($this->role->name);
        $target = $normalize($roleName);
        if ($userRole === $target) {
            return true;
        }
        // Accept common admin synonyms
        $adminAliases = ['admin', 'administrator', 'superadmin', 'superadministrator'];
        if (in_array($userRole, $adminAliases, true) && in_array($target, ['admin', 'administrator'], true)) {
            return true;
        }
        return false;
    }

    public function hasAnyRole(string ...$roleNames): bool
    {
        foreach ($roleNames as $name) {
            if ($this->hasRole($name)) return true;
        }
        return false;
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }
}
