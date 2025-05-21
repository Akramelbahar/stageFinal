<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeAndDetailsToMachineElectriques extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('MachineElectrique', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('MachineElectrique', 'type')) {
                $table->string('type', 100)->nullable();
            }
            
            if (!Schema::hasColumn('MachineElectrique', 'details')) {
                $table->text('details')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('MachineElectrique', function (Blueprint $table) {
            $table->dropColumn(['type', 'details']);
        });
    }
}