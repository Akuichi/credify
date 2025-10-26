<?php

namespace App\Session;

use Illuminate\Session\DatabaseSessionHandler as BaseDatabaseSessionHandler;
use Illuminate\Contracts\Auth\Guard;

class DatabaseSessionHandler extends BaseDatabaseSessionHandler
{
    /**
     * The authentication guard implementation.
     */
    protected $guard;

    /**
     * Set the authentication guard implementation.
     *
     * @param  \Illuminate\Contracts\Auth\Guard  $guard
     * @return $this
     */
    public function setGuard(Guard $guard)
    {
        $this->guard = $guard;
        return $this;
    }

    /**
     * Add the user information to the session payload.
     *
     * @param  array  $payload
     * @return $this
     */
    protected function addUserInformation(&$payload)
    {
        if ($this->guard && $this->guard->check()) {
            $payload['user_id'] = $this->guard->id();
        }

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function write($sessionId, $data): bool
    {
        $payload = $this->getDefaultPayload($data);

        // Add user information to payload
        $this->addUserInformation($payload);

        // Explicitly set user_id from the guard if available
        if ($this->guard && $this->guard->check()) {
            $payload['user_id'] = $this->guard->id();
        }

        if (! $this->exists($sessionId)) {
            $this->performInsert($sessionId, $payload);
        } else {
            $this->performUpdate($sessionId, $payload);
        }

        return true;
    }
}
