<?php

namespace App\Serializer;

use App\Entity\Subscription;

final class SubscriptionSerializer
{
    /**
     * @return array<string, int|string>
     */
    public function toArray(Subscription $subscription): array
    {
        return [
            'id' => $subscription->getId(),
            'name' => $subscription->getName(),
            'amount' => $subscription->getAmount(),
            'billing_cycle' => $subscription->getBillingCycle()->value,
            'category' => $subscription->getCategory()->value,
            'created_at' => $subscription->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
