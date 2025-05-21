<?php

namespace App\Http\Controllers\Api;

use App\Models\Maintenance;
use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class MaintenanceController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Maintenance::class;
        $this->validationRules = [
            'intervention_id' => 'required|exists:Intervention,id',
            'typeMaintenance' => 'required|string|max:100',
            'duree' => 'required|integer',
            'pieces' => 'nullable|array',
            'pieces.*' => 'string',
        ];
        $this->relations = ['intervention', 'pieces', 'rapport', 'rapport.gestionAdministrative'];
        
        // Apply permission middleware
        $this->middleware('permission:maintenance-list', ['only' => ['index']]);
        $this->middleware('permission:maintenance-create', ['only' => ['store']]);
        $this->middleware('permission:maintenance-edit', ['only' => ['update']]);
        $this->middleware('permission:maintenance-view', ['only' => ['show']]);
        $this->middleware('permission:maintenance-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created maintenance with pieces.
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
        
        // Check if maintenance already exists for this intervention
        $existingMaintenance = Maintenance::find($request->intervention_id);
        if ($existingMaintenance) {
            return response()->json([
                'message' => 'A maintenance already exists for this intervention',
                'data' => $existingMaintenance
            ], 422);
        }
        
        // Check if intervention exists and is of the correct type
        $intervention = Intervention::find($request->intervention_id);
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        if ($intervention->typeOperation != 'MAINTENANCE') {
            return response()->json(['message' => 'This intervention is not of type MAINTENANCE'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create maintenance
            $maintenance = Maintenance::create([
                'intervention_id' => $request->intervention_id,
                'typeMaintenance' => $request->typeMaintenance,
                'duree' => $request->duree
            ]);
            
            // Add pieces if provided
            if ($request->has('pieces') && is_array($request->pieces)) {
                foreach ($request->pieces as $piece) {
                    $maintenance->pieces()->create(['piece' => $piece]);
                }
            }
            
            // Update intervention status if needed
            if ($intervention->statut == 'PENDING') {
                $intervention->statut = 'IN_PROGRESS';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $maintenance->load($this->relations);
            
            return response()->json(['data' => $maintenance, 'message' => 'Maintenance created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating maintenance', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update maintenance with pieces.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $maintenance = Maintenance::find($id);
        
        if (!$maintenance) {
            return response()->json(['message' => 'Maintenance not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'typeMaintenance' => 'required|string|max:100',
            'duree' => 'required|integer',
            'pieces' => 'nullable|array',
            'pieces.*' => 'string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update maintenance basic info
            $maintenance->update([
                'typeMaintenance' => $request->typeMaintenance,
                'duree' => $request->duree
            ]);
            
            // Update pieces if provided
            if ($request->has('pieces')) {
                // Delete existing
                $maintenance->pieces()->delete();
                
                // Add new ones
                if (is_array($request->pieces)) {
                    foreach ($request->pieces as $piece) {
                        $maintenance->pieces()->create(['piece' => $piece]);
                    }
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $maintenance->load($this->relations);
            
            return response()->json(['data' => $maintenance, 'message' => 'Maintenance updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating maintenance', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Complete maintenance and update machine status.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function complete(Request $request, $id): JsonResponse
    {
        $maintenance = Maintenance::with('intervention.machine')->find($id);
        
        if (!$maintenance) {
            return response()->json(['message' => 'Maintenance not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'machine_etat' => 'required|string|max:100',
            'machine_dateProchaineMaint' => 'required|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update the intervention status
            $intervention = $maintenance->intervention;
            $intervention->statut = 'COMPLETED';
            $intervention->save();
            
            // Update the machine status
            $machine = $intervention->machine;
            $machine->etat = $request->machine_etat;
            $machine->dateProchaineMaint = $request->machine_dateProchaineMaint;
            $machine->save();
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $maintenance->load($this->relations);
            
            return response()->json([
                'data' => $maintenance, 
                'message' => 'Maintenance completed successfully and machine status updated'
            ], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error completing maintenance', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get maintenance statistics.
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        $totalCount = Maintenance::count();
        
        $byType = Maintenance::select('typeMaintenance', DB::raw('count(*) as count'))
            ->groupBy('typeMaintenance')
            ->get();
            
        $recentMaintenance = Maintenance::with(['intervention.machine'])
            ->orderBy('intervention_id', 'desc')
            ->limit(5)
            ->get();
            
        return response()->json([
            'total' => $totalCount,
            'byType' => $byType,
            'recent' => $recentMaintenance
        ], 200);
    }
}