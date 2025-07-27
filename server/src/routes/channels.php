<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('office.{officeId}', function ($user, $officeId) {
    return ['id' => $user->id, 'name' => $user->name];
});
