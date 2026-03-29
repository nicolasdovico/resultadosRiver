<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SettingController extends Controller
{
    #[OA\Get(
        path: '/v1/settings',
        summary: 'List all settings (Admin only)',
        operationId: 'getSettings',
        tags: ['Settings'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of settings')
        ]
    )]
    #[OA\Get(
        path: '/v1/settings/public',
        summary: 'Get public settings (No auth required)',
        operationId: 'getPublicSettings',
        tags: ['Settings'],
        responses: [
            new OA\Response(response: 200, description: 'Public settings')
        ]
    )]
    public function public()
    {
        return response()->json([
            'river_shield' => Setting::getUrl('river_shield'),
            // Add other public settings here
        ]);
    }

    public function index()
    {
        return response()->json(Setting::all());
    }

    #[OA\Post(
        path: '/v1/settings',
        summary: 'Update a setting (Admin only)',
        operationId: 'updateSetting',
        tags: ['Settings'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['key', 'value'],
                properties: [
                    new OA\Property(property: 'key', type: 'string', example: 'subscription_cost'),
                    new OA\Property(property: 'value', type: 'string', example: '7500')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Setting updated')
        ]
    )]
    public function update(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required|string',
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $request->key],
            ['value' => $request->value]
        );

        return response()->json($setting);
    }
}
