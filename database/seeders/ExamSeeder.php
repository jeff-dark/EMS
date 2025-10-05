<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Unit;

class ExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear the table first to prevent duplicate entries on re-run
        DB::table('exams')->truncate();

        // 2. Fetch all existing units. Exams must be attached to units.
        $units = Unit::all();
        $examsData = [];

        // 3. Define a standard set of AT LEAST FIVE exams for each unit
        $examTemplates = [
            [
                'title' => 'Unit Readiness Quiz',
                'duration_minutes' => 15,
                'passing_score' => 60.00,
                'is_published' => true,
            ],
            [
                'title' => 'Topic 1 Review Test',
                'duration_minutes' => 10,
                'passing_score' => 50.00,
                'is_published' => true,
            ],
            [
                'title' => 'Mid-Unit Assessment',
                'duration_minutes' => 30,
                'passing_score' => 75.00,
                'is_published' => false,
            ],
            [
                'title' => 'Final Practice Exam',
                'duration_minutes' => 45,
                'passing_score' => 80.00,
                'is_published' => false,
            ],
            [
                'title' => 'End-of-Unit Comprehensive Exam',
                'duration_minutes' => 60,
                'passing_score' => 70.00,
                'is_published' => false, 
            ],
        ];

        // 4. Loop through each unit and assign the exam templates
        foreach ($units as $unit) {
            foreach ($examTemplates as $template) {
                // Customize the exam title based on the parent unit
                $title = $unit->title . ' - ' . $template['title'];

                $examsData[] = [
                    'unit_id' => $unit->id,
                    'title' => $title,
                    'duration_minutes' => $template['duration_minutes'],
                    'passing_score' => $template['passing_score'],
                    'is_published' => $template['is_published'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // 5. Insert all compiled exam data into the database
        DB::table('exams')->insert($examsData);
    }
}