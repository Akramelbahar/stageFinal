<?php

namespace App\Http\Controllers\Api;

use App\Models\GestionAdministrative;
use App\Models\Rapport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GestionAdministrativeController extends BaseApiController
{
    public function __construct()
    {
        $this->model = GestionAdministrative::class;
        $this->validationRules = [
            'commandeAchat' => 'nullable|string',
            'facturation' => 'nullable|string',
            'validation' => 'boolean',
            'rapport_id' => 'required|exists:Rapport,id',
        ];
        $this->relations = [
            'rapport', 
            'rapport.renovation', 
            'rapport.maintenance',
            'rapport.prestataire',
            'utilisateurs'
        ];
        
        // Apply permission middleware
        $this->middleware('permission:gestion-list', ['only' => ['index']]);
        $this->middleware('permission:gestion-create', ['only' => ['store']]);
        $this->middleware('permission:gestion-edit', ['only' => ['update']]);
        $this->middleware('permission:gestion-view', ['only' => ['show']]);
        $this->middleware('permission:gestion-delete', ['only' => ['destroy']]);
        $this->middleware('permission:gestion-validate', ['only' => ['validateGestion']]);
    }
    
    /**
     * Store a newly created gestion administrative.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'utilisateurs' => 'nullable|array',
            'utilisateurs.*' => 'exists:Utilisateur,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the rapport exists and is validated
        $rapport = Rapport::find($request->rapport_id);
        if (!$rapport) {
            return response()->json(['message' => 'Rapport not found'], 404);
        }
        
        if (!$rapport->validation) {
            return response()->json(['message' => 'Rapport must be validated before creating gestion administrative'], 422);
        }
        
        // Check if gestion already exists for this rapport
        $existingGestion = GestionAdministrative::where('rapport_id', $request->rapport_id)->first();
        if ($existingGestion) {
            return response()->json([
                'message' => 'A gestion administrative already exists for this rapport',
                'data' => $existingGestion
            ], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create gestion
            $gestion = GestionAdministrative::create([
                'commandeAchat' => $request->commandeAchat,
                'facturation' => $request->facturation,
                'validation' => $request->validation ?? false,
                'rapport_id' => $request->rapport_id,
            ]);
            
            // Attach users if provided
            if ($request->has('utilisateurs') && is_array($request->utilisateurs)) {
                $gestion->utilisateurs()->sync($request->utilisateurs);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $gestion->load($this->relations);
            
            return response()->json(['data' => $gestion, 'message' => 'Gestion administrative created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating gestion administrative', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update gestion administrative.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $gestion = GestionAdministrative::find($id);
        
        if (!$gestion) {
            return response()->json(['message' => 'Gestion administrative not found'], 404);
        }
        
        // If gestion is already validated, don't allow updates
        if ($gestion->validation) {
            return response()->json(['message' => 'Cannot update a validated gestion administrative'], 422);
        }
        
        $validator = Validator::make($request->all(), array_merge([
            'commandeAchat' => 'nullable|string',
            'facturation' => 'nullable|string',
            'validation' => 'boolean',
        ], [
            'utilisateurs' => 'nullable|array',
            'utilisateurs.*' => 'exists:Utilisateur,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update gestion
            $gestion->update([
                'commandeAchat' => $request->commandeAchat,
                'facturation' => $request->facturation,
                'validation' => $request->validation ?? $gestion->validation,
            ]);
            
            // Update users if provided
            if ($request->has('utilisateurs')) {
                $gestion->utilisateurs()->sync($request->utilisateurs);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $gestion->load($this->relations);
            
            return response()->json(['data' => $gestion, 'message' => 'Gestion administrative updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating gestion administrative', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Validate a gestion administrative.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateGestion(Request $request, $id)
    {
        $gestion = GestionAdministrative::find($id);
        
        if (!$gestion) {
            return response()->json(['message' => 'Gestion administrative not found'], 404);
        }
        
        // Already validated
        if ($gestion->validation) {
            return response()->json(['message' => 'Gestion administrative is already validated'], 422);
        }
        
        // Check if required fields are filled
        if (empty($gestion->commandeAchat) || empty($gestion->facturation)) {
            return response()->json(['message' => 'Cannot validate: commandeAchat and facturation must be filled'], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Validate the gestion
            $gestion->validation = true;
            $gestion->save();
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $gestion->load($this->relations);
            
            return response()->json(['data' => $gestion, 'message' => 'Gestion administrative validated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error validating gestion administrative', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get gestion administrative by rapport ID.
     *
     * @param int $rapportId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byRapport($rapportId)
    {
        $rapport = Rapport::find($rapportId);
        
        if (!$rapport) {
            return response()->json(['message' => 'Rapport not found'], 404);
        }
        
        $gestion = GestionAdministrative::where('rapport_id', $rapportId)
            ->with($this->relations)
            ->first();
            
        if (!$gestion) {
            return response()->json(['message' => 'No gestion administrative found for this rapport'], 404);
        }
            
        return response()->json(['data' => $gestion], 200);
    }
    
    /**
     * Assign users to a gestion administrative.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignUsers(Request $request, $id)
    {
        $gestion = GestionAdministrative::find($id);
        
        if (!$gestion) {
            return response()->json(['message' => 'Gestion administrative not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'utilisateurs' => 'required|array',
            'utilisateurs.*' => 'exists:Utilisateur,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            // Assign users
            $gestion->utilisateurs()->sync($request->utilisateurs);
            
            // Load relations
            $gestion->load($this->relations);
            
            return response()->json(['data' => $gestion, 'message' => 'Users assigned successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error assigning users', 'error' => $e->getMessage()], 500);
        }
    }
}