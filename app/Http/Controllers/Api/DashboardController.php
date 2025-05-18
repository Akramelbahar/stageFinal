<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intervention;
use App\Models\MachineElectrique;
use App\Models\Maintenance;
use App\Models\Renovation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get system-wide statistics
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        // Count of machines by status
        $machinesByStatus = MachineElectrique::select('etat', DB::raw('count(*) as total'))
            ->groupBy('etat')
            ->get();
            
        // Interventions by status
        $interventionsByStatus = Intervention::select('statut', DB::raw('count(*) as total'))
            ->groupBy('statut')
            ->get();
            
        // Interventions by type
        $interventionsByType = Intervention::select('typeOperation', DB::raw('count(*) as total'))
            ->groupBy('typeOperation')
            ->get();
            
        // Urgent interventions count
        $urgentCount = Intervention::where('urgence', true)
            ->where('statut', '!=', 'COMPLETED')
            ->count();
            
        // Maintenance statistics
        $maintenanceStats = Maintenance::select('typeMaintenance', DB::raw('count(*) as total'))
            ->groupBy('typeMaintenance')
            ->get();
            
        // Renovation statistics
        $renovationCount = Renovation::count();
        $renovationCost = Renovation::sum('cout');
        
        // Machines requiring maintenance soon
        $maintenanceSoon = MachineElectrique::whereDate('dateProchaineMaint', '<=', now()->addMonth())
            ->whereDate('dateProchaineMaint', '>=', now())
            ->count();
            
        return response()->json([
            'machines' => [
                'byStatus' => $machinesByStatus,
                'maintenanceSoon' => $maintenanceSoon,
                'total' => MachineElectrique::count()
            ],
            'interventions' => [
                'byStatus' => $interventionsByStatus,
                'byType' => $interventionsByType,
                'urgent' => $urgentCount,
                'total' => Intervention::count()
            ],
            'maintenance' => [
                'byType' => $maintenanceStats,
                'total' => Maintenance::count()
            ],
            'renovation' => [
                'count' => $renovationCount,
                'totalCost' => $renovationCost
            ]
        ], 200);
    }
    
    /**
     * Get urgent interventions for dashboard
     *
     * @return JsonResponse
     */
    public function urgentInterventions(): JsonResponse
    {
        $interventions = Intervention::where('urgence', true)
            ->where('statut', '!=', 'COMPLETED')
            ->with(['machine', 'utilisateurs'])
            ->orderBy('date')
            ->limit(10)
            ->get();
            
        return response()->json(['data' => $interventions], 200);
    }
    
    /**
     * Get upcoming maintenance
     *
     * @return JsonResponse
     */
    public function upcomingMaintenance(): JsonResponse
    {
        $machines = MachineElectrique::whereDate('dateProchaineMaint', '<=', now()->addMonth())
            ->whereDate('dateProchaineMaint', '>=', now())
            ->orderBy('dateProchaineMaint')
            ->limit(10)
            ->get();
            
        return response()->json(['data' => $machines], 200);
    }
    
    /**
     * Get recent activities
     *
     * @return JsonResponse
     */
    public function recentActivities(): JsonResponse
    {
        // Recent interventions
        $interventions = Intervention::with(['machine', 'utilisateurs'])
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($intervention) {
                return [
                    'type' => 'intervention',
                    'date' => $intervention->date,
                    'id' => $intervention->id,
                    'machine' => $intervention->machine->nom,
                    'operation' => $intervention->typeOperation,
                    'status' => $intervention->statut,
                    'users' => $intervention->utilisateurs->pluck('nom')
                ];
            });
            
        // Recent maintenance
        $maintenances = Maintenance::with(['intervention.machine'])
            ->orderBy('intervention_id', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($maintenance) {
                return [
                    'type' => 'maintenance',
                    'date' => $maintenance->intervention->date,
                    'id' => $maintenance->intervention_id,
                    'machine' => $maintenance->intervention->machine->nom,
                    'maintenance_type' => $maintenance->typeMaintenance,
                    'status' => $maintenance->intervention->statut
                ];
            });
            
        // Combine and sort
        $activities = $interventions->concat($maintenances)
            ->sortByDesc('date')
            ->values()
            ->take(10);
            
        return response()->json(['data' => $activities], 200);
    }
}