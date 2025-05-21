<?php

namespace App\Http\Controllers\Api;

use App\Models\Rapport;
use App\Models\Intervention;
use App\Models\Renovation;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class RapportController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Rapport::class;
        $this->validationRules = [
            'titre' => 'nullable|string|max:255',
            'dateCreation' => 'required|date',
            'contenu' => 'required|string',
            'validation' => 'boolean',
            'intervention_id' => 'required|exists:Intervention,id'
        ];
        $this->relations = [
            'intervention', 
            'intervention.machine',
            'gestionAdministrative'
        ];
        
        // Apply permission middleware
        $this->middleware('permission:rapport-list', ['only' => ['index']]);
        $this->middleware('permission:rapport-create', ['only' => ['store']]);
        $this->middleware('permission:rapport-edit', ['only' => ['update']]);
        $this->middleware('permission:rapport-view', ['only' => ['show']]);
        $this->middleware('permission:rapport-delete', ['only' => ['destroy']]);
        $this->middleware('permission:rapport-validate', ['only' => ['validateRapport']]);
    }
    
    /**
     * Override index to load additional data
     */
    public function index(): JsonResponse
    {
        $records = $this->model::with($this->relations)->get();
        
        // For each rapport, check if the intervention is associated with renovation or maintenance
        foreach ($records as $rapport) {
            $this->appendInterventionDetails($rapport);
        }
        
        return response()->json(['data' => $records], 200);
    }
    
    /**
     * Override show to load additional data
     */
    public function show($id): JsonResponse
    {
        $record = $this->model::with($this->relations)->find($id);
        
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }
        
        $this->appendInterventionDetails($record);
        
        return response()->json(['data' => $record], 200);
    }
    
    /**
     * Store a newly created rapport.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if rapport already exists for this intervention
        $existingRapport = Rapport::where('intervention_id', $request->intervention_id)->first();
        if ($existingRapport) {
            return response()->json([
                'message' => 'A rapport already exists for this intervention',
                'data' => $existingRapport
            ], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Add title if not provided
            if (!$request->has('titre') || !$request->titre) {
                // Create a title based on the intervention type and ID
                $intervention = Intervention::find($request->intervention_id);
                if ($intervention) {
                    $request->merge([
                        'titre' => 'Rapport - ' . $intervention->typeOperation . ' #' . $intervention->id
                    ]);
                }
            }
            
            // Create rapport
            $rapport = Rapport::create($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $rapport->load($this->relations);
            $this->appendInterventionDetails($rapport);
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update rapport.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $rapport = Rapport::find($id);
        
        if (!$rapport) {
            return response()->json(['message' => 'Rapport not found'], 404);
        }
        
        // If rapport is already validated, don't allow updates
        if ($rapport->validation) {
            return response()->json(['message' => 'Cannot update a validated rapport'], 422);
        }
        
        $validator = Validator::make($request->all(), [
            'titre' => 'nullable|string|max:255',
            'dateCreation' => 'required|date',
            'contenu' => 'required|string',
            'validation' => 'boolean',
            'intervention_id' => 'required|exists:Intervention,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update rapport
            $rapport->update($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $rapport->load($this->relations);
            $this->appendInterventionDetails($rapport);
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Validate a rapport.
     */
    public function validateRapport(Request $request, $id): JsonResponse
    {
        $rapport = Rapport::find($id);
        
        if (!$rapport) {
            return response()->json(['message' => 'Rapport not found'], 404);
        }
        
        // Already validated
        if ($rapport->validation) {
            return response()->json(['message' => 'Rapport is already validated'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Validate the rapport
            $rapport->validation = true;
            $rapport->save();
            
            // Complete the intervention
            $intervention = $rapport->intervention;
            if ($intervention) {
                $intervention->statut = 'COMPLETED';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $rapport->load($this->relations);
            $this->appendInterventionDetails($rapport);
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport validated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error validating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get rapports by intervention ID.
     */
    public function byIntervention($interventionId): JsonResponse
    {
        $intervention = Intervention::find($interventionId);
        
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        $rapport = Rapport::where('intervention_id', $interventionId)
            ->with($this->relations)
            ->first();
            
        if (!$rapport) {
            return response()->json(['message' => 'No rapport found for this intervention'], 404);
        }
        
        $this->appendInterventionDetails($rapport);
            
        return response()->json(['data' => $rapport], 200);
    }
    
    /**
     * Get rapports by validation status.
     */
    public function byValidationStatus($validated): JsonResponse
    {
        $isValidated = ($validated === 'true' || $validated === '1');
        
        $rapports = Rapport::where('validation', $isValidated)
            ->with($this->relations)
            ->get();
            
        foreach ($rapports as $rapport) {
            $this->appendInterventionDetails($rapport);
        }
            
        return response()->json(['data' => $rapports], 200);
    }
    
    /**
     * Helper method to append renovation and maintenance details to the rapport
     */
    private function appendInterventionDetails($rapport)
    {
        if (!$rapport->intervention_id) {
            return;
        }
        
        // Check if there's a renovation for this intervention
        $renovation = Renovation::where('intervention_id', $rapport->intervention_id)->first();
        if ($renovation) {
            $renovation->load('intervention.machine');
            $rapport->renovation = $renovation;
            $rapport->renovation_id = $renovation->intervention_id;
        }
        
        // Check if there's a maintenance for this intervention
        $maintenance = Maintenance::where('intervention_id', $rapport->intervention_id)->first();
        if ($maintenance) {
            $maintenance->load('intervention.machine');
            $rapport->maintenance = $maintenance;
            $rapport->maintenance_id = $maintenance->intervention_id;
        }
    }
}