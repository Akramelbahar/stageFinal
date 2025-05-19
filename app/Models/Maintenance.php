<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $table = 'Maintenance';
    public $timestamps = false;
    
    protected $primaryKey = 'intervention_id';
    public $incrementing = true;
    
    protected $fillable = [
        'intervention_id',
        'typeMaintenance',
        'duree',
    ];
    
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id');
    }
    
    public function rapport()
    {
        return $this->hasOne(Rapport::class, 'maintenance_id');
    }
    
    public function pieces()
    {
        return $this->hasMany(MaintenancePiece::class, 'maintenance_id');
    }
    
    public function getPieces()
    {
        return $this->pieces()->pluck('piece')->toArray();
    }
}