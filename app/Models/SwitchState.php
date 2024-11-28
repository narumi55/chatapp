<?php

// app/Models/SwitchState.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SwitchState extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'state']; // mass assignmentを許可するフィールド
}
