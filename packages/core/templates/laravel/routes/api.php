<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'app' => '__CT_PROJECT_NAME__']);
});

// @CodersTrim-Inject-Routes
