<?php

namespace App\Tests\Unit\Service\Import;

use App\Service\Import\BankStatementParser;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class BankStatementParserTest extends TestCase
{
    private BankStatementParser $parser;

    protected function setUp(): void
    {
        $this->parser = new BankStatementParser();
    }

    public function testExtractContentNormalizesCsvRows(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'csv');
        file_put_contents($path, "date,description,amount\n2025-01-01,Netflix,-60.00\n");

        $file = new UploadedFile($path, 'statement.csv', 'text/csv', null, true);
        $content = $this->parser->extractContent($file);

        $this->assertStringContainsString('date | description | amount', $content);
        $this->assertStringContainsString('Netflix', $content);
    }

    public function testExtractContentRejectsNonCsvExtension(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'txt');
        file_put_contents($path, 'test');

        $file = new UploadedFile($path, 'statement.txt', 'text/plain', null, true);

        $this->expectException(BadRequestHttpException::class);
        $this->parser->extractContent($file);
    }

    public function testExtractContentRejectsEmptyFile(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'csv');
        file_put_contents($path, '');

        $file = new UploadedFile($path, 'statement.csv', 'text/csv', null, true);

        $this->expectException(BadRequestHttpException::class);
        $this->parser->extractContent($file);
    }
}
