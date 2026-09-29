<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'message' => 'Laravel 13 REST API connected!',
        'app' => '__CT_PROJECT_NAME__'
    ]);
});

Route::get('/users', [UserController::class, 'index']);

// @CodersTrim-Inject-Routes
