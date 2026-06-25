<?php

namespace App\Tests\Unit\Service\Subscription;

use App\Entity\Subscription;
use App\Enum\BillingCycle;
use App\Enum\Category;
use App\Service\Subscription\MonthlyTotalCalculator;
use PHPUnit\Framework\TestCase;

final class MonthlyTotalCalculatorTest extends TestCase
{
    private MonthlyTotalCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new MonthlyTotalCalculator();
    }

    public function testMonthlySubscriptionsAreSummed(): void
    {
        $subscriptions = [
            $this->createSubscription('60.00', BillingCycle::Monthly),
            $this->createSubscription('37.00', BillingCycle::Monthly),
        ];

        $this->assertSame('97.00', $this->calculator->calculate($subscriptions));
    }

    public function testYearlySubscriptionsAreDividedByTwelve(): void
    {
        $subscriptions = [
            $this->createSubscription('120.00', BillingCycle::Yearly),
        ];

        $this->assertSame('10.00', $this->calculator->calculate($subscriptions));
    }

    public function testMixedBillingCycles(): void
    {
        $subscriptions = [
            $this->createSubscription('60.00', BillingCycle::Monthly),
            $this->createSubscription('120.00', BillingCycle::Yearly),
        ];

        $this->assertSame('70.00', $this->calculator->calculate($subscriptions));
    }

    public function testEmptyListReturnsZero(): void
    {
        $this->assertSame('0.00', $this->calculator->calculate([]));
    }

    private function createSubscription(string $amount, BillingCycle $billingCycle): Subscription
    {
        $subscription = new Subscription();
        $subscription->setName('Test');
        $subscription->setAmount($amount);
        $subscription->setBillingCycle($billingCycle);
        $subscription->setCategory(Category::Other);

        return $subscription;
    }
}
