<?php

namespace App\DTO\Auth;

use Symfony\Component\Validator\Constraints as Assert;

final class LoginRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Username is required.')]
        public readonly string $username = '',

        #[Assert\NotBlank(message: 'Password is required.')]
        public readonly string $password = '',
    ) {
    }
}
