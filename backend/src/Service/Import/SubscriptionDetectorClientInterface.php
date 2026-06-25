<?php

namespace App\Service\Import;

interface SubscriptionDetectorClientInterface
{
    public function detectSubscriptions(string $apiKey, string $statementContent): string;
}
