<?php

namespace App\Service\Import;

use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class OpenRouterClient implements SubscriptionDetectorClientInterface
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $openRouterApiUrl,
        private readonly string $openRouterModel,
    ) {
    }

    public function detectSubscriptions(string $apiKey, string $statementContent): string
    {
        $response = $this->httpClient->request('POST', $this->openRouterApiUrl, [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => $this->openRouterModel,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => <<<'PROMPT'
You analyze bank statement transactions and detect recurring subscription-like payments.
Respond with ONLY a valid JSON object (no markdown) in this exact shape:
{"proposals":[{"name":"Service name","amount":60.00,"billing_cycle":"monthly","category":"entertainment"}]}
Rules:
- billing_cycle must be "monthly" or "yearly"
- category must be one of: entertainment, music, work_tools, other
- amount is a positive number (PLN)
- include only likely subscriptions, not one-off purchases
- if none found, return {"proposals":[]}
PROMPT,
                    ],
                    [
                        'role' => 'user',
                        'content' => "Bank statement transactions (one per line):\n\n" . $statementContent,
                    ],
                ],
                'temperature' => 0.2,
            ],
            'timeout' => 60,
        ]);

        $statusCode = $response->getStatusCode();
        if ($statusCode < 200 || $statusCode >= 300) {
            throw new UnprocessableEntityHttpException('OpenRouter API request failed. Check your API key and try again.');
        }

        $payload = $response->toArray(false);
        $content = $payload['choices'][0]['message']['content'] ?? null;

        if (!is_string($content) || trim($content) === '') {
            throw new UnprocessableEntityHttpException('OpenRouter returned an empty response.');
        }

        return $content;
    }
}
