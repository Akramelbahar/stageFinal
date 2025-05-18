<?php

namespace App\Http\Controllers\Api;

use App\Models\MachineElectrique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class MachineElectriqueController extends BaseApiController
{
    public function __construct()
    {
        $this->model = MachineElectrique::class;
        $this->validationRules = [
            'nom' => 'required|string|max:255',
            'etat' => 'required|string|max:100',
            'valeur' => 'required|string|max:100',
            'dateProchaineMaint' => 'nullable|date',
        ];
        $this->relations = ['interventions'];
        
        // Apply permission middleware
        $this->middleware('permission:machine-list', ['only' => ['index']]);
        $this->middleware('permission:machine-create', ['only' => ['store']]);
        $this->middleware('permission:machine-edit', ['only' => ['update']]);
        $this->middleware('permission:machine-view', ['only' => ['show']]);
        $this->middleware('permission:machine-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Get machines requiring maintenance soon.
     *
     * @return JsonResponse
     */
    public function maintenanceSoon(): JsonResponse
    {
        // Get machines with maintenance due in the next month
        $machines = MachineElectrique::whereDate('dateProchaineMaint', '<=', now()->addMonth())
            ->whereDate('dateProchaineMaint', '>=', now())
            ->with('interventions')
            ->get();
            
        return response()->json(['data' => $machines], 200);
    }
    
    /**
     * Update machine status after maintenance.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $machine = MachineElectrique::find($id);
        
        if (!$machine) {
            return response()->json(['message' => 'Machine not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'etat' => 'required|string|max:100',
            'dateProchaineMaint' => 'required|date'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $machine->etat = $request->etat;
        $machine->dateProchaineMaint = $request->dateProchaineMaint;
        $machine->save();
        
        return response()->json(['data' => $machine, 'message' => 'Machine status updated successfully'], 200);
    }
}