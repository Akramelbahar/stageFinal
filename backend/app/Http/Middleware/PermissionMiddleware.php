<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Utilisateur;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        // Get the authenticated user
        $user = Auth::guard('api')->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized - User not authenticated'], 401);
        }
        
        // Load permissions if not already loaded
        if (!$user->relationLoaded('roles.permissions')) {
            $user->load('roles.permissions');
        }
        
        // Check if the user has the required permission through any of their roles
        $hasPermission = false;
        
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $perm) {
                $permissionString = $perm->module . '-' . $perm->action;
                if ($permissionString === $permission) {
                    $hasPermission = true;
                    break 2;
                }
            }
        }
        
        if (!$hasPermission) {
            return response()->json(['message' => 'Forbidden - Insufficient permissions'], 403);
        }
        
        return $next($request);
    }
}