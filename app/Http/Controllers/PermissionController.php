<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index()
    {
        return response()->json(Permission::all());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'label' => 'nullable|string',
        ]);
        $perm = Permission::create($validated);
        return response()->json($perm, 201);
    }
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $permission->id,
            'label' => 'nullable|string',
        ]);
        $permission->update($validated);
        return response()->json($permission);
    }
    public function destroy(Permission $permission)
    {
        $permission->delete();
        return response()->json(null, 204);
    }
    public function userPermissions(User $user)
    {
        return response()->json($user->permissions()->get());
    }
    public function toggleUserPermission(Request $request, User $user)
    {
        $request->validate(['permission_id' => 'required|exists:permissions,id']);
        $permId = $request->permission_id;
        if ($user->permissions()->where('permission_id', $permId)->exists()) {
            $user->permissions()->detach($permId);
        } else {
            $user->permissions()->attach($permId);
        }
        return response()->json(['success' => true]);
    }
} 