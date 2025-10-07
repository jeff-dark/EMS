<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\{Exam, Question};

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate questions to avoid duplicates on reseed
        DB::table('questions')->truncate();

        $exams = Exam::all();

        if ($exams->isEmpty()) {
            $this->command?->warn('No exams found. Run ExamSeeder first.');
            return;
        }

        $defaultContents = [
            'What is the primary objective of this exam topic?',
            'Explain a key concept related to this unit.',
            'Choose the correct definition for the given term.',
            'Which of the following best describes the process explained?',
            'Identify the missing step in the described workflow.',
            'Provide an example that illustrates the core principle discussed.',
            'Select the correct option based on the scenario provided.',
            'Short answer: summarize the main idea in one sentence.',
        ];

        foreach ($exams as $exam) {
            // Ensure at least 6 questions per exam
            $minQuestions = 6;
            $existing = $exam->questions()->count();
            $toCreate = max(0, $minQuestions - $existing);

            // Always create if truncation done, $existing will be 0
            if ($toCreate === 0) {
                continue; // Already enough
            }

            $questionsData = [];
            for ($i = 0; $i < $toCreate; $i++) {
                $contentIndex = $i % count($defaultContents);
                $questionsData[] = [
                    'exam_id' => $exam->id,
                    'content' => $defaultContents[$contentIndex] . " (Q" . ($i + 1) . ")",
                    'points' => 1.00,
                    'order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Question::insert($questionsData);
        }

        $this->command?->info('Questions seeded: ensured each exam has at least 6 questions.');
    }
}
