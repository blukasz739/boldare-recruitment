<?php

namespace App\Service\Import;

interface SubscriptionDetectorClientInterface
{
    /**
     * Zwraca surową treść odpowiedzi modelu (oczekiwany JSON z propozycjami).
     */
    public function detectSubscriptions(string $apiKey, string $statementContent): string;
}
