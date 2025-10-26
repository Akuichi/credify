<?php

namespace App\Providers;

use App\Session\DatabaseSessionHandler;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Session::extend('database', function ($app) {
            $connection = $app['db']->connection($app['config']['session.connection']);
            $table = $app['config']['session.table'];
            $lifetime = $app['config']['session.lifetime'];
            
            $handler = new DatabaseSessionHandler(
                $connection,
                $table,
                $lifetime,
                $app
            );

            // Set the guard so the handler can access the authenticated user
            $handler->setGuard(Auth::guard());

            return $handler;
        });
    }
}
