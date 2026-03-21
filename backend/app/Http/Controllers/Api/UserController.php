<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/v1/users',
        summary: 'List all users (Admin only)',
        tags: ['User Management'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of users')
        ]
    )]
    public function index()
    {
        $users = User::with('roles', 'subscriptions')->get();
        return response()->json($users);
    }

    #[OA\Get(
        path: '/v1/users/{id}',
        summary: 'Get user details (Admin only)',
        tags: ['User Management'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'User details')
        ]
    )]
    public function show($id)
    {
        $user = User::with('roles', 'subscriptions', 'payments').findOrFail($id);
        return response()->json($user);
    }

    #[OA\Put(
        path: '/v1/users/{id}',
        summary: 'Update user roles and info (Admin only)',
        tags: ['User Management'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Juan Perez'),
                    new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string', example: 'Premium'))
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'User updated')
        ]
    )]
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        $user->save();

        if ($request->has('roles')) {
            $roleIds = Role::whereIn('name', $request->roles)->pluck('id');
            $user->roles()->sync($roleIds);
        }

        return response()->json($user->load('roles'));
    }

    #[OA\Delete(
        path: '/v1/users/{id}',
        summary: 'Delete or deactivate user (Admin only)',
        tags: ['User Management'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted')
        ]
    )]
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
