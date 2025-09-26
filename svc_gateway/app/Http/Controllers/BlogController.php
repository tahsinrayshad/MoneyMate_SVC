<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Exception;

class BlogController extends Controller
{
    /**
     * Blog service base URL
     */
    private string $blogServiceUrl;

    /**
     * Create a new BlogController instance.
     */
    public function __construct()
    {
        $this->blogServiceUrl = env('SVC_BLOG_URL', 'http://localhost:9003') . '/api';
    }

    /**
     * Get all blogs - proxy to blog service
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $response = Http::get($this->blogServiceUrl . '/blogs', $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to fetch blogs'
            ], 503);
        }
    }

    /**
     * Create a new blog - proxy to blog service
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->post($this->blogServiceUrl . '/blogs', $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to create blog'
            ], 503);
        }
    }

    /**
     * Get specific blog by ID - proxy to blog service
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::get($this->blogServiceUrl . '/blogs/' . $id);
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to fetch blog'
            ], 503);
        }
    }

    /**
     * Update blog by ID - proxy to blog service
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->put($this->blogServiceUrl . '/blogs/' . $id, $request->all());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to update blog'
            ], 503);
        }
    }

    /**
     * Delete blog by ID - proxy to blog service
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->extractToken($request))
                ->delete($this->blogServiceUrl . '/blogs/' . $id);
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to delete blog'
            ], 503);
        }
    }

    /**
     * Search blogs - proxy to blog service
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $response = Http::get($this->blogServiceUrl . '/blogs/search', $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to search blogs'
            ], 503);
        }
    }

    /**
     * Get blogs by username - proxy to blog service
     */
    public function getByUsername(Request $request, string $username): JsonResponse
    {
        try {
            $response = Http::get($this->blogServiceUrl . '/blogs/user/' . $username, $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to fetch user blogs'
            ], 503);
        }
    }

    /**
     * Get blogs by category - proxy to blog service
     */
    public function getByCategory(Request $request, string $category): JsonResponse
    {
        try {
            $response = Http::get($this->blogServiceUrl . '/blogs/category/' . $category, $request->query());
            
            return response()->json(
                $response->json(),
                $response->status()
            );
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Blog service unavailable',
                'message' => 'Unable to fetch category blogs'
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