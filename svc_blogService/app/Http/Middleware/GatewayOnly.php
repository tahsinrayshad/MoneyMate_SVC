<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class GatewayOnly
{
    /**
     * Handle an incoming request.
     * Only allow requests from the gateway service
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if request has the gateway identifier header
        $gatewayHeader = $request->header('X-Gateway-Request');
        
        // Simple approach: Check if request comes with gateway signature
        if ($gatewayHeader !== 'moneymate-gateway-2025') {
            return response()->json([
                'error' => 'Direct Access Forbidden',
                'message' => 'This service can only be accessed through the gateway'
            ], 403);
        }

        return $next($request);
    }
}