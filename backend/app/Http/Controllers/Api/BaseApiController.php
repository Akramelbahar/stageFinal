<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BaseApiController extends Controller
{
    protected $model;
    protected $validationRules = [];
    protected $relations = [];

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $items = $this->model::with($this->relations)->get();
        return response()->json(['data' => $items], 200);
    }

    /**
     * Store a newly created resource in storage.
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

        // Create the data array with all request data
        $data = $request->all();
        
        // Generate a new ID if not provided
        if (!isset($data['id'])) {
            // Get the next available ID
            $maxId = $this->model::max('id') ?? 0;
            $data['id'] = $maxId + 1;
        }

        // Create with the ID
        $item = $this->model::create($data);
        
        // Load relations if they exist
        if (count($this->relations) > 0) {
            $item->load($this->relations);
        }
        
        return response()->json(['data' => $item, 'message' => 'Created successfully'], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        $item = $this->model::with($this->relations)->find($id);
        
        if (!$item) {
            return response()->json(['message' => 'Not found'], 404);
        }
        
        return response()->json(['data' => $item], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $item = $this->model::find($id);
        
        if (!$item) {
            return response()->json(['message' => 'Not found'], 404);
        }
        
        $validator = Validator::make($request->all(), $this->validationRules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $item->update($request->all());
        
        // Load relations if they exist
        if (count($this->relations) > 0) {
            $item->load($this->relations);
        }
        
        return response()->json(['data' => $item, 'message' => 'Updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $item = $this->model::find($id);
        
        if (!$item) {
            return response()->json(['message' => 'Not found'], 404);
        }
        
        $item->delete();
        
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}