<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Intervention extends Model
{
    use HasFactory;

    protected $table = 'Intervention';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = true;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id',
        'date',
        'description',
        'typeOperation',
        'statut',
        'urgence',
        'machine_id',
        'observation', // Add this line
    ];
    
    protected $casts = [
        'date' => 'date',
        'urgence' => 'boolean',
    ];
    
    public function machine()
    {
        return $this->belongsTo(MachineElectrique::class, 'machine_id');
    }
    
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'UtilisateurIntervention', 'intervention_id', 'utilisateur_id');
    }
    
    public function planifications()
    {
        return $this->belongsToMany(Planification::class, 'InterventionPlanification', 'intervention_id', 'planification_id');
    }
    
    public function diagnostic()
    {
        return $this->hasOne(Diagnostic::class, 'intervention_id');
    }
    
    public function controleQualite()
    {
        return $this->hasOne(ControleQualite::class, 'intervention_id');
    }
    
    public function renovation()
    {
        return $this->hasOne(Renovation::class, 'intervention_id');
    }
    
    public function maintenance()
    {
        return $this->hasOne(Maintenance::class, 'intervention_id');
    }
}