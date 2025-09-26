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
            // Check if user is authenticated by validating token presence
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to create a blog post'
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
            
            // Add username from authenticated user to request data
            $blogData = $request->all();
            $blogData['username'] = $user['username'] ?? $user['email']; // Use username or email as fallback

            $response = Http::withToken($token)
                ->post($this->blogServiceUrl . '/blogs', $blogData);
            
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
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to update a blog post'
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

            // Get the existing blog to check ownership
            $blogResponse = Http::timeout(30)->get($this->blogServiceUrl . '/blogs/' . $id);
            
            if (!$blogResponse->successful()) {
                return response()->json([
                    'error' => 'Blog not found',
                    'message' => 'The blog post does not exist'
                ], 404);
            }

            $blogData = $blogResponse->json();
            $existingBlog = $blogData['data'] ?? $blogData; // Handle response format
            $currentUsername = $user['username'] ?? $user['email'];

            // Check if the current user owns this blog
            if ($existingBlog['username'] !== $currentUsername) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'You can only update your own blog posts'
                ], 403);
            }
            
            // Add username from authenticated user to request data
            $updateData = $request->all();
            $updateData['username'] = $currentUsername;

            $response = Http::withToken($token)
                ->timeout(30)
                ->put($this->blogServiceUrl . '/blogs/' . $id, $updateData);
            
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
            // Check if user is authenticated
            $token = $this->extractToken($request);
            if (!$token) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'You must be logged in to delete a blog post'
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

            // Get the existing blog to check ownership
            $blogResponse = Http::timeout(30)->get($this->blogServiceUrl . '/blogs/' . $id);
            
            if (!$blogResponse->successful()) {
                return response()->json([
                    'error' => 'Blog not found',
                    'message' => 'The blog post does not exist'
                ], 404);
            }

            $blogData = $blogResponse->json();
            $existingBlog = $blogData['data'] ?? $blogData; // Handle response format
            $currentUsername = $user['username'] ?? $user['email'];

            // Check if the current user owns this blog
            if ($existingBlog['username'] !== $currentUsername) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => 'You can only delete your own blog posts'
                ], 403);
            }

            $response = Http::withToken($token)
                ->timeout(30)
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

    /**
     * Get authenticated user information from identity service
     */
    private function getAuthenticatedUser(string $token): ?array
    {
        try {
            $userResponse = Http::withToken($token)
                ->get(env('SVC_ID_URL', 'http://localhost:9001') . '/api/auth/me');

            if ($userResponse->successful()) {
                $data = $userResponse->json();
                // Extract user data from the new response structure
                return $data['user'] ?? $data; // Handle both new and old response formats
            }
        } catch (Exception $e) {
            // Log error if needed
        }
        
        return null;
    }
}