<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $table = 'Section';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = false;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id', // Add id to fillable
        'nom',
        'type',
        'responsable_id',
    ];
    
    public function responsable()
    {
        return $this->belongsTo(Utilisateur::class, 'responsable_id');
    }
    
    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'section_id');
    }
}