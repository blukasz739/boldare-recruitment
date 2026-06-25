<?php

namespace App\Service\Subscription;

use App\Entity\Subscription;
use App\Enum\BillingCycle;

final class MonthlyTotalCalculator
{
    /**
     * @param iterable<Subscription> $subscriptions
     */
    public function calculate(iterable $subscriptions): string
    {
        $total = 0.0;

        foreach ($subscriptions as $subscription) {
            $amount = (float) $subscription->getAmount();

            $total += match ($subscription->getBillingCycle()) {
                BillingCycle::Monthly => $amount,
                BillingCycle::Yearly => $amount / 12,
            };
        }

        return number_format($total, 2, '.', '');
    }
}
