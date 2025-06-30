<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\AuditLog;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login unificado para usuários e clientes com proteção contra força bruta
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = $request->email;
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        // Verificar proteção contra força bruta
        $attemptsInfo = $this->checkBruteForceProtection($email, $ip);

        // Log para debug
        \Log::info('Tentativa de login', [
            'email' => $email,
            'ip' => $ip,
            'user_agent' => $userAgent
        ]);

        // Tentar autenticar como usuário
        $user = User::where('email', $email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            // Verificar se o usuário está ativo
            if (!$user->is_active) {
                $this->logFailedAttempt($email, $ip, $userAgent, 'Usuário inativo');
                throw ValidationException::withMessages([
                    'email' => ['Usuário inativo. Entre em contato com o administrador.'],
                ]);
            }
            
            // Atualizar último login
            $user->last_login = now();
            $user->save();
            
            $token = $user->createToken('auth-token')->plainTextToken;
            
            // Log de auditoria
            AuditLog::create([
                'action' => 'Login realizado',
                'user_email' => $user->email,
                'user_role' => $user->role,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ]);

            // Log de tentativa bem-sucedida
            $this->logSuccessfulAttempt($email, $ip, $userAgent);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_image_url' => $user->profile_image_url,
                    'created_at' => $user->created_at,
                    'last_login' => $user->last_login,
                ]
            ]);
        }

        // Tentar autenticar como cliente
        $client = Client::where('email', $email)->first();
        if ($client && Hash::check($request->password, $client->password)) {
            // Atualizar último login
            $client->last_login = now();
            $client->save();
            
            $token = $client->createToken('auth-token')->plainTextToken;
            
            // Log de auditoria
            AuditLog::create([
                'action' => 'Login de cliente realizado',
                'user_email' => $client->email,
                'user_role' => 'client',
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ]);

            // Log de tentativa bem-sucedida
            $this->logSuccessfulAttempt($email, $ip, $userAgent);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $client->id,
                    'name' => $client->company_name,
                    'email' => $client->email,
                    'role' => 'client',
                    'company_name' => $client->company_name,
                    'cnpj' => $client->cnpj,
                    'created_at' => $client->created_at,
                    'last_login' => $client->last_login,
                ]
            ]);
        }

        // Log de tentativa falhada
        $this->logFailedAttempt($email, $ip, $userAgent, 'Credenciais inválidas');

        // Calcular tentativas restantes após o log
        $remainingAttempts = $attemptsInfo['remaining_email_attempts'] - 1;
        
        $errorMessage = 'Credenciais inválidas.';
        if ($remainingAttempts > 0) {
            $errorMessage .= " Tentativas restantes: {$remainingAttempts}";
        } else {
            $errorMessage .= " Conta será bloqueada na próxima tentativa.";
        }

        throw ValidationException::withMessages([
            'email' => [$errorMessage],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Log de auditoria
        AuditLog::create([
            'action' => 'Logout realizado',
            'user_email' => $user->email ?? $user->email,
            'user_role' => $user->role ?? 'client',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    /**
     * Obter usuário atual
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if ($user instanceof Client) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->company_name,
                'email' => $user->email,
                'role' => 'client',
                'company_name' => $user->company_name,
                'cnpj' => $user->cnpj,
                'created_at' => $user->created_at,
                'last_login' => $user->last_login,
            ]);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_image_url' => $user->profile_image_url,
            'created_at' => $user->created_at,
            'last_login' => $user->last_login,
        ]);
    }

    /**
     * Alterar senha
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6',
            'confirm_password' => 'required|same:new_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Senha atual incorreta.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        // Log de auditoria
        AuditLog::create([
            'action' => 'Senha alterada',
            'user_email' => $user->email,
            'user_role' => $user->role ?? 'client',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Senha alterada com sucesso']);
    }

    /**
     * Verificar proteção contra força bruta
     */
    private function checkBruteForceProtection($email, $ip)
    {
        $maxAttempts = 5; // Máximo de tentativas
        $lockoutTime = 15; // Minutos de bloqueio
        $windowTime = 5; // Janela de tempo em minutos

        // Verificar tentativas por email
        $emailAttempts = LoginAttempt::where('email', $email)
            ->where('success', false)
            ->where('created_at', '>=', now()->subMinutes($windowTime))
            ->count();

        $remainingEmailAttempts = $maxAttempts - $emailAttempts;

        if ($emailAttempts >= $maxAttempts) {
            throw ValidationException::withMessages([
                'email' => ["Muitas tentativas de login para este email. Tente novamente em {$lockoutTime} minutos."],
            ]);
        }

        // Verificar tentativas por IP
        $ipAttempts = LoginAttempt::where('ip_address', $ip)
            ->where('success', false)
            ->where('created_at', '>=', now()->subMinutes($windowTime))
            ->count();

        $remainingIpAttempts = ($maxAttempts * 2) - $ipAttempts;

        if ($ipAttempts >= $maxAttempts * 2) { // IP pode ter mais tentativas
            throw ValidationException::withMessages([
                'email' => ["Muitas tentativas de login deste IP. Tente novamente em {$lockoutTime} minutos."],
            ]);
        }

        // Retornar tentativas restantes para uso posterior
        return [
            'email_attempts' => $emailAttempts,
            'remaining_email_attempts' => $remainingEmailAttempts,
            'ip_attempts' => $ipAttempts,
            'remaining_ip_attempts' => $remainingIpAttempts
        ];
    }

    /**
     * Log de tentativa falhada
     */
    private function logFailedAttempt($email, $ip, $userAgent, $reason = 'Credenciais inválidas')
    {
        LoginAttempt::create([
            'email' => $email,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'success' => false,
            'reason' => $reason,
            'attempted_at' => now(),
        ]);

        // Log de auditoria para tentativas falhadas
        AuditLog::create([
            'action' => 'Tentativa de login falhada',
            'user_email' => $email,
            'user_role' => 'unknown',
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'details' => ['reason' => $reason],
        ]);
    }

    /**
     * Log de tentativa bem-sucedida
     */
    private function logSuccessfulAttempt($email, $ip, $userAgent)
    {
        LoginAttempt::create([
            'email' => $email,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'success' => true,
            'attempted_at' => now(),
        ]);
    }
}
