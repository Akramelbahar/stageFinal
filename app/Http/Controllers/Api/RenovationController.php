<?php

namespace App\Http\Controllers\Api;

use App\Models\Renovation;
use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RenovationController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Renovation::class;
        $this->validationRules = [
            'intervention_id' => 'required|exists:Intervention,id',
            'disponibilitePDR' => 'required|boolean',
            'objectif' => 'required|string',
            'cout' => 'required|numeric',
            'dureeEstimee' => 'required|integer',
        ];
        $this->relations = ['intervention', 'intervention.machine', 'rapport'];
        
        // Apply permission middleware
        $this->middleware('permission:renovation-list', ['only' => ['index']]);
        $this->middleware('permission:renovation-create', ['only' => ['store']]);
        $this->middleware('permission:renovation-edit', ['only' => ['update']]);
        $this->middleware('permission:renovation-view', ['only' => ['show']]);
        $this->middleware('permission:renovation-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created renovation.
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
        
        // Check if renovation already exists for this intervention
        $existingRenovation = Renovation::find($request->intervention_id);
        if ($existingRenovation) {
            return response()->json([
                'message' => 'A renovation already exists for this intervention',
                'data' => $existingRenovation
            ], 422);
        }
        
        // Check if intervention exists and is of the correct type
        $intervention = Intervention::find($request->intervention_id);
        if (!$intervention) {
            return response()->json(['message' => 'Intervention not found'], 404);
        }
        
        if ($intervention->typeOperation != 'RENOVATION') {
            return response()->json(['message' => 'This intervention is not of type RENOVATION'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create renovation
            $renovation = Renovation::create($request->all());
            
            // Update intervention status if needed
            if ($intervention->statut == 'PENDING') {
                $intervention->statut = 'IN_PROGRESS';
                $intervention->save();
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $renovation->load($this->relations);
            
            return response()->json(['data' => $renovation, 'message' => 'Renovation created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating renovation', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update renovation.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $renovation = Renovation::find($id);
        
        if (!$renovation) {
            return response()->json(['message' => 'Renovation not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'disponibilitePDR' => 'required|boolean',
            'objectif' => 'required|string',
            'cout' => 'required|numeric',
            'dureeEstimee' => 'required|integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update renovation
            $renovation->update($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $renovation->load($this->relations);
            
            return response()->json(['data' => $renovation, 'message' => 'Renovation updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating renovation', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Complete renovation and update machine status.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function complete(Request $request, $id)
    {
        $renovation = Renovation::with('intervention.machine')->find($id);
        
        if (!$renovation) {
            return response()->json(['message' => 'Renovation not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'machine_etat' => 'required|string|max:100',
            'machine_valeur' => 'required|string|max:100',
            'machine_dateProchaineMaint' => 'required|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update the intervention status
            $intervention = $renovation->intervention;
            $intervention->statut = 'COMPLETED';
            $intervention->save();
            
            // Update the machine status
            $machine = $intervention->machine;
            $machine->etat = $request->machine_etat;
            $machine->valeur = $request->machine_valeur;
            $machine->dateProchaineMaint = $request->machine_dateProchaineMaint;
            $machine->save();
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $renovation->load($this->relations);
            
            return response()->json([
                'data' => $renovation, 
                'message' => 'Renovation completed successfully and machine status updated'
            ], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error completing renovation', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get renovation by intervention ID.
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
        
        $renovation = Renovation::with($this->relations)
            ->find($interventionId);
            
        if (!$renovation) {
            return response()->json(['message' => 'No renovation found for this intervention'], 404);
        }
            
        return response()->json(['data' => $renovation], 200);
    }
    
    /**
     * Get renovation statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $totalCount = Renovation::count();
        $totalCost = Renovation::sum('cout');
        $averageDuration = Renovation::avg('dureeEstimee');
        
        $byMonth = DB::table('Renovation')
            ->join('Intervention', 'Renovation.intervention_id', '=', 'Intervention.id')
            ->select(DB::raw('MONTH(Intervention.date) as month'), DB::raw('YEAR(Intervention.date) as year'), DB::raw('COUNT(*) as count'), DB::raw('SUM(cout) as total_cost'))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();
            
        return response()->json([
            'total' => $totalCount,
            'totalCost' => $totalCost,
            'averageDuration' => $averageDuration,
            'byMonth' => $byMonth
        ], 200);
    }
}