<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal de presença para o escritório virtual
Broadcast::channel('office', function ($user) {
    if (Auth::check()) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            // Posição inicial pode ser adicionada aqui se necessário
            'position' => ['x' => 0, 'y' => 0, 'z' => 0],
            'rotation' => ['x' => 0, 'y' => 0, 'z' => 0],
        ];
    }
    return false;
});
