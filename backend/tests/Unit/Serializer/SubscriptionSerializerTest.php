<?php

namespace App\Tests\Unit\Serializer;

use App\Entity\Subscription;
use App\Enum\BillingCycle;
use App\Enum\Category;
use App\Serializer\SubscriptionSerializer;
use PHPUnit\Framework\TestCase;

final class SubscriptionSerializerTest extends TestCase
{
    public function testToArrayExposesCanonicalShape(): void
    {
        $subscription = new Subscription();
        $subscription->setName('Netflix');
        $subscription->setAmount('60.00');
        $subscription->setBillingCycle(BillingCycle::Monthly);
        $subscription->setCategory(Category::Entertainment);

        $data = (new SubscriptionSerializer())->toArray($subscription);

        self::assertSame('Netflix', $data['name']);
        self::assertSame('60.00', $data['amount']);
        self::assertSame('monthly', $data['billing_cycle']);
        self::assertSame('entertainment', $data['category']);
        self::assertArrayHasKey('created_at', $data);
    }
}
