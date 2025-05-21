<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MachineElectriqueController;
use App\Http\Controllers\Api\InterventionController;
use App\Http\Controllers\Api\DiagnosticController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\RenovationController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\ControleQualiteController;
use App\Http\Controllers\Api\PlanificationController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PrestataireExterneController;
use App\Http\Controllers\Api\GestionAdministrativeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::options('/{any}', function() {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
})->where('any', '.*');
Route::post('/login', [AuthController::class, 'login'])->name('login');
// Authentication routes (public)
Route::get('/test', function() {
    return ['message' => 'API is working'];
});
// Protected API routes
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/check-permissions', [AuthController::class, 'checkPermissions']);
    
    // Machine routes
    Route::get('machines/maintenance/soon', [MachineElectriqueController::class, 'maintenanceSoon'])->middleware('permission:machine-list');
    Route::put('machines/{id}/update-status', [MachineElectriqueController::class, 'updateStatus'])->middleware('permission:machine-edit');
    Route::apiResource('machines', MachineElectriqueController::class);
    
    // Intervention routes
    Route::get('interventions/urgent', [InterventionController::class, 'urgentInterventions'])->middleware('permission:intervention-list');
    Route::get('interventions/status/{status}', [InterventionController::class, 'byStatus'])->middleware('permission:intervention-list');
    Route::get('interventions/machine/{machineId}', [InterventionController::class, 'byMachine'])->middleware('permission:intervention-list');
    Route::apiResource('interventions', InterventionController::class);
    
    // Diagnostic routes
    Route::get('diagnostics/intervention/{interventionId}', [DiagnosticController::class, 'byIntervention'])->middleware('permission:diagnostic-view');
    Route::apiResource('diagnostics', DiagnosticController::class);
    
    // Maintenance routes
    Route::put('maintenances/{id}/complete', [MaintenanceController::class, 'complete'])->middleware('permission:maintenance-edit');
    Route::get('maintenances/statistics', [MaintenanceController::class, 'statistics'])->middleware('permission:maintenance-list');
    Route::apiResource('maintenances', MaintenanceController::class);
    
    // Renovation routes
    Route::get('renovations/intervention/{interventionId}', [RenovationController::class, 'byIntervention'])->middleware('permission:renovation-view');
    Route::apiResource('renovations', RenovationController::class);
    
    // Rapport routes
    Route::get('rapports/renovation/{renovationId}', [RapportController::class, 'byRenovation'])->middleware('permission:rapport-view');
    Route::get('rapports/maintenance/{maintenanceId}', [RapportController::class, 'byMaintenance'])->middleware('permission:rapport-view');
    Route::get('rapports/prestataire/{prestataireId}', [RapportController::class, 'byPrestataire'])->middleware('permission:rapport-view');
    Route::put('rapports/{id}/validate', [RapportController::class, 'validateRapport'])->middleware('permission:rapport-validate');
    Route::apiResource('rapports', RapportController::class);
    
    // Controle Qualite routes
    Route::get('controles/intervention/{interventionId}', [ControleQualiteController::class, 'byIntervention'])->middleware('permission:controle-view');
    Route::apiResource('controles', ControleQualiteController::class);
    
    // Planification routes
    Route::get('planifications/user/{userId}', [PlanificationController::class, 'byUser'])->middleware('permission:planification-view');
    Route::apiResource('planifications', PlanificationController::class);
    
    // Utilisateur routes
    Route::get('utilisateurs/section/{sectionId}', [UtilisateurController::class, 'bySection'])->middleware('permission:utilisateur-view');
    Route::get('utilisateurs/{id}/permissions', [UtilisateurController::class, 'permissions'])->middleware('permission:utilisateur-view');
    Route::post('utilisateurs/{id}/roles', [UtilisateurController::class, 'assignRoles'])->middleware('permission:utilisateur-manage-roles');
    Route::post('utilisateurs/create-admin', [UtilisateurController::class, 'createAdmin'])->middleware('permission:admin-roles');
    Route::apiResource('utilisateurs', UtilisateurController::class);
    
    // Section routes
    Route::get('sections/responsable/{responsableId}', [SectionController::class, 'byResponsable'])->middleware('permission:section-view');
    Route::apiResource('sections', SectionController::class);
    
    // Role routes
    Route::get('roles/{id}/users', [RoleController::class, 'users'])->middleware('permission:admin-roles');
    Route::post('roles/{id}/permissions', [RoleController::class, 'assignPermissions'])->middleware('permission:admin-roles');
    Route::post('roles/create-admin', [RoleController::class, 'createAdminRole'])->middleware('permission:admin-roles');
    Route::apiResource('roles', RoleController::class)->middleware('permission:admin-roles');
    
    // Permission routes
    Route::get('permissions/module/{module}', [PermissionController::class, 'byModule'])->middleware('permission:admin-permissions');
    Route::get('permissions/modules', [PermissionController::class, 'modules'])->middleware('permission:admin-permissions');
    Route::post('permissions/generate-crud', [PermissionController::class, 'generateCrudPermissions'])->middleware('permission:admin-permissions');
    Route::apiResource('permissions', PermissionController::class)->middleware('permission:admin-permissions');
    
    // Prestataire Externe routes
    Route::get('prestataires/{id}/rapports', [PrestataireExterneController::class, 'rapports'])->middleware('permission:prestataire-view');
    Route::post('prestataires/{id}/users', [PrestataireExterneController::class, 'assignUsers'])->middleware('permission:prestataire-edit');
    Route::apiResource('prestataires', PrestataireExterneController::class);
    
    // Gestion Administrative routes
    Route::get('gestions/rapport/{rapportId}', [GestionAdministrativeController::class, 'byRapport'])->middleware('permission:gestion-view');
    Route::put('gestions/{id}/validate', [GestionAdministrativeController::class, 'validateGestion'])->middleware('permission:gestion-validate');
    Route::post('gestions/{id}/users', [GestionAdministrativeController::class, 'assignUsers'])->middleware('permission:gestion-edit');
    Route::apiResource('gestions', GestionAdministrativeController::class);
    
    // Dashboard routes
    Route::get('dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('dashboard/urgent-interventions', [DashboardController::class, 'urgentInterventions']);
    Route::get('dashboard/upcoming-maintenance', [DashboardController::class, 'upcomingMaintenance']);
    Route::get('dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
});