<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenancePiece extends Model
{
    use HasFactory;

    protected $table = 'MaintenancePieces';
    public $timestamps = false;
    
    // Since we have a composite primary key
    protected $primaryKey = null;
    public $incrementing = true;
    
    protected $fillable = [
        'maintenance_id',
        'piece',
    ];
    
    public function maintenance()
    {
        return $this->belongsTo(Maintenance::class, 'maintenance_id');
    }
}