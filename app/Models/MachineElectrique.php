<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineElectrique extends Model
{
    use HasFactory;

    protected $table = 'MachineElectrique';
    public $timestamps = false;
    
    // Add these lines
    public $incrementing = false;
    protected $keyType = 'integer';
    
    protected $fillable = [
        'id', // Add id to fillable
        'nom',
        'etat',
        'valeur',
        'dateProchaineMaint',
    ];
    
    protected $casts = [
        'dateProchaineMaint' => 'date',
    ];
    
    public function interventions()
    {
        return $this->hasMany(Intervention::class, 'machine_id');
    }
}