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
        // Check if filtering by username
        $query = Transaction::orderBy('created_at', 'desc');
        
        if ($request->has('username')) {
            $query->where('username', $request->username);
        }
        
        $transactions = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ],
            'message' => 'Transactions retrieved successfully'
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer',
                'username' => 'required|string|max:255',
                'type' => 'required|in:income,expense,transfer',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            $transaction = Transaction::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully',
                'data' => $transaction
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Transaction retrieved successfully'
        ]);
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            // Find the transaction by ID
            $transaction = Transaction::find($id);
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Store original data for comparison
            $originalData = [
                'id' => $transaction->id,
                'username' => $transaction->username,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'description' => $transaction->description,
            ];

            $validated = $request->validate([
                'user_id' => 'sometimes|integer',
                'username' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|in:income,expense,transfer',
                'amount' => 'sometimes|required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            $transaction->update($validated);
            $transaction->refresh(); // Refresh to get updated data


            return response()->json([
                'success' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
        
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully'
        ]);
    }

    /**
     * Get transactions by type.
     */
    public function getByType(Request $request, string $type): JsonResponse
    {
        // Validate the type parameter
        if (!in_array($type, ['income', 'expense', 'transfer'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid transaction type. Must be: income, expense, or transfer'
            ], 400);
        }

        $query = Transaction::where('type', $type)
            ->orderBy('created_at', 'desc');
        
        // Filter by username if provided
        if ($request->has('username')) {
            $query->where('username', $request->username);
        }
        
        $transactions = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ],
            'message' => "Transactions of type '{$type}' retrieved successfully"
        ]);
    }

    /**
     * Get financial summary for a user (total income, total expense, current balance)
     */
    public function getFinancialSummary(Request $request): JsonResponse
    {
        try {
            // Get username from request (should be provided by gateway)
            $username = $request->query('username');
            
            if (!$username) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username is required'
                ], 400);
            }

            // Calculate total income
            $totalIncome = Transaction::where('username', $username)
                ->where('type', 'income')
                ->sum('amount');

            // Calculate total expense
            $totalExpense = Transaction::where('username', $username)
                ->where('type', 'expense')
                ->sum('amount');

            // Calculate current balance (income - expense)
            $currentBalance = $totalIncome - $totalExpense;

            // Get transaction counts for additional info
            $incomeCount = Transaction::where('username', $username)
                ->where('type', 'income')
                ->count();

            $expenseCount = Transaction::where('username', $username)
                ->where('type', 'expense')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_income' => number_format((float)$totalIncome, 2, '.', ''),
                    'total_expense' => number_format((float)$totalExpense, 2, '.', ''),
                    'current_balance' => number_format((float)$currentBalance, 2, '.', ''),
                    'income_transactions_count' => $incomeCount,
                    'expense_transactions_count' => $expenseCount,
                    'total_transactions_count' => $incomeCount + $expenseCount
                ],
                'message' => 'Financial summary retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving financial summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
}
