<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Utilisateur extends Authenticatable
{
    use HasFactory;

    protected $table = 'Utilisateur';
    public $timestamps = false;
    public $incrementing = true; // Tell Laravel this is not auto-incrementing
    
    protected $fillable = [
        'id',
        'nom',
        'section',
        'credentials',
        'section_id',
        'api_token',
    ];
    
    protected $hidden = [
        'credentials',
        'api_token',
    ];
    
    public function sectionRelation()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
    
    public function sectionsGerées()
    {
        return $this->hasMany(Section::class, 'responsable_id');
    }
    
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'UtilisateurRole', 'utilisateur_id', 'role_id');
    }
    
    public function interventions()
    {
        return $this->belongsToMany(Intervention::class, 'UtilisateurIntervention', 'utilisateur_id', 'intervention_id');
    }
    
    public function planifications()
    {
        return $this->hasMany(Planification::class, 'utilisateur_id');
    }
    
    public function prestataires()
    {
        return $this->belongsToMany(PrestataireExterne::class, 'UtilisateurPrestataire', 'utilisateur_id', 'prestataire_id');
    }
    
    public function gestionsAdministratives()
    {
        return $this->belongsToMany(GestionAdministrative::class, 'UtilisateurGestionAdministrative', 'utilisateur_id', 'gestion_id');
    }
    
    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->credentials;
    }
}