<?php

namespace App\Tests\Functional;

final class AuthApiTest extends ApiTestCase
{
    public function testRegisterReturnsToken(): void
    {
        $client = static::createClient();
        $token = $this->registerAndGetToken($client, $this->uniqueUsername('reg'));

        self::assertNotSame('', $token);
    }

    public function testLoginReturnsTokenForValidCredentials(): void
    {
        $client = static::createClient();
        $username = $this->uniqueUsername('login');
        $this->registerAndGetToken($client, $username);

        $client->request(
            'POST',
            '/api/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['username' => $username, 'password' => 'secret123']),
        );

        self::assertResponseIsSuccessful();
    }

    public function testLoginRejectsInvalidPassword(): void
    {
        $client = static::createClient();
        $username = $this->uniqueUsername('login');
        $this->registerAndGetToken($client, $username);

        $client->request(
            'POST',
            '/api/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['username' => $username, 'password' => 'wrong-password']),
        );

        self::assertResponseStatusCodeSame(401);
    }

    public function testRegisterRejectsShortPassword(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/register',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['username' => $this->uniqueUsername('short'), 'password' => 'short12']),
        );

        self::assertResponseStatusCodeSame(422);
    }
}
