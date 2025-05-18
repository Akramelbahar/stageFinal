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

// Authentication routes (customize based on your auth setup)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');

// Protected API routes
Route::middleware('auth:api')->group(function () {
    // Machine routes
    Route::apiResource('machines', MachineElectriqueController::class);
    Route::get('machines/maintenance/soon', [MachineElectriqueController::class, 'maintenanceSoon']);
    Route::put('machines/{id}/update-status', [MachineElectriqueController::class, 'updateStatus']);
    
    // Intervention routes
    Route::apiResource('interventions', InterventionController::class);
    Route::get('interventions/urgent', [InterventionController::class, 'urgentInterventions']);
    Route::get('interventions/status/{status}', [InterventionController::class, 'byStatus']);
    Route::get('interventions/machine/{machineId}', [InterventionController::class, 'byMachine']);
    
    // Diagnostic routes
    Route::apiResource('diagnostics', DiagnosticController::class);
    Route::get('diagnostics/intervention/{interventionId}', [DiagnosticController::class, 'byIntervention']);
    
    // Maintenance routes
    Route::apiResource('maintenances', MaintenanceController::class);
    Route::put('maintenances/{id}/complete', [MaintenanceController::class, 'complete']);
    Route::get('maintenances/statistics', [MaintenanceController::class, 'statistics']);
    
    // Renovation routes
    Route::apiResource('renovations', RenovationController::class);
    Route::get('renovations/intervention/{interventionId}', [RenovationController::class, 'byIntervention']);
    
    // Rapport routes
    Route::apiResource('rapports', RapportController::class);
    Route::get('rapports/renovation/{renovationId}', [RapportController::class, 'byRenovation']);
    Route::get('rapports/maintenance/{maintenanceId}', [RapportController::class, 'byMaintenance']);
    Route::get('rapports/prestataire/{prestataireId}', [RapportController::class, 'byPrestataire']);
    Route::put('rapports/{id}/validate', [RapportController::class, 'validateRapport']);
    
    // Controle Qualite routes
    Route::apiResource('controles', ControleQualiteController::class);
    Route::get('controles/intervention/{interventionId}', [ControleQualiteController::class, 'byIntervention']);
    
    // Planification routes
    Route::apiResource('planifications', PlanificationController::class);
    Route::get('planifications/user/{userId}', [PlanificationController::class, 'byUser']);
    
    // Utilisateur routes
    Route::apiResource('utilisateurs', UtilisateurController::class);
    Route::get('utilisateurs/section/{sectionId}', [UtilisateurController::class, 'bySection']);
    Route::get('utilisateurs/{id}/permissions', [UtilisateurController::class, 'permissions']);
    Route::post('utilisateurs/{id}/roles', [UtilisateurController::class, 'assignRoles']);
    Route::post('utilisateurs/create-admin', [UtilisateurController::class, 'createAdmin']);
    
    // Section routes
    Route::apiResource('sections', SectionController::class);
    Route::get('sections/responsable/{responsableId}', [SectionController::class, 'byResponsable']);
    
    // Role routes
    Route::apiResource('roles', RoleController::class);
    Route::get('roles/{id}/users', [RoleController::class, 'users']);
    Route::post('roles/{id}/permissions', [RoleController::class, 'assignPermissions']);
    Route::post('roles/create-admin', [RoleController::class, 'createAdminRole']);
    
    // Permission routes
    Route::apiResource('permissions', PermissionController::class);
    Route::get('permissions/module/{module}', [PermissionController::class, 'byModule']);
    Route::get('permissions/modules', [PermissionController::class, 'modules']);
    Route::post('permissions/generate-crud', [PermissionController::class, 'generateCrudPermissions']);
    
    // Prestataire Externe routes
    Route::apiResource('prestataires', PrestataireExterneController::class);
    Route::get('prestataires/{id}/rapports', [PrestataireExterneController::class, 'rapports']);
    Route::post('prestataires/{id}/users', [PrestataireExterneController::class, 'assignUsers']);
    
    // Gestion Administrative routes
    Route::apiResource('gestions', GestionAdministrativeController::class);
    Route::get('gestions/rapport/{rapportId}', [GestionAdministrativeController::class, 'byRapport']);
    Route::put('gestions/{id}/validate', [GestionAdministrativeController::class, 'validateGestion']);
    Route::post('gestions/{id}/users', [GestionAdministrativeController::class, 'assignUsers']);
    
    // Dashboard routes
    Route::get('dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('dashboard/urgent-interventions', [DashboardController::class, 'urgentInterventions']);
    Route::get('dashboard/upcoming-maintenance', [DashboardController::class, 'upcomingMaintenance']);
    Route::get('dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
});