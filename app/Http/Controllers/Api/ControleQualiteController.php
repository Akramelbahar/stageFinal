<?php

namespace App\Http\Controllers\Api;

use App\Models\ControleQualite;
use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ControleQualiteController extends BaseApiController
{
    public function __construct()
    {
        $this->model = ControleQualite::class;
        $this->validationRules = [
            'dateControle' => 'required|date',
            'resultatsEssais' => 'nullable|string',
            'analyseVibratoire' => 'nullable|string',
            'intervention_id' => 'required|exists:Intervention,id',
        ];
        $this->relations = ['intervention', 'intervention.machine'];
        
        // Apply permission middleware
        $this->middleware('permission:controle-list', ['only' => ['index']]);
        $this->middleware('permission:controle-create', ['only' => ['store']]);
        $this->middleware('permission:controle-edit', ['only' => ['update']]);
        $this->middleware('permission:controle-view', ['only' => ['show']]);
        $this->middleware('permission:controle-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created controle qualite.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if controle already exists for this intervention
        $existingControle = ControleQualite::where('intervention_id', $request->intervention_id)->first();
        if ($existingControle) {
            return response()->json([
                'message' => 'A controle qualite already exists for this intervention',
                'data' => $existingControle
            ], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create controle
            $controle = ControleQualite::create($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $controle->load($this->relations);
            
            return response()->json(['data' => $controle, 'message' => 'Controle qualite created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating controle qualite', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update controle qualite.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $controle = ControleQualite::find($id);
        
        if (!$controle) {
            return response()->json(['message' => 'Controle qualite not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'dateControle' => 'required|date',
            'resultatsEssais' => 'nullable|string',
            'analyseVibratoire' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update controle
            $controle->update($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $controle->load($this->relations);
            
            return response()->json(['data' => $controle, 'message' => 'Controle qualite updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating controle qualite', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get controle qualite by intervention ID.
     *
     * @param int $interventionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byIntervention($interventionId)
    {
        $intervention = Intervention::find($interventionId);
        
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        $controle = ControleQualite::where('intervention_id', $interventionId)
            ->with($this->relations)
            ->first();
            
        if (!$controle) {
            return response()->json(['message' => 'No controle qualite found for this intervention'], 404);
        }
            
        return response()->json(['data' => $controle], 200);
    }
    
    /**
     * Get recent controles qualite.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent()
    {
        $controles = ControleQualite::with($this->relations)
            ->orderBy('dateControle', 'desc')
            ->limit(10)
            ->get();
            
        return response()->json(['data' => $controles], 200);
    }
    
    /**
     * Get controles qualite by date range.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function byDateRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $controles = ControleQualite::with($this->relations)
            ->whereBetween('dateControle', [$request->startDate, $request->endDate])
            ->orderBy('dateControle', 'desc')
            ->get();
            
        return response()->json(['data' => $controles], 200);
    }
}