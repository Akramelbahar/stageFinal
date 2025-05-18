<?php

namespace App\Http\Controllers\Api;

use App\Models\Planification;
use App\Models\Intervention;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class PlanificationController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Planification::class;
        $this->validationRules = [
            'dateCreation' => 'required|date',
            'capaciteExecution' => 'required|integer',
            'urgencePrise' => 'boolean',
            'disponibilitePDR' => 'boolean',
            'utilisateur_id' => 'required|exists:Utilisateur,id',
        ];
        $this->relations = ['utilisateur', 'interventions', 'interventions.machine'];
        
        // Apply permission middleware
        $this->middleware('permission:planification-list', ['only' => ['index']]);
        $this->middleware('permission:planification-create', ['only' => ['store']]);
        $this->middleware('permission:planification-edit', ['only' => ['update']]);
        $this->middleware('permission:planification-view', ['only' => ['show']]);
        $this->middleware('permission:planification-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created planification with associated interventions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'interventions' => 'nullable|array',
            'interventions.*' => 'exists:Intervention,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create planification
            $planification = Planification::create([
                'dateCreation' => $request->dateCreation,
                'capaciteExecution' => $request->capaciteExecution,
                'urgencePrise' => $request->urgencePrise ?? false,
                'disponibilitePDR' => $request->disponibilitePDR ?? false,
                'utilisateur_id' => $request->utilisateur_id,
            ]);
            
            // Attach interventions if provided
            if ($request->has('interventions') && is_array($request->interventions)) {
                $planification->interventions()->sync($request->interventions);
                
                // Update intervention status if needed
                foreach ($request->interventions as $interventionId) {
                    $intervention = Intervention::find($interventionId);
                    if ($intervention && $intervention->statut == 'PENDING') {
                        $intervention->statut = 'PLANNED';
                        $intervention->save();
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $planification->load($this->relations);
            
            return response()->json(['data' => $planification, 'message' => 'Planification created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating planification', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update planification with associated interventions.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $planification = Planification::find($id);
        
        if (!$planification) {
            return response()->json(['message' => 'Planification not found'], 404);
        }
        
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'interventions' => 'nullable|array',
            'interventions.*' => 'exists:Intervention,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update planification
            $planification->update([
                'dateCreation' => $request->dateCreation,
                'capaciteExecution' => $request->capaciteExecution,
                'urgencePrise' => $request->urgencePrise ?? $planification->urgencePrise,
                'disponibilitePDR' => $request->disponibilitePDR ?? $planification->disponibilitePDR,
                'utilisateur_id' => $request->utilisateur_id,
            ]);
            
            // Update interventions if provided
            if ($request->has('interventions')) {
                // Get current interventions to check for removals
                $currentInterventions = $planification->interventions->pluck('id')->toArray();
                
                // Sync interventions
                $planification->interventions()->sync($request->interventions);
                
                // Update status for newly added interventions
                foreach ($request->interventions as $interventionId) {
                    if (!in_array($interventionId, $currentInterventions)) {
                        $intervention = Intervention::find($interventionId);
                        if ($intervention && $intervention->statut == 'PENDING') {
                            $intervention->statut = 'PLANNED';
                            $intervention->save();
                        }
                    }
                }
                
                // Reset status for removed interventions
                foreach ($currentInterventions as $interventionId) {
                    if (!in_array($interventionId, $request->interventions)) {
                        $intervention = Intervention::find($interventionId);
                        if ($intervention && $intervention->statut == 'PLANNED') {
                            $intervention->statut = 'PENDING';
                            $intervention->save();
                        }
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $planification->load($this->relations);
            
            return response()->json(['data' => $planification, 'message' => 'Planification updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating planification', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get planifications by user.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function byUser($userId): JsonResponse
    {
        $utilisateur = Utilisateur::find($userId);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }
        
        $planifications = Planification::where('utilisateur_id', $userId)
            ->with($this->relations)
            ->orderBy('dateCreation', 'desc')
            ->get();
            
        return response()->json(['data' => $planifications], 200);
    }
    
    /**
     * Add intervention to planification.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function addIntervention(Request $request, $id): JsonResponse
    {
        $planification = Planification::find($id);
        
        if (!$planification) {
            return response()->json(['message' => 'Planification not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'intervention_id' => 'required|exists:Intervention,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if intervention is already in this planification
        if ($planification->interventions()->where('Intervention.id', $request->intervention_id)->exists()) {
            return response()->json(['message' => 'Intervention is already in this planification'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Attach intervention
            $planification->interventions()->attach($request->intervention_id);
            
            // Update intervention status if needed
            $intervention = Intervention::find($request->intervention_id);
            if ($intervention && $intervention->statut == 'PENDING') {
                $intervention->statut = 'PLANNED';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $planification->load($this->relations);
            
            return response()->json(['data' => $planification, 'message' => 'Intervention added successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error adding intervention', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Remove intervention from planification.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function removeIntervention(Request $request, $id): JsonResponse
    {
        $planification = Planification::find($id);
        
        if (!$planification) {
            return response()->json(['message' => 'Planification not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'intervention_id' => 'required|exists:Intervention,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if intervention is in this planification
        if (!$planification->interventions()->where('Intervention.id', $request->intervention_id)->exists()) {
            return response()->json(['message' => 'Intervention is not in this planification'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Detach intervention
            $planification->interventions()->detach($request->intervention_id);
            
            // Update intervention status if needed
            $intervention = Intervention::find($request->intervention_id);
            if ($intervention && $intervention->statut == 'PLANNED') {
                $intervention->statut = 'PENDING';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $planification->load($this->relations);
            
            return response()->json(['data' => $planification, 'message' => 'Intervention removed successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error removing intervention', 'error' => $e->getMessage()], 500);
        }
    }
}