<?php

namespace App\Service\Import;

use Symfony\Component\HttpFoundation\File\UploadedFile;

final class SubscriptionDetector
{
    public function __construct(
        private readonly BankStatementParser $bankStatementParser,
        private readonly SubscriptionDetectorClientInterface $openRouterClient,
        private readonly ImportProposalFactory $importProposalFactory,
    ) {
    }

    /**
     * @return list<\App\DTO\Import\ImportProposalData>
     */
    public function detectFromFile(string $apiKey, UploadedFile $file): array
    {
        $statementContent = $this->bankStatementParser->extractContent($file);
        $aiResponse = $this->openRouterClient->detectSubscriptions($apiKey, $statementContent);

        return $this->importProposalFactory->fromAiResponse($aiResponse);
    }
}
