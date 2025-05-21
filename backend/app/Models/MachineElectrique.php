<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineElectrique extends Model
{
    use HasFactory;
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'MachineElectrique';
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // Set to true if you have created_at and updated_at columns
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nom',
        'etat',
        'valeur',
        'type',
        'dateProchaineMaint',
        'details'
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'dateProchaineMaint' => 'datetime',
    ];
    
    /**
     * Get the interventions for the machine.
     */
    public function interventions()
    {
        return $this->hasMany(Intervention::class, 'machine_id');
    }
}