<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planification extends Model
{
    use HasFactory;

    protected $table = 'Planification';
    public $timestamps = false;
    
    protected $fillable = [
        'dateCreation',
        'capaciteExecution',
        'urgencePrise',
        'disponibilitePDR',
        'utilisateur_id',
    ];
    
    protected $casts = [
        'dateCreation' => 'date',
        'urgencePrise' => 'boolean',
        'disponibilitePDR' => 'boolean',
    ];
    
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
    
    public function interventions()
    {
        return $this->belongsToMany(Intervention::class, 'InterventionPlanification', 'planification_id', 'intervention_id');
    }
}