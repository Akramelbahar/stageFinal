<?php

namespace App\Http\Controllers\Api;

use App\Models\PrestataireExterne;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PrestataireExterneController extends BaseApiController
{
    public function __construct()
    {
        $this->model = PrestataireExterne::class;
        $this->validationRules = [
            'nom' => 'required|string|max:255',
            'contrat' => 'nullable|string',
            'rapportOperation' => 'nullable|string',
        ];
        $this->relations = ['utilisateurs', 'rapports'];
        
        // Apply permission middleware
        $this->middleware('permission:prestataire-list', ['only' => ['index']]);
        $this->middleware('permission:prestataire-create', ['only' => ['store']]);
        $this->middleware('permission:prestataire-edit', ['only' => ['update']]);
        $this->middleware('permission:prestataire-view', ['only' => ['show']]);
        $this->middleware('permission:prestataire-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created prestataire with associated users.
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
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create prestataire
            $prestataire = PrestataireExterne::create([
                'nom' => $request->nom,
                'contrat' => $request->contrat,
                'rapportOperation' => $request->rapportOperation,
            ]);
            
            // Attach users if provided
            if ($request->has('utilisateurs') && is_array($request->utilisateurs)) {
                $prestataire->utilisateurs()->sync($request->utilisateurs);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $prestataire->load($this->relations);
            
            return response()->json(['data' => $prestataire, 'message' => 'Prestataire created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating prestataire', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update prestataire with associated users.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $prestataire = PrestataireExterne::find($id);
        
        if (!$prestataire) {
            return response()->json(['message' => 'Prestataire not found'], 404);
        }
        
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'utilisateurs' => 'nullable|array',
            'utilisateurs.*' => 'exists:Utilisateur,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update prestataire
            $prestataire->update([
                'nom' => $request->nom,
                'contrat' => $request->contrat,
                'rapportOperation' => $request->rapportOperation,
            ]);
            
            // Update users if provided
            if ($request->has('utilisateurs')) {
                $prestataire->utilisateurs()->sync($request->utilisateurs);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $prestataire->load($this->relations);
            
            return response()->json(['data' => $prestataire, 'message' => 'Prestataire updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating prestataire', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get rapports by prestataire.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function rapports($id)
    {
        $prestataire = PrestataireExterne::find($id);
        
        if (!$prestataire) {
            return response()->json(['message' => 'Prestataire not found'], 404);
        }
        
        $rapports = $prestataire->rapports()
            ->with(['renovation', 'maintenance', 'gestionAdministrative'])
            ->get();
        
        return response()->json(['data' => $rapports], 200);
    }
    
    /**
     * Assign users to a prestataire.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignUsers(Request $request, $id)
    {
        $prestataire = PrestataireExterne::find($id);
        
        if (!$prestataire) {
            return response()->json(['message' => 'Prestataire not found'], 404);
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
            $prestataire->utilisateurs()->sync($request->utilisateurs);
            
            // Load relations
            $prestataire->load($this->relations);
            
            return response()->json(['data' => $prestataire, 'message' => 'Users assigned successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error assigning users', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get prestataires with recent activity.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function withRecentActivity()
    {
        $prestataires = PrestataireExterne::whereHas('rapports', function ($query) {
                $query->whereDate('dateCreation', '>=', now()->subMonths(3));
            })
            ->with(['rapports' => function ($query) {
                $query->whereDate('dateCreation', '>=', now()->subMonths(3));
            }])
            ->get();
        
        return response()->json(['data' => $prestataires], 200);
    }
}