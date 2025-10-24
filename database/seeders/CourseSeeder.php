<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'name' => 'Introduction to Python Programming',
                'description' => 'A beginner-friendly course covering the basics of Python syntax, data structures, and fundamental programming concepts.',
            ],
            [
                'name' => 'Web Development with React',
                'description' => 'Learn to build dynamic and modern single-page applications using the React JavaScript library.',
            ],
            [
                'name' => 'Database Management with SQL',
                'description' => 'Master the essentials of relational databases, including table design, querying, and data manipulation using SQL.',
            ],
            [
                'name' => 'Advanced Data Science with R',
                'description' => 'A deep dive into statistical modeling, machine learning, and data visualization using the R programming language.',
            ],
        ];

        // Idempotent seeding: create or update by unique name
        foreach ($courses as $data) {
            Course::updateOrCreate(
                ['name' => $data['name']],
                ['description' => $data['description']]
            );
        }
    }
}