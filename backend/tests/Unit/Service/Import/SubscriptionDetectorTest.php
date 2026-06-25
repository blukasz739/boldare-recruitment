<?php

namespace App\Tests\Unit\Service\Import;

use App\Service\Import\BankStatementParser;
use App\Service\Import\ImportProposalFactory;
use App\Service\Import\SubscriptionDetector;
use App\Service\Import\SubscriptionDetectorClientInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class SubscriptionDetectorTest extends TestCase
{
    public function testDetectFromFileMapsAiResponseToProposals(): void
    {
        $client = $this->createMock(SubscriptionDetectorClientInterface::class);
        $client->method('detectSubscriptions')->willReturn(
            '{"proposals":[{"name":"Netflix","amount":60,"billing_cycle":"monthly","category":"entertainment"}]}',
        );

        $detector = new SubscriptionDetector(
            new BankStatementParser(),
            $client,
            new ImportProposalFactory(),
        );

        $path = tempnam(sys_get_temp_dir(), 'csv');
        file_put_contents($path, "date,description,amount\n2025-01-01,Netflix,-60.00\n");
        $file = new UploadedFile($path, 'statement.csv', 'text/csv', null, true);

        $proposals = $detector->detectFromFile('sk-test-key', $file);

        self::assertCount(1, $proposals);
        self::assertSame('Netflix', $proposals[0]->name);
        self::assertSame(60.0, $proposals[0]->amount);
        self::assertTrue($proposals[0]->selected);
    }
}
