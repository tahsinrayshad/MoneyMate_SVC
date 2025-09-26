<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Exception;

class IdentityController extends Controller
{
    /**
     * Identity service base URL
     */
    private string $identityServiceUrl;

    /**
     * Create a new IdentityController instance.
     */
    public function __construct()
    {
        $this->identityServiceUrl = env('SVC_ID_URL', 'http://localhost:9001') . '/api/auth';
    }

    /**
     * User signup - proxy to identity service
     */
    public function signup(Request $request): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'X-Gateway-Request' => 'moneymate-gateway-2025'
            ])->post($this->identityServiceUrl . '/signup', $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Identity service unavailable',
                'message' => 'Unable to process signup request'
            ], 503);
        }
    }

    /**
     * User login - proxy to identity service
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'X-Gateway-Request' => 'moneymate-gateway-2025'
            ])->post($this->identityServiceUrl . '/login', $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Identity service unavailable',
                'message' => 'Unable to process login request'
            ], 503);
        }
    }

    /**
     * Get authenticated user - proxy to identity service
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'No token provided'
                ], 401);
            }

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->get($this->identityServiceUrl . '/me');
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Identity service unavailable',
                'message' => 'Unable to fetch user information'
            ], 503);
        }
    }

    /**
     * User logout - proxy to identity service
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->post($this->identityServiceUrl . '/logout');
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Identity service unavailable',
                'message' => 'Unable to process logout request'
            ], 503);
        }
    }

    /**
     * Refresh token - proxy to identity service
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'No token provided'
                ], 401);
            }

            $response = Http::withToken($token)
                ->withHeaders(['X-Gateway-Request' => 'moneymate-gateway-2025'])
                ->post($this->identityServiceUrl . '/refresh');
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Identity service unavailable',
                'message' => 'Unable to refresh token'
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
     * Create HTTP client with gateway headers
     */
    private function httpWithGateway()
    {
        return Http::withHeaders([
            'X-Gateway-Request' => 'moneymate-gateway-2025'
        ]);
    }
}