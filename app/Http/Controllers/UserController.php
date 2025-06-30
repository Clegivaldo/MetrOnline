<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Listar usuários
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                return $query->where('role', $role);
            })
            ->orderBy('name')
            ->paginate(10);

        return response()->json($users);
    }

    /**
     * Criar usuário
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Log de auditoria
        AuditLog::create([
            'action' => 'Usuário criado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => "Usuário criado: {$user->email}",
        ]);

        return response()->json($user, 201);
    }

    /**
     * Mostrar usuário
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Atualizar usuário
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:admin,user',
            'password' => 'nullable|string|min:6',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'is_active' => $request->has('is_active') ? $request->is_active : $user->is_active,
        ]);

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        // Log de auditoria
        AuditLog::create([
            'action' => 'Usuário atualizado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => "Usuário atualizado: {$user->email}",
        ]);

        return response()->json($user);
    }

    /**
     * Excluir usuário
     */
    public function destroy(Request $request, User $user)
    {
        // Não permitir excluir o próprio usuário
        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'Não é possível excluir seu próprio usuário'], 400);
        }

        $userEmail = $user->email;
        $user->delete();

        // Log de auditoria
        AuditLog::create([
            'action' => 'Usuário excluído',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => "Usuário excluído: {$userEmail}",
        ]);

        return response()->json(['message' => 'Usuário excluído com sucesso']);
    }

    /**
     * Resetar senha do usuário
     */
    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $user->update(['password' => Hash::make($request->new_password)]);

        // Log de auditoria
        AuditLog::create([
            'action' => 'Senha de usuário resetada',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => "Senha resetada para: {$user->email}",
        ]);

        return response()->json(['message' => 'Senha resetada com sucesso']);
    }

    /**
     * Get user profile
     */
    public function profile()
    {
        return response()->json(auth()->user());
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . auth()->id(),
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = auth()->user();
        $user->name = $request->name;
        $user->email = $request->email;

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($user->profile_image_path) {
                Storage::disk('public')->delete($user->profile_image_path);
            }
            
            $imagePath = $request->file('profile_image')->store('profiles', 'public');
            $user->profile_image_path = $imagePath;
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'profile_image_url' => $user->profile_image_url,
        ]);
    }
}
