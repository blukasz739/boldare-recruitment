<?php

namespace App\Tests\Unit\Service\Import;

use App\Service\Import\ImportProposalFactory;
use PHPUnit\Framework\TestCase;

final class ImportProposalFactoryTest extends TestCase
{
    public function testFromAiResponseParsesJsonObject(): void
    {
        $factory = new ImportProposalFactory();
        $raw = '{"proposals":[{"name":"Netflix","amount":60,"billing_cycle":"monthly","category":"entertainment"}]}';

        $proposals = $factory->fromAiResponse($raw);

        $this->assertCount(1, $proposals);
        $this->assertSame('Netflix', $proposals[0]->name);
        $this->assertSame(60.0, $proposals[0]->amount);
    }

    public function testFromAiResponseParsesMarkdownWrappedJson(): void
    {
        $factory = new ImportProposalFactory();
        $raw = "```json\n{\"proposals\":[]}\n```";

        $proposals = $factory->fromAiResponse($raw);

        $this->assertSame([], $proposals);
    }
}
