<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $table = 'Rapport';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = true;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id',
        'titre',
        'dateCreation',
        'contenu',
        'validation',
        'intervention_id'
    ];
    
    protected $casts = [
        'dateCreation' => 'date',
        'validation' => 'boolean',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
    
    // Get the renovation related to this rapport via the intervention
    public function renovation()
    {
        return $this->hasOneThrough(
            Renovation::class, 
            Intervention::class,
            'id', // Foreign key on interventions table
            'intervention_id', // Foreign key on renovations table
            'intervention_id', // Local key on rapports table
            'id' // Local key on interventions table
        );
    }
    
    // Get the maintenance related to this rapport via the intervention
    public function maintenance()
    {
        return $this->hasOneThrough(
            Maintenance::class,
            Intervention::class,
            'id', // Foreign key on interventions table
            'intervention_id', // Foreign key on maintenances table
            'intervention_id', // Local key on rapports table
            'id' // Local key on interventions table
        );
    }
    
    public function gestionAdministrative()
    {
        return $this->hasOne(GestionAdministrative::class, 'rapport_id');
    }
    
    // Helper function to determine the type of rapport based on the intervention
    public function getTypeAttribute()
    {
        if (!$this->intervention) {
            return 'Undefined';
        }
        
        // Check if there's a renovation for this intervention
        $renovation = Renovation::where('intervention_id', $this->intervention_id)->first();
        if ($renovation) {
            return 'Rénovation';
        }
        
        // Check if there's a maintenance for this intervention
        $maintenance = Maintenance::where('intervention_id', $this->intervention_id)->first();
        if ($maintenance) {
            return 'Maintenance';
        }
        
        return 'Autre';
    }
}