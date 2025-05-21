<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Renovation extends Model
{
    use HasFactory;

    protected $table = 'Renovation';
    public $timestamps = false;
    
    protected $primaryKey = 'intervention_id';
    public $incrementing = true;
    
    protected $fillable = [
        'intervention_id',
        'disponibilitePDR',
        'objectif',
        'cout',
        'dureeEstimee',
    ];
    
    protected $casts = [
        'disponibilitePDR' => 'boolean',
        'cout' => 'float',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
    
    public function rapport()
    {
        return $this->hasOne(Rapport::class, 'renovation_id');
    }
}