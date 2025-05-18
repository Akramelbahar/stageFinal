<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GestionAdministrative extends Model
{
    use HasFactory;

    protected $table = 'GestionAdministrative';
    public $timestamps = false;
    
    protected $fillable = [
        'commandeAchat',
        'facturation',
        'validation',
        'rapport_id',
    ];
    
    protected $casts = [
        'validation' => 'boolean',
    ];
    
    public function rapport()
    {
        return $this->belongsTo(Rapport::class, 'rapport_id');
    }
    
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'UtilisateurGestionAdministrative', 'gestion_id', 'utilisateur_id');
    }
}