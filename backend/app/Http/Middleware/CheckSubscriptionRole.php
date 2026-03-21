<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role = 'Premium'): Response
    {
        if (!$request->user()) {
            abort(401, 'Unauthenticated.');
        }

        if ($role === 'Premium' && !$request->user()->isPremium()) {
            abort(403, 'This action requires a Premium subscription.');
        }

        if ($role === 'Admin' && !$request->user()->isSuperAdmin() && !$request->user()->hasRole('Data Entry')) {
            abort(403, 'This action requires administrative privileges.');
        }

        return $next($request);
    }
}
