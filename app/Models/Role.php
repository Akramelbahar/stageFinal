<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $table = 'Role';
    public $timestamps = false;
    public $incrementing = false; // Tell Laravel this is not an auto-incrementing key
    
    protected $fillable = [
        'id',
        'nom',
        'cout',
    ];
    
    protected $casts = [
        'cout' => 'float',
    ];
    
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'RolePermission', 'role_id', 'permission_id');
    }
    
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'UtilisateurRole', 'role_id', 'utilisateur_id');
    }
}