<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ControleQualite extends Model
{
    use HasFactory;

    protected $table = 'ControleQualite';
    public $timestamps = false;
    
    protected $fillable = [
        'dateControle',
        'resultatsEssais',
        'analyseVibratoire',
        'intervention_id',
    ];
    
    protected $casts = [
        'dateControle' => 'date',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
}