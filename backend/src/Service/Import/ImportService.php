<?php

namespace App\Service\Import;

use App\DTO\Import\ImportConfirmRequest;
use App\DTO\Import\ImportProposalData;
use App\DTO\Subscription\SubscriptionRequest;
use App\Entity\Subscription;
use App\Entity\User;
use App\Service\Subscription\SubscriptionManager;

final class ImportService
{
    public function __construct(
        private readonly SubscriptionManager $subscriptionManager,
    ) {
    }

    /**
     * @return list<Subscription>
     */
    public function confirm(User $user, ImportConfirmRequest $request): array
    {
        $created = [];

        foreach ($request->proposals as $proposal) {
            if (!$proposal->selected) {
                continue;
            }

            $created[] = $this->subscriptionManager->create(
                $user,
                new SubscriptionRequest(
                    name: $proposal->name,
                    amount: $proposal->amount,
                    billing_cycle: $proposal->billing_cycle,
                    category: $proposal->category,
                ),
            );
        }

        return $created;
    }

    /**
     * @return list<array<string, bool|float|int|string>>
     */
    public function serializeProposals(array $proposals): array
    {
        return array_map(
            static fn (ImportProposalData $proposal): array => [
                'name' => $proposal->name,
                'amount' => $proposal->amount,
                'billing_cycle' => $proposal->billing_cycle->value,
                'category' => $proposal->category->value,
                'selected' => $proposal->selected,
            ],
            $proposals,
        );
    }

    /**
     * @return list<array<string, int|string>>
     */
    public function serializeSubscriptions(array $subscriptions): array
    {
        return array_map(
            static fn (Subscription $subscription): array => [
                'id' => $subscription->getId(),
                'name' => $subscription->getName(),
                'amount' => $subscription->getAmount(),
                'billing_cycle' => $subscription->getBillingCycle()->value,
                'category' => $subscription->getCategory()->value,
            ],
            $subscriptions,
        );
    }
}
