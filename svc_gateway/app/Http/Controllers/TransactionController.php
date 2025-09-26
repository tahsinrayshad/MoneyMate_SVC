<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Exception;

class TransactionController extends Controller
{
    /**
     * Transaction service base URL
     */
    private string $transactionServiceUrl;

    /**
     * Create a new TransactionController instance.
     */
    public function __construct()
    {
        $this->transactionServiceUrl = env('SVC_TRX_URL', 'http://localhost:9002') . '/api';
    }

    /**
     * Get all transactions - proxy to transaction service
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->get($this->transactionServiceUrl . '/transactions', $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to fetch transactions'
            ], 503);
        }
    }

    /**
     * Create a new transaction - proxy to transaction service
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->post($this->transactionServiceUrl . '/transactions', $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to create transaction'
            ], 503);
        }
    }

    /**
     * Get specific transaction by ID - proxy to transaction service
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->get($this->transactionServiceUrl . '/transactions/' . $id);
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to fetch transaction'
            ], 503);
        }
    }

    /**
     * Update transaction by ID - proxy to transaction service
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->put($this->transactionServiceUrl . '/transactions/' . $id, $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to update transaction'
            ], 503);
        }
    }

    /**
     * Delete transaction by ID - proxy to transaction service
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->delete($this->transactionServiceUrl . '/transactions/' . $id);
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to delete transaction'
            ], 503);
        }
    }

    /**
     * Get transactions by type - proxy to transaction service
     */
    public function getByType(Request $request, string $type): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->get($this->transactionServiceUrl . '/transactions/type/' . $type, $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to fetch transactions by type'
            ], 503);
        }
    }

    /**
     * Extract Bearer token from request
     */
    private function extractToken(Request $request): ?string
    {
        $authorization = $request->header('Authorization');
        
        if ($authorization && str_starts_with($authorization, 'Bearer ')) {
            return substr($authorization, 7);
        }
        
        return null;
    }
}