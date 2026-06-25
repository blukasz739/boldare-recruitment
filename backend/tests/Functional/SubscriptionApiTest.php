<?php

namespace App\Tests\Functional;

final class SubscriptionApiTest extends ApiTestCase
{
    public function testSubscriptionsRequireAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/subscriptions');

        self::assertResponseStatusCodeSame(401);
    }

    public function testUserCanCreateAndListOwnSubscriptions(): void
    {
        $client = static::createClient();
        $token = $this->registerAndGetToken($client, $this->uniqueUsername('owner'));

        $client->request(
            'POST',
            '/api/subscriptions',
            server: $this->authHeaders($token),
            content: json_encode([
                'name' => 'Netflix',
                'amount' => 60,
                'billing_cycle' => 'monthly',
                'category' => 'entertainment',
            ]),
        );
        self::assertResponseStatusCodeSame(201);

        $client->request('GET', '/api/subscriptions', server: $this->authHeaders($token));
        self::assertResponseIsSuccessful();

        $list = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertCount(1, $list);
        self::assertSame('Netflix', $list[0]['name']);
    }

    public function testUserCannotAccessAnotherUsersSubscription(): void
    {
        $client = static::createClient();
        $tokenA = $this->registerAndGetToken($client, $this->uniqueUsername('a'));
        $tokenB = $this->registerAndGetToken($client, $this->uniqueUsername('b'));

        $client->request(
            'POST',
            '/api/subscriptions',
            server: $this->authHeaders($tokenA),
            content: json_encode([
                'name' => 'Spotify',
                'amount' => 20,
                'billing_cycle' => 'monthly',
                'category' => 'music',
            ]),
        );
        self::assertResponseStatusCodeSame(201);
        $id = json_decode((string) $client->getResponse()->getContent(), true)['id'];

        $client->request('GET', '/api/subscriptions/' . $id, server: $this->authHeaders($tokenB));
        self::assertResponseStatusCodeSame(404);

        $client->request('DELETE', '/api/subscriptions/' . $id, server: $this->authHeaders($tokenB));
        self::assertResponseStatusCodeSame(404);
    }

    public function testCreateRejectsInvalidAmount(): void
    {
        $client = static::createClient();
        $token = $this->registerAndGetToken($client, $this->uniqueUsername('amt'));

        $client->request(
            'POST',
            '/api/subscriptions',
            server: $this->authHeaders($token),
            content: json_encode([
                'name' => 'Bad',
                'amount' => 0,
                'billing_cycle' => 'monthly',
                'category' => 'other',
            ]),
        );

        self::assertResponseStatusCodeSame(422);
    }

    public function testImportConfirmRejectsInvalidProposal(): void
    {
        $client = static::createClient();
        $token = $this->registerAndGetToken($client, $this->uniqueUsername('imp'));

        $client->request(
            'POST',
            '/api/import/confirm',
            server: $this->authHeaders($token),
            content: json_encode([
                'proposals' => [
                    ['name' => '', 'amount' => -5, 'billing_cycle' => 'monthly', 'category' => 'other', 'selected' => true],
                ],
            ]),
        );

        self::assertResponseStatusCodeSame(422);
    }

    public function testImportConfirmSkipsUnselectedProposal(): void
    {
        $client = static::createClient();
        $token = $this->registerAndGetToken($client, $this->uniqueUsername('imp2'));

        $client->request(
            'POST',
            '/api/import/confirm',
            server: $this->authHeaders($token),
            content: json_encode([
                'proposals' => [
                    ['name' => 'Keep', 'amount' => 10, 'billing_cycle' => 'monthly', 'category' => 'other', 'selected' => true],
                    ['name' => '', 'amount' => -5, 'billing_cycle' => 'monthly', 'category' => 'other', 'selected' => false],
                ],
            ]),
        );

        self::assertResponseStatusCodeSame(201);
        $data = json_decode((string) $client->getResponse()->getContent(), true);
        self::assertSame(1, $data['count']);
    }
}
