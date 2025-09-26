<?php

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

// Debug route to test authentication
Route::middleware('auth:sanctum')->get('/debug', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
        'authenticated' => $request->user() ? true : false,
        'token' => $request->bearerToken()
    ]);
});


// Transaction routes - no authentication required
Route::group([
    'prefix' => 'transactions'
], function ($router) {
    Route::get('/', [TransactionController::class, 'index']);
    Route::post('/', [TransactionController::class, 'store']);
    Route::get('/type/{type}', [TransactionController::class, 'getByType']);
    Route::get('/{id}', [TransactionController::class, 'show']);
    Route::put('/{id}', [TransactionController::class, 'update']);
    Route::delete('/{id}', [TransactionController::class, 'destroy']);
});
