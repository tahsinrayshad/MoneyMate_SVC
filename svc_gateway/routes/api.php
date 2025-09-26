<?php

use App\Http\Controllers\IdentityController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\TransactionController;
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

/*
|--------------------------------------------------------------------------
| Identity Service Routes (Authentication)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // Public routes (no authentication required)
    Route::post('/signup', [IdentityController::class, 'signup']);
    Route::post('/login', [IdentityController::class, 'login']);
    
    // Protected routes (require authentication)
    Route::post('/logout', [IdentityController::class, 'logout']);
    Route::post('/refresh', [IdentityController::class, 'refresh']);
    Route::get('/me', [IdentityController::class, 'me']);
});

/*
|--------------------------------------------------------------------------
| Blog Service Routes
|--------------------------------------------------------------------------
*/
Route::prefix('blogs')->group(function () {
    // Public routes
    Route::get('/', [BlogController::class, 'index']);
    Route::get('/search', [BlogController::class, 'search']);
    Route::get('/user/{username}', [BlogController::class, 'getByUsername']);
    Route::get('/category/{category}', [BlogController::class, 'getByCategory']);
    Route::get('/{id}', [BlogController::class, 'show']);
    
    // Protected routes (require authentication)
    Route::post('/create', [BlogController::class, 'store']);
    Route::put('/{id}', [BlogController::class, 'update']);
    Route::delete('/{id}', [BlogController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Transaction Service Routes
|--------------------------------------------------------------------------
*/
Route::prefix('transactions')->group(function () {
    // All routes require authentication (based on transaction service setup)
    Route::get('/', [TransactionController::class, 'index']);
    Route::post('/', [TransactionController::class, 'store']);
    Route::get('/type/{type}', [TransactionController::class, 'getByType']);
    Route::get('/{id}', [TransactionController::class, 'show']);
    Route::put('/{id}', [TransactionController::class, 'update']);
    Route::patch('/{id}', [TransactionController::class, 'update']);
    Route::delete('/{id}', [TransactionController::class, 'destroy']);
});
