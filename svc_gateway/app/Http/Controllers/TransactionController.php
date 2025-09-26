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
     * Get all transactions - proxy to transaction service (user-specific)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to view transactions'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Add username filter to query parameters
            $queryParams = $request->query();
            $queryParams['username'] = $user['username'] ?? $user['email'];

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get($this->transactionServiceUrl . '/transactions', $queryParams);
            
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
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to create a transaction'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Add both user_id and username from authenticated user to request data
            $transactionData = $request->all();
            $transactionData['user_id'] = $user['id']; // Store the actual user ID
            $transactionData['username'] = $user['username'] ?? $user['email'];

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->post($this->transactionServiceUrl . '/transactions', $transactionData);
            
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
     * Get specific transaction by ID - proxy to transaction service (with ownership check)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to view transactions'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get($this->transactionServiceUrl . '/transactions/' . $id);
            
            if (!$response->successful()) {
                return response()->json(
                    $response->json(),
                    $response->status()
                );
            }

            // Check ownership of the transaction
            $transactionData = $response->json();
            $transaction = $transactionData['data'] ?? $transactionData;
            $currentUsername = $user['username'] ?? $user['email'];

            if (isset($transaction['username']) && $transaction['username'] !== $currentUsername) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'You can only view your own transactions'
                ], 403);
            }
            
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
     * Update transaction by ID - proxy to transaction service (with ownership check)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to update transactions'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Get the existing transaction to check ownership
            $transactionResponse = Http::withToken($token)
                ->get($this->transactionServiceUrl . '/transactions/' . $id);
            
            if (!$transactionResponse->successful()) {
                return response()->json([
                    'error' => 'Transaction not found',
                    'message' => 'The transaction does not exist'
                ], 404);
            }

            $transactionData = $transactionResponse->json();
            $existingTransaction = $transactionData['data'] ?? $transactionData;
            $currentUsername = $user['username'] ?? $user['email'];

            // Check if the current user owns this transaction
            if (isset($existingTransaction['username']) && $existingTransaction['username'] !== $currentUsername) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'You can only update your own transactions'
                ], 403);
            }

            // Add both user_id and username to update data to maintain ownership
            $updateData = $request->all();
            $updateData['user_id'] = $user['id']; // Store the actual user ID
            $updateData['username'] = $currentUsername;

            $response = Http::withToken($token)
                ->put($this->transactionServiceUrl . '/transactions/' . $id, $updateData);
            
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
     * Delete transaction by ID - proxy to transaction service (with ownership check)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to delete transactions'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Get the existing transaction to check ownership
            $transactionResponse = Http::withToken($token)
                ->get($this->transactionServiceUrl . '/transactions/' . $id);
            
            if (!$transactionResponse->successful()) {
                return response()->json([
                    'error' => 'Transaction not found',
                    'message' => 'The transaction does not exist'
                ], 404);
            }

            $transactionData = $transactionResponse->json();
            $existingTransaction = $transactionData['data'] ?? $transactionData;
            $currentUsername = $user['username'] ?? $user['email'];

            // Check if the current user owns this transaction
            if (isset($existingTransaction['username']) && $existingTransaction['username'] !== $currentUsername) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'You can only delete your own transactions'
                ], 403);
            }

            $response = Http::withToken($token)
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
     * Get transactions by type - proxy to transaction service (user-specific)
     */
    public function getByType(Request $request, string $type): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to view transactions'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Add username filter to query parameters
            $queryParams = $request->query();
            $queryParams['username'] = $user['username'] ?? $user['email'];

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get($this->transactionServiceUrl . '/transactions/type/' . $type, $queryParams);
            
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

    /**
     * Get authenticated user information from identity service
     */
    private function getAuthenticatedUser(string $token): ?array
    {
        try {
            $userResponse = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get(env('SVC_ID_URL', 'http://localhost:9001') . '/api/auth/me');

            if ($userResponse->successful()) {
                $data = $userResponse->json();
                // Extract user data from the response structure
                return $data['user'] ?? $data; // Handle both new and old response formats
            }
        } catch (Exception $e) {
            // Log error if needed
        }
        
        return null;
    }

    /**
     * Get financial summary - proxy to transaction service (user-specific)
     */
    public function getFinancialSummary(Request $request): JsonResponse
    {
        try {
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to view financial summary'
                ], 401);
            }

            // Get authenticated user information
            $user = $this->getAuthenticatedUser($token);
            if (!$user) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => 'Unable to verify authentication'
                ], 401);
            }

            // Add username filter to query parameters
            $queryParams = ['username' => $user['username'] ?? $user['email']];

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get($this->transactionServiceUrl . '/transactions/summary', $queryParams);
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Transaction service unavailable',
                'message' => 'Unable to fetch financial summary'
            ], 503);
        }
    }
}