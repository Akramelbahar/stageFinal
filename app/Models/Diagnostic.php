<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    use HasFactory;

    protected $table = 'Diagnostic';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = false;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id', // Add id to fillable
        'dateCreation',
        'intervention_id',
    ];
    
    protected $casts = [
        'dateCreation' => 'date',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
    
    public function travauxRequis()
    {
        return $this->hasMany(DiagnosticTravailRequis::class, 'diagnostic_id');
    }
    
    public function besoinsPDR()
    {
        return $this->hasMany(DiagnosticBesoinPDR::class, 'diagnostic_id');
    }
    
    public function chargesRealisees()
    {
        return $this->hasMany(DiagnosticChargesRealisees::class, 'diagnostic_id');
    }
    
    // Helper methods to get list items as arrays
    public function getTravaux()
    {
        return $this->travauxRequis()->pluck('travail')->toArray();
    }
    
    public function getBesoins()
    {
        return $this->besoinsPDR()->pluck('besoin')->toArray();
    }
    
    public function getCharges()
    {
        return $this->chargesRealisees()->pluck('charge')->toArray();
    }
}