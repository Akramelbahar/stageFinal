<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $table = 'Rapport';
    public $timestamps = false;
    
    protected $fillable = [
        'dateCreation',
        'contenu',
        'validation',
        'renovation_id',
        'maintenance_id',
        'prestataire_id',
    ];
    
    protected $casts = [
        'dateCreation' => 'date',
        'validation' => 'boolean',
    ];
    
    public function renovation()
    {
        return $this->belongsTo(Renovation::class, 'renovation_id');
    }
    
    public function maintenance()
    {
        return $this->belongsTo(Maintenance::class, 'maintenance_id');
    }
    
    public function prestataire()
    {
        return $this->belongsTo(PrestataireExterne::class, 'prestataire_id');
    }
    
    public function gestionAdministrative()
    {
        return $this->hasOne(GestionAdministrative::class, 'rapport_id');
    }
}