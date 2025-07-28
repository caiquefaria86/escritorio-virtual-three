<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\PlayerMoved;
use Illuminate\Support\Facades\Auth;

class PlayerController extends Controller
{
    /**
     * Update the player's position and broadcast it.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateMovement(Request $request)
    {
        $validated = $request->validate([
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
            'position.z' => 'required|numeric',
            'rotation' => 'required|array',
            'rotation.x' => 'required|numeric',
            'rotation.y' => 'required|numeric',
            'rotation.z' => 'required|numeric',
        ]);

        $user = Auth::user();

        // Broadcast the event to other users
        broadcast(new PlayerMoved($user, $validated['position'], $validated['rotation']))->toOthers();

        return response()->json(['status' => 'success']);
    }
}
