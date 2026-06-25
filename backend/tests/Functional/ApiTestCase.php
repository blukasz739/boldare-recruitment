<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class ApiTestCase extends WebTestCase
{
    protected function registerAndGetToken(
        KernelBrowser $client,
        string $username,
        string $password = 'secret123',
    ): string {
        $client->request(
            'POST',
            '/api/register',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['username' => $username, 'password' => $password]),
        );

        self::assertResponseStatusCodeSame(201);

        /** @var array{token: string} $data */
        $data = json_decode((string) $client->getResponse()->getContent(), true);

        return $data['token'];
    }

    /**
     * @return array<string, string>
     */
    protected function authHeaders(string $token): array
    {
        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ];
    }

    protected function uniqueUsername(string $prefix): string
    {
        return $prefix . '_' . bin2hex(random_bytes(5));
    }
}
