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
            'description' => 'required|string',
            'resultatAnalyse' => 'required|string',
            'travauxRequis' => 'nullable|string',
            'besoinsPDR' => 'nullable|string',
            'chargesRealisees' => 'nullable|string',
            'observations' => 'nullable|string',
        ];
        // Update relations to include machine through intervention
        $this->relations = ['intervention', 'intervention.machine', 'travauxRequis', 'besoinsPDR', 'chargesRealisees'];
        
        // Apply permission middleware
        $this->middleware('permission:diagnostic-list', ['only' => ['index']]);
        $this->middleware('permission:diagnostic-create', ['only' => ['store']]);
        $this->middleware('permission:diagnostic-edit', ['only' => ['update']]);
        $this->middleware('permission:diagnostic-view', ['only' => ['show']]);
        $this->middleware('permission:diagnostic-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $items = Diagnostic::with($this->relations)->get();
        return response()->json(['data' => $items]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        $item = Diagnostic::with($this->relations)->find($id);
        
        if (!$item) {
            return response()->json(['message' => 'Diagnostic not found'], 404);
        }
        
        return response()->json(['data' => $item]);
    }
    
    /**
     * Store a newly created diagnostic.
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
                'intervention_id' => $request->intervention_id,
                'description' => $request->description,
                'resultatAnalyse' => $request->resultatAnalyse,
                'observations' => $request->observations,
            ]);
            
            // Add travaux requis if provided
            if ($request->filled('travauxRequis')) {
                $diagnostic->travauxRequis()->create(['travail' => $request->travauxRequis]);
            }
            
            // Add besoins PDR if provided
            if ($request->filled('besoinsPDR')) {
                $diagnostic->besoinsPDR()->create(['besoin' => $request->besoinsPDR]);
            }
            
            // Add charges realisees if provided
            if ($request->filled('chargesRealisees')) {
                $diagnostic->chargesRealisees()->create(['charge' => $request->chargesRealisees]);
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
     * Update diagnostic.
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
                'intervention_id' => $request->intervention_id,
                'description' => $request->description,
                'resultatAnalyse' => $request->resultatAnalyse,
                'observations' => $request->observations,
            ]);
            
            // Update travaux requis if provided
            if ($request->has('travauxRequis')) {
                // Delete existing
                $diagnostic->travauxRequis()->delete();
                
                // Add new one if not empty
                if ($request->filled('travauxRequis')) {
                    $diagnostic->travauxRequis()->create(['travail' => $request->travauxRequis]);
                }
            }
            
            // Update besoins PDR if provided
            if ($request->has('besoinsPDR')) {
                // Delete existing
                $diagnostic->besoinsPDR()->delete();
                
                // Add new one if not empty
                if ($request->filled('besoinsPDR')) {
                    $diagnostic->besoinsPDR()->create(['besoin' => $request->besoinsPDR]);
                }
            }
            
            // Update charges realisees if provided
            if ($request->has('chargesRealisees')) {
                // Delete existing
                $diagnostic->chargesRealisees()->delete();
                
                // Add new one if not empty
                if ($request->filled('chargesRealisees')) {
                    $diagnostic->chargesRealisees()->create(['charge' => $request->chargesRealisees]);
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

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $diagnostic = Diagnostic::find($id);
        
        if (!$diagnostic) {
            return response()->json(['message' => 'Diagnostic not found'], 404);
        }
        
        DB::beginTransaction();
        
        try {
            // Delete related records first
            $diagnostic->travauxRequis()->delete();
            $diagnostic->besoinsPDR()->delete();
            $diagnostic->chargesRealisees()->delete();
            
            // Then delete the diagnostic
            $diagnostic->delete();
            
            DB::commit();
            
            return response()->json(['message' => 'Diagnostic deleted successfully'], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error deleting diagnostic', 'error' => $e->getMessage()], 500);
        }
    }
}