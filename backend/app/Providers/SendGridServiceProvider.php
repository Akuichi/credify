<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use SendGrid;

class SendGridServiceProvider extends ServiceProvider
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
        // Add SendGrid mailer
        Mail::extend('sendgrid', function () {
            $apiKey = config('mail.sendgrid_api_key');
            
            $sendGrid = new SendGrid($apiKey);
            
            return new \App\Mail\Transport\SendGridTransport($sendGrid);
        });
    }
}