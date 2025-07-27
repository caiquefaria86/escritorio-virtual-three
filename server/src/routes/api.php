<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->post('/user/token', function (Request $request) {
    $token = $request->user()->createToken($request->token_name ?? 'auth_token', $request->abilities ?? ['*']);

    return ['token' => $token->plainTextToken];
});
