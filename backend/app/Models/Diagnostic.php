<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    use HasFactory;

    protected $table = 'Diagnostic';
    public $timestamps = false;
    
    protected $fillable = [
        'id',
        'dateCreation',
        'intervention_id',
        'description',
        'resultatAnalyse',
        'observations'
    ];
    
    // Add this property to ensure the accessor methods are included in serialization
    protected $appends = ['travauxRequis', 'besoinsPDR', 'chargesRealisees'];
    
    protected $casts = [
        'dateCreation' => 'date',
    ];
    
    // Define the relation with Intervention
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
    
    // Define relations with related models for lists
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
    
    // Accessor methods to convert the related collections to strings
    public function getTravauxRequisAttribute()
    {
        $travaux = $this->travauxRequis()->pluck('travail')->first();
        return $travaux ?? '';
    }
    
    public function getBesoinsPDRAttribute()
    {
        $besoins = $this->besoinsPDR()->pluck('besoin')->first();
        return $besoins ?? '';
    }
    
    public function getChargesRealiseesAttribute()
    {
        $charges = $this->chargesRealisees()->pluck('charge')->first();
        return $charges ?? '';
    }
}