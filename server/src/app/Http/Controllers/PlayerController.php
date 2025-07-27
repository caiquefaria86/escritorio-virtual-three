<?php

namespace App\Http\Controllers;

use App\Events\PlayerMoved;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function move(Request $request)
    {
        $validated = $request->validate([
            'position' => 'required|array',
            'rotation' => 'required|array',
        ]);

        broadcast(new PlayerMoved(
            $request->user()->id,
            $validated['position'],
            $validated['rotation']
        ))->toOthers();

        return response()->json(['status' => 'success']);
    }
}
