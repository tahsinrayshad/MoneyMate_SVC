<?php

use App\Http\Controllers\BlogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Debug route for testing updates
Route::get('/debug-update/{id}', function ($id) {
    try {
        $blog = App\Models\Blog::find($id);
        if (!$blog) {
            return response()->json(['error' => 'Blog not found'], 404);
        }
        
        $before = $blog->toArray();
        
        $blog->title = 'Debug Test Update ' . time();
        $result = $blog->save();
        
        $blog->refresh();
        $after = $blog->toArray();
        
        return response()->json([
            'success' => true,
            'before' => $before,
            'after' => $after,
            'save_result' => $result,
            'message' => 'Debug update completed'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Debug failed: ' . $e->getMessage()
        ], 500);
    }
});

// Simple test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Blog Routes
Route::prefix('blogs')->group(function () {
    // Get all blogs
    Route::get('/', [BlogController::class, 'index']);
    
    // Create a new blog
    Route::post('/', [BlogController::class, 'store']);
    
    // Search blogs
    Route::get('/search', [BlogController::class, 'search']);
    
    // Get blogs by username
    Route::get('/user/{username}', [BlogController::class, 'getByUsername']);
    
    // Get blogs by category
    Route::get('/category/{category}', [BlogController::class, 'getByCategory']);
    
    // Get specific blog by ID
    Route::get('/{id}', [BlogController::class, 'show']);
    
    // Update blog by ID
    Route::put('/{id}', [BlogController::class, 'update']);
    
    // Delete blog by ID
    Route::delete('/{id}', [BlogController::class, 'destroy']);
});
