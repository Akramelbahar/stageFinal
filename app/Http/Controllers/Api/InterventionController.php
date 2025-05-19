<?php

namespace App\Http\Controllers\Api;

use App\Models\Intervention;
use App\Models\MachineElectrique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class InterventionController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Intervention::class;
        $this->validationRules = [
            'date' => 'required|date',
            'description' => 'required|string',
            'typeOperation' => 'required|string|max:100',
            'statut' => 'required|string|max:50',
            'urgence' => 'boolean',
            'machine_id' => 'required|exists:MachineElectrique,id',
        ];
        $this->relations = [
            'machine', 
            'utilisateurs', 
            'diagnostic', 
            'controleQualite', 
            'renovation', 
            'maintenance'
        ];
        
        // Apply permission middleware
        $this->middleware('permission:intervention-list', ['only' => ['index']]);
        $this->middleware('permission:intervention-create', ['only' => ['store']]);
        $this->middleware('permission:intervention-edit', ['only' => ['update']]);
        $this->middleware('permission:intervention-view', ['only' => ['show']]);
        $this->middleware('permission:intervention-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created intervention with associated users.
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
    
    // Begin transaction
    DB::beginTransaction();
    
    try {
        // Use the parent class store method which handles ID generation
        $response = parent::store($request);
        $intervention = json_decode($response->getContent())->data;
        
        // Attach users if provided
        if ($request->has('utilisateurs') && is_array($request->utilisateurs)) {
            $model = $this->model::find($intervention->id);
            $model->utilisateurs()->sync($request->utilisateurs);
            
            // Update the intervention object with relations
            $intervention = $model->load($this->relations);
        }
        
        // Commit the transaction
        DB::commit();
        
        return response()->json(['data' => $intervention, 'message' => 'Intervention created successfully'], 201);
    } catch (\Exception $e) {
        // Rollback in case of error
        DB::rollback();
        return response()->json(['message' => 'Error creating intervention', 'error' => $e->getMessage()], 500);
    }
}
    
    /**
     * Update intervention with associated users.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $intervention = Intervention::find($id);
        
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update intervention
            $intervention->update($request->all());
            
            // Update users if provided
            if ($request->has('utilisateurs') && is_array($request->utilisateurs)) {
                $intervention->utilisateurs()->sync($request->utilisateurs);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $intervention->load($this->relations);
            
            return response()->json(['data' => $intervention, 'message' => 'Intervention updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating intervention', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get urgent interventions.
     *
     * @return JsonResponse
     */
    public function urgentInterventions(): JsonResponse
    {
        $interventions = Intervention::where('urgence', true)
            ->where('statut', '!=', 'COMPLETED')
            ->with($this->relations)
            ->orderBy('date')
            ->get();
            
        return response()->json(['data' => $interventions], 200);
    }
    
    /**
     * Get interventions by status.
     *
     * @param string $status
     * @return JsonResponse
     */
    public function byStatus($status): JsonResponse
    {
        $interventions = Intervention::where('statut', $status)
            ->with($this->relations)
            ->orderBy('date')
            ->get();
            
        return response()->json(['data' => $interventions], 200);
    }
    
    /**
     * Get interventions by machine.
     *
     * @param int $machineId
     * @return JsonResponse
     */
    public function byMachine($machineId): JsonResponse
    {
        $machine = MachineElectrique::find($machineId);
        
        if (!$machine) {
            return response()->json(['message' => 'Machine not found'], 404);
        }
        
        $interventions = Intervention::where('machine_id', $machineId)
            ->with($this->relations)
            ->orderBy('date', 'desc')
            ->get();
            
        return response()->json(['data' => $interventions], 200);
    }
}