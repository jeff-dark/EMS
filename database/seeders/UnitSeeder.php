<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Course; // We need this to fetch the course IDs

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear the table first to prevent duplicate entries on re-run
        DB::table('units')->truncate();

        // 2. Fetch the IDs of the courses we created previously
        $courses = Course::all();
        $unitsData = [];

        // 3. Define the unit structure for each course
        $unitTemplates = [
            // General structure for most technical courses
            'basic' => [
                ['title' => 'Introduction and Setup', 'summary' => 'Environment setup and initial concepts.', 'order' => 1],
                ['title' => 'Core Data Structures', 'summary' => 'Understanding fundamental data types and collections.', 'order' => 2],
                ['title' => 'Control Flow and Functions', 'summary' => 'Logic, loops, and modular programming.', 'order' => 3],
                ['title' => 'Object-Oriented Programming (OOP)', 'summary' => 'Classes, inheritance, and polymorphism.', 'order' => 4],
            ],
        ];

        // 4. Loop through each course and assign units
        foreach ($courses as $course) {
            $template = $unitTemplates['basic']; // Use the basic template for all for simplicity

            // Customize the names slightly based on the course name for better realism
            $courseNamePrefix = match($course->name) {
                'Introduction to Python Programming' => 'Python Basics:',
                'Web Development with React' => 'React:',
                'Database Management with SQL' => 'SQL:',
                'Advanced Data Science with R' => 'R:',
                default => '',
            };

            foreach ($template as $index => $unit) {
                $unitsData[] = [
                    'course_id' => $course->id,
                    'title' => $courseNamePrefix . ' ' . $unit['title'],
                    'summary' => $unit['summary'],
                    'order' => $unit['order'],
                    'created_at' => now()->addSeconds($index), // Stagger creation time slightly
                    'updated_at' => now()->addSeconds($index),
                ];
            }
        }

        // 5. Insert all compiled units data into the database
        DB::table('units')->insert($unitsData);
    }
}