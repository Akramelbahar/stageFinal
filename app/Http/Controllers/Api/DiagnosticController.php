<?php

namespace App\Http\Controllers\Api;

use App\Models\Diagnostic;
use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class DiagnosticController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Diagnostic::class;
        $this->validationRules = [
            'dateCreation' => 'required|date',
            'intervention_id' => 'required|exists:Intervention,id',
            'travaux' => 'nullable|array',
            'travaux.*' => 'string',
            'besoins' => 'nullable|array',
            'besoins.*' => 'string',
            'charges' => 'nullable|array',
            'charges.*' => 'string',
        ];
        $this->relations = ['intervention', 'travauxRequis', 'besoinsPDR', 'chargesRealisees'];
        
        // Apply permission middleware
        $this->middleware('permission:diagnostic-list', ['only' => ['index']]);
        $this->middleware('permission:diagnostic-create', ['only' => ['store']]);
        $this->middleware('permission:diagnostic-edit', ['only' => ['update']]);
        $this->middleware('permission:diagnostic-view', ['only' => ['show']]);
        $this->middleware('permission:diagnostic-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created diagnostic with related lists.
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
        
        // Check if diagnostic already exists for this intervention
        $existingDiagnostic = Diagnostic::where('intervention_id', $request->intervention_id)->first();
        if ($existingDiagnostic) {
            return response()->json([
                'message' => 'A diagnostic already exists for this intervention',
                'data' => $existingDiagnostic
            ], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create diagnostic
            $diagnostic = Diagnostic::create([
                'dateCreation' => $request->dateCreation,
                'intervention_id' => $request->intervention_id
            ]);
            
            // Add travaux requis if provided
            if ($request->has('travaux') && is_array($request->travaux)) {
                foreach ($request->travaux as $travail) {
                    $diagnostic->travauxRequis()->create(['travail' => $travail]);
                }
            }
            
            // Add besoins PDR if provided
            if ($request->has('besoins') && is_array($request->besoins)) {
                foreach ($request->besoins as $besoin) {
                    $diagnostic->besoinsPDR()->create(['besoin' => $besoin]);
                }
            }
            
            // Add charges realisees if provided
            if ($request->has('charges') && is_array($request->charges)) {
                foreach ($request->charges as $charge) {
                    $diagnostic->chargesRealisees()->create(['charge' => $charge]);
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $diagnostic->load($this->relations);
            
            return response()->json(['data' => $diagnostic, 'message' => 'Diagnostic created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating diagnostic', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update diagnostic with related lists.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $diagnostic = Diagnostic::find($id);
        
        if (!$diagnostic) {
            return response()->json(['message' => 'Diagnostic not found'], 404);
        }
        
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update diagnostic basic info
            $diagnostic->update([
                'dateCreation' => $request->dateCreation,
                'intervention_id' => $request->intervention_id
            ]);
            
            // Update travaux requis if provided
            if ($request->has('travaux')) {
                // Delete existing
                $diagnostic->travauxRequis()->delete();
                
                // Add new ones
                if (is_array($request->travaux)) {
                    foreach ($request->travaux as $travail) {
                        $diagnostic->travauxRequis()->create(['travail' => $travail]);
                    }
                }
            }
            
            // Update besoins PDR if provided
            if ($request->has('besoins')) {
                // Delete existing
                $diagnostic->besoinsPDR()->delete();
                
                // Add new ones
                if (is_array($request->besoins)) {
                    foreach ($request->besoins as $besoin) {
                        $diagnostic->besoinsPDR()->create(['besoin' => $besoin]);
                    }
                }
            }
            
            // Update charges realisees if provided
            if ($request->has('charges')) {
                // Delete existing
                $diagnostic->chargesRealisees()->delete();
                
                // Add new ones
                if (is_array($request->charges)) {
                    foreach ($request->charges as $charge) {
                        $diagnostic->chargesRealisees()->create(['charge' => $charge]);
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $diagnostic->load($this->relations);
            
            return response()->json(['data' => $diagnostic, 'message' => 'Diagnostic updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating diagnostic', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get diagnostic by intervention ID.
     *
     * @param int $interventionId
     * @return JsonResponse
     */
    public function byIntervention($interventionId): JsonResponse
    {
        $intervention = Intervention::find($interventionId);
        
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        $diagnostic = Diagnostic::where('intervention_id', $interventionId)
            ->with($this->relations)
            ->first();
            
        if (!$diagnostic) {
            return response()->json(['message' => 'No diagnostic found for this intervention'], 404);
        }
            
        return response()->json(['data' => $diagnostic], 200);
    }
}