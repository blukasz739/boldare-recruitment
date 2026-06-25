<?php

namespace App\Service\Import;

use App\DTO\Import\ImportProposalData;
use App\Enum\BillingCycle;
use App\Enum\Category;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class ImportProposalFactory
{
    /**
     * @return list<ImportProposalData>
     */
    public function fromAiResponse(string $rawContent): array
    {
        $decoded = $this->decodeJson($rawContent);
        $items = $decoded['proposals'] ?? null;

        if (!is_array($items)) {
            throw new UnprocessableEntityHttpException('AI response has invalid format.');
        }

        $proposals = [];

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $proposals[] = $this->fromArray($item, selected: true);
        }

        return $proposals;
    }

    public function fromConfirmItem(mixed $item): ImportProposalData
    {
        if ($item instanceof ImportProposalData) {
            return $item;
        }

        if (!is_array($item)) {
            throw new UnprocessableEntityHttpException('Invalid proposal format.');
        }

        return $this->fromArray(
            $item,
            selected: (bool) ($item['selected'] ?? true),
        );
    }

    /**
     * @param array<string, mixed> $item
     */
    private function fromArray(array $item, bool $selected): ImportProposalData
    {
        return new ImportProposalData(
            name: (string) ($item['name'] ?? ''),
            amount: (float) ($item['amount'] ?? 0),
            billing_cycle: $this->parseBillingCycle($item['billing_cycle'] ?? null),
            category: $this->parseCategory($item['category'] ?? null),
            selected: $selected,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJson(string $rawContent): array
    {
        $content = trim($rawContent);

        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $content, $matches) === 1) {
            $content = trim($matches[1]);
        }

        try {
            $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new UnprocessableEntityHttpException('AI response is not valid JSON.');
        }

        if (!is_array($decoded)) {
            throw new UnprocessableEntityHttpException('AI response is not a JSON object.');
        }

        return $decoded;
    }

    private function parseBillingCycle(mixed $value): BillingCycle
    {
        return BillingCycle::tryFrom((string) $value)
            ?? throw new UnprocessableEntityHttpException('AI returned invalid billing cycle.');
    }

    private function parseCategory(mixed $value): Category
    {
        return Category::tryFrom((string) $value)
            ?? throw new UnprocessableEntityHttpException('AI returned invalid category.');
    }
}
