<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrestataireExterne extends Model
{
    use HasFactory;

    protected $table = 'PrestataireExterne';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = false;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id', // Add id to fillable
        'nom',
        'contrat',
        'rapportOperation',
    ];
    
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'UtilisateurPrestataire', 'prestataire_id', 'utilisateur_id');
    }
    
    public function rapports()
    {
        return $this->hasMany(Rapport::class, 'prestataire_id');
    }
}