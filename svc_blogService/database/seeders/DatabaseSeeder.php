<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users for blog testing
        \App\Models\User::factory()->create([
            'name' => 'john_doe',
            'email' => 'john@example.com',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'jane_smith',
            'email' => 'jane@example.com',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'alex_wilson',
            'email' => 'alex@example.com',
        ]);
    }
}
