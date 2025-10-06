<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'expected_answer',
        'rubric',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionAnswer extends Model
{
    protected $fillable = ['question_id', 'answer'];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
