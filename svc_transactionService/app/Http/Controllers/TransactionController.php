<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    /**
     * Display a listing of all transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($transactions);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'username' => 'required|string|max:255',
                'type' => 'required|in:income,expense,transfer',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            // user_id can be null - no problem!
            $transaction = Transaction::create($validated);
            $transaction->load('user:id,name');

            return response()->json($transaction, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating transaction', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction->load('user:id,name');
        
        // Return in similar format to getByType but for single transaction
        return response()->json([
            'data' => [$transaction], // Wrap in array to match the structure
            'message' => 'Transaction retrieved successfully'
        ]);
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        // Store original data for comparison
        $originalData = [
            'username' => $transaction->username,
            'type' => $transaction->type,
            'amount' => $transaction->amount,
            'description' => $transaction->description,
        ];

        $validated = $request->validate([
            'user_id' => 'sometimes|integer|exists:users,id',
            'username' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:income,expense,transfer',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);
        $transaction->load('user:id,name');

        return response()->json([
            'message' => 'Transaction updated successfully',
            'original_data' => $originalData,
            'updated_data' => [
                'id' => $transaction->id,
                'user_id' => $transaction->user_id,
                'username' => $transaction->username,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'description' => $transaction->description,
                'created_at' => $transaction->created_at,
                'updated_at' => $transaction->updated_at,
            ],
            'user' => $transaction->user,
            'changes_made' => array_keys($validated)
        ]);
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    /**
     * Get transactions by type.
     */
    public function getByType(Request $request, string $type): JsonResponse
    {
        // Validate the type parameter
        if (!in_array($type, ['income', 'expense', 'transfer'])) {
            return response()->json(['message' => 'Invalid transaction type'], 400);
        }

        $transactions = Transaction::where('type', $type)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($transactions);
    }
}
