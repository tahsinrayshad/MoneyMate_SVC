<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BlogController extends Controller
{
    /**
     * Display a listing of all blogs.
     */
    public function index(): JsonResponse
    {
        try {
            $blogs = Blog::with('user')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $blogs,
                'message' => 'Blogs retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blogs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'category' => 'required|string|max:100',
                'content' => 'required|string'
            ]);

            $blog = Blog::create($validated);

            return response()->json([
                'success' => true,
                'data' => $blog->load('user'),
                'message' => 'Blog created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating blog: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified blog post.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $blog = Blog::with('user')->find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $blog,
                'message' => 'Blog retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blog: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified blog post.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $blog = Blog::find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            // Get all request data - handle both JSON and form data
            $allData = $request->all();
            
            // If no data from all(), try to get JSON data manually
            if (empty($allData)) {
                $rawContent = $request->getContent();
                if (!empty($rawContent)) {
                    $allData = json_decode($rawContent, true) ?? [];
                }
            }
            
            // Simple validation - only validate fields that are present
            if (isset($allData['username'])) {
                $request->validate(['username' => 'string|max:255']);
            }
            if (isset($allData['title'])) {
                $request->validate(['title' => 'string|max:255']);
            }
            if (isset($allData['category'])) {
                $request->validate(['category' => 'string|max:100']);
            }
            if (isset($allData['content'])) {
                $request->validate(['content' => 'string']);
            }

            // Get only the fields we want to update from the parsed data
            $updateData = array_intersect_key($allData, array_flip(['username', 'title', 'category', 'content']));
            
            // Remove null/empty values
            $updateData = array_filter($updateData, function($value) {
                return $value !== null && $value !== '';
            });

            // If no data to update, return current blog
            if (empty($updateData)) {
                return response()->json([
                    'success' => true,
                    'data' => $blog->load('user'),
                    'message' => 'No changes to update'
                ], 200);
            }

            // Update each field individually (same as debug route)
            foreach ($updateData as $field => $value) {
                $blog->$field = $value;
            }
            
            $saveResult = $blog->save();
            $blog->refresh();

            return response()->json([
                'success' => true,
                'data' => $blog->load('user'),
                'message' => 'Blog updated successfully'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating blog: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified blog post.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $blog = Blog::find($id);

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found'
                ], 404);
            }

            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting blog: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get blogs by username.
     */
    public function getByUsername(string $username): JsonResponse
    {
        try {
            $blogs = Blog::with('user')
                ->where('username', $username)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $blogs,
                'message' => "Blogs for user '{$username}' retrieved successfully"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blogs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get blogs by category.
     */
    public function getByCategory(string $category): JsonResponse
    {
        try {
            $blogs = Blog::with('user')
                ->where('category', $category)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $blogs,
                'message' => "Blogs in category '{$category}' retrieved successfully"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blogs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search blogs by title or content.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q');
            
            if (!$query) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query is required'
                ], 400);
            }

            $blogs = Blog::with('user')
                ->where('title', 'like', "%{$query}%")
                ->orWhere('content', 'like', "%{$query}%")
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $blogs,
                'message' => "Search results for '{$query}'"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching blogs: ' . $e->getMessage()
            ], 500);
        }
    }

}
