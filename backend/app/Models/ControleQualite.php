<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ControleQualite extends Model
{
    use HasFactory;

    protected $table = 'ControleQualite';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = false;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id', // Add id to fillable
        'dateControle',
        'resultatsEssais',
        'analyseVibratoire',
        'resultatGlobal',
        'observations',
        'conformite',
        'actionsCorrectives',
        'intervention_id',
    ];
    
    protected $casts = [
        'dateControle' => 'date',
        'conformite' => 'boolean',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
}