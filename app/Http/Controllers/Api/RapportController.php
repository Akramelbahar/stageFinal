<?php

namespace App\Http\Controllers\Api;

use App\Models\Rapport;
use App\Models\Renovation;
use App\Models\Maintenance;
use App\Models\PrestataireExterne;
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
            'dateCreation' => 'required|date',
            'contenu' => 'required|string',
            'validation' => 'boolean',
            'renovation_id' => 'nullable|exists:Renovation,intervention_id',
            'maintenance_id' => 'nullable|exists:Maintenance,intervention_id',
            'prestataire_id' => 'nullable|exists:PrestataireExterne,id',
        ];
        $this->relations = [
            'renovation', 
            'renovation.intervention.machine', 
            'maintenance', 
            'maintenance.intervention.machine',
            'prestataire',
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
     * Store a newly created rapport.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check that at least one related entity is provided
        if (!$request->renovation_id && !$request->maintenance_id && !$request->prestataire_id) {
            return response()->json([
                'message' => 'At least one of renovation_id, maintenance_id, or prestataire_id must be provided'
            ], 422);
        }
        
        // Check if rapport already exists for this renovation/maintenance
        if ($request->renovation_id) {
            $existingRapport = Rapport::where('renovation_id', $request->renovation_id)->first();
            if ($existingRapport) {
                return response()->json([
                    'message' => 'A rapport already exists for this renovation',
                    'data' => $existingRapport
                ], 422);
            }
        }
        
        if ($request->maintenance_id) {
            $existingRapport = Rapport::where('maintenance_id', $request->maintenance_id)->first();
            if ($existingRapport) {
                return response()->json([
                    'message' => 'A rapport already exists for this maintenance',
                    'data' => $existingRapport
                ], 422);
            }
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create rapport
            $rapport = Rapport::create($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $rapport->load($this->relations);
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update rapport.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
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
            'dateCreation' => 'required|date',
            'contenu' => 'required|string',
            'validation' => 'boolean',
            'prestataire_id' => 'nullable|exists:PrestataireExterne,id',
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
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Validate a rapport.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
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
            
            // If connected to a renovation or maintenance, also complete the intervention
            if ($rapport->renovation_id) {
                $intervention = $rapport->renovation->intervention;
                $intervention->statut = 'COMPLETED';
                $intervention->save();
            } else if ($rapport->maintenance_id) {
                $intervention = $rapport->maintenance->intervention;
                $intervention->statut = 'COMPLETED';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $rapport->load($this->relations);
            
            return response()->json(['data' => $rapport, 'message' => 'Rapport validated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error validating rapport', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get rapport by renovation ID.
     *
     * @param int $renovationId
     * @return JsonResponse
     */
    public function byRenovation($renovationId): JsonResponse
    {
        $renovation = Renovation::find($renovationId);
        
        if (!$renovation) {
            return response()->json(['message' => 'Renovation not found'], 404);
        }
        
        $rapport = Rapport::where('renovation_id', $renovationId)
            ->with($this->relations)
            ->first();
            
        if (!$rapport) {
            return response()->json(['message' => 'No rapport found for this renovation'], 404);
        }
            
        return response()->json(['data' => $rapport], 200);
    }
    
    /**
     * Get rapport by maintenance ID.
     *
     * @param int $maintenanceId
     * @return JsonResponse
     */
    public function byMaintenance($maintenanceId): JsonResponse
    {
        $maintenance = Maintenance::find($maintenanceId);
        
        if (!$maintenance) {
            return response()->json(['message' => 'Maintenance not found'], 404);
        }
        
        $rapport = Rapport::where('maintenance_id', $maintenanceId)
            ->with($this->relations)
            ->first();
            
        if (!$rapport) {
            return response()->json(['message' => 'No rapport found for this maintenance'], 404);
        }
            
        return response()->json(['data' => $rapport], 200);
    }
    
    /**
     * Get rapports by prestataire ID.
     *
     * @param int $prestataireId
     * @return JsonResponse
     */
    public function byPrestataire($prestataireId): JsonResponse
    {
        $prestataire = PrestataireExterne::find($prestataireId);
        
        if (!$prestataire) {
            return response()->json(['message' => 'Prestataire not found'], 404);
        }
        
        $rapports = Rapport::where('prestataire_id', $prestataireId)
            ->with($this->relations)
            ->get();
            
        return response()->json(['data' => $rapports], 200);
    }
    
    /**
     * Get rapports by validation status.
     *
     * @param bool $validated
     * @return JsonResponse
     */
    public function byValidationStatus($validated): JsonResponse
    {
        $isValidated = ($validated === 'true' || $validated === '1');
        
        $rapports = Rapport::where('validation', $isValidated)
            ->with($this->relations)
            ->get();
            
        return response()->json(['data' => $rapports], 200);
    }
}