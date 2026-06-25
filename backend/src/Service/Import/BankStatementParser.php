<?php

namespace App\Service\Import;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class BankStatementParser
{
    private const MAX_FILE_SIZE = 2_097_152;

    public function extractContent(UploadedFile $file): string
    {
        if (!$file->isValid()) {
            throw new BadRequestHttpException('Invalid uploaded file.');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new BadRequestHttpException('File is too large. Maximum size is 2 MB.');
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());
        if ($extension !== 'csv') {
            throw new BadRequestHttpException('Only CSV files are supported.');
        }

        $content = (string) file_get_contents($file->getPathname());
        $content = trim($content);

        if ($content === '') {
            throw new BadRequestHttpException('CSV file is empty.');
        }

        return $this->normalizeForAnalysis($content);
    }

    private function normalizeForAnalysis(string $content): string
    {
        $lines = preg_split('/\r\n|\r|\n/', $content) ?: [];
        $normalized = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $columns = str_getcsv($line);
            $normalized[] = implode(' | ', array_map('trim', $columns));
        }

        if ($normalized === []) {
            throw new BadRequestHttpException('CSV file contains no readable rows.');
        }

        return implode("\n", $normalized);
    }
}
