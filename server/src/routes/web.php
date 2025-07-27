<?php

use App\Http\Controllers\PlayerController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/player/move', [PlayerController::class, 'move']);
});

require __DIR__.'/auth.php';