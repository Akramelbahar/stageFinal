<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth; // Make sure this is correctly imported
use App\Models\Utilisateur;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // No specific policies needed yet
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        
        // Let's comment out this custom token retrieval logic for now since it's causing issues
        // We'll use the default token driver without custom logic
        /*
        Auth::viaRequest('token', function ($request) {
            return Utilisateur::where('api_token', $request->bearerToken())->first();
        });
        */
    }
}