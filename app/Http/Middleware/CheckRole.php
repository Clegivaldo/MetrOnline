<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Não autorizado'], 401);
        }

        // Se for cliente, verificar se 'client' está nas roles permitidas
        if ($user instanceof \App\Models\Client) {
            if (in_array('client', $roles)) {
                return $next($request);
            }
        }

        // Se for usuário, verificar se o role está nas roles permitidas
        if ($user instanceof \App\Models\User) {
            if (in_array($user->role, $roles)) {
                return $next($request);
            }
        }

        return response()->json(['error' => 'Acesso negado'], 403);
    }
}
