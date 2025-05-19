<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'Permission';
    public $timestamps = false;
    public $incrementing = true; // Tell Laravel this is not an auto-incrementing key
    
    protected $fillable = [
        'id',
        'module',
        'action',
        'description',
    ];
    
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'RolePermission', 'permission_id', 'role_id');
    }
}