<?php

namespace App\Http\Controllers\Api;

use App\Models\Section;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class SectionController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Section::class;
        $this->validationRules = [
            'nom' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'responsable_id' => 'nullable|exists:Utilisateur,id',
        ];
        $this->relations = ['responsable', 'utilisateurs'];
        
        // Apply permission middleware
        $this->middleware('permission:section-list', ['only' => ['index']]);
        $this->middleware('permission:section-create', ['only' => ['store']]);
        $this->middleware('permission:section-edit', ['only' => ['update']]);
        $this->middleware('permission:section-view', ['only' => ['show']]);
        $this->middleware('permission:section-delete', ['only' => ['destroy']]);
    }
    
    /**
     * Store a newly created section.
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
            // Create section
            $section = Section::create($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $section->load($this->relations);
            
            return response()->json(['data' => $section, 'message' => 'Section created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating section', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update section.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $section = Section::find($id);
        
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }
        
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update section
            $section->update($request->all());
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $section->load($this->relations);
            
            return response()->json(['data' => $section, 'message' => 'Section updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating section', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get sections by responsable.
     *
     * @param int $responsableId
     * @return JsonResponse
     */
    public function byResponsable($responsableId): JsonResponse
    {
        $utilisateur = Utilisateur::find($responsableId);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur not found'], 404);
        }
        
        $sections = Section::where('responsable_id', $responsableId)
            ->with($this->relations)
            ->get();
            
        return response()->json(['data' => $sections], 200);
    }
    
    /**
     * Assign a responsable to a section.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function assignResponsable(Request $request, $id): JsonResponse
    {
        $section = Section::find($id);
        
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'responsable_id' => 'required|exists:Utilisateur,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            // Update responsable
            $section->responsable_id = $request->responsable_id;
            $section->save();
            
            // Load relations
            $section->load($this->relations);
            
            return response()->json(['data' => $section, 'message' => 'Responsable assigned successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error assigning responsable', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get users in a section.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function users($id): JsonResponse
    {
        $section = Section::find($id);
        
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }
        
        $users = $section->utilisateurs;
        
        return response()->json(['data' => $users], 200);
    }
}