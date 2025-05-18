<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiagnosticTravailRequis extends Model
{
    use HasFactory;

    protected $table = 'DiagnosticTravailRequis';
    public $timestamps = false;
    
    // Since we have a composite primary key
    protected $primaryKey = null;
    public $incrementing = false;
    
    protected $fillable = [
        'diagnostic_id',
        'travail',
    ];
    
    public function diagnostic()
    {
        return $this->belongsTo(Diagnostic::class, 'diagnostic_id');
    }
}