<?php

namespace App\DTO\Import;

use Symfony\Component\Validator\Constraints as Assert;

final class ImportConfirmRequest
{
    /**
     * @param list<ImportProposalData> $proposals
     */
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Count(min: 1)]
        #[Assert\Valid]
        public readonly array $proposals = [],
    ) {
    }
}
