<?php

namespace App\DTO\Import;

use App\Enum\BillingCycle;
use App\Enum\Category;
use Symfony\Component\Validator\Constraints as Assert;

final class ImportProposalData
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public readonly string $name = '',

        #[Assert\Positive]
        public readonly float $amount = 0.0,

        #[Assert\NotNull]
        public readonly ?BillingCycle $billing_cycle = null,

        #[Assert\NotNull]
        public readonly ?Category $category = null,

        public readonly bool $selected = true,
    ) {
    }
}
