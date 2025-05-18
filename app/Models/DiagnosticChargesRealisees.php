<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiagnosticChargesRealisees extends Model
{
    use HasFactory;

    protected $table = 'DiagnosticChargesRealisees';
    public $timestamps = false;
    
    // Since we have a composite primary key
    protected $primaryKey = null;
    public $incrementing = false;
    
    protected $fillable = [
        'diagnostic_id',
        'charge',
    ];
    
    public function diagnostic()
    {
        return $this->belongsTo(Diagnostic::class, 'diagnostic_id');
    }
}