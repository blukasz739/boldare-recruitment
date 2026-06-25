<?php

namespace App\DTO\Subscription;

use App\Enum\BillingCycle;
use App\Enum\Category;
use Symfony\Component\Validator\Constraints as Assert;

final class SubscriptionRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Name is required.')]
        #[Assert\Length(max: 255)]
        public readonly string $name = '',

        #[Assert\NotBlank(message: 'Amount is required.')]
        #[Assert\Positive(message: 'Amount must be greater than zero.')]
        public readonly float $amount = 0.0,

        #[Assert\NotNull(message: 'Billing cycle is required.')]
        public readonly ?BillingCycle $billing_cycle = null,

        #[Assert\NotNull(message: 'Category is required.')]
        public readonly ?Category $category = null,
    ) {
    }
}
