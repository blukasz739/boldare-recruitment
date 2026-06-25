<?php

namespace App\DTO\Auth;

use Symfony\Component\Validator\Constraints as Assert;

final class RegisterRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Username is required.')]
        #[Assert\Length(min: 3, max: 180, minMessage: 'Username must be at least {{ limit }} characters.')]
        public readonly string $username = '',

        #[Assert\NotBlank(message: 'Password is required.')]
        #[Assert\Length(min: 6, max: 128, minMessage: 'Password must be at least {{ limit }} characters.')]
        public readonly string $password = '',
    ) {
    }
}
