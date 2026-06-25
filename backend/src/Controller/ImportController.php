<?php

namespace App\Controller;

use App\DTO\Import\ImportConfirmRequest;
use App\Entity\User;
use App\Service\Import\ImportService;
use App\Service\Import\SubscriptionDetector;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/import')]
final class ImportController extends AbstractController
{
    public function __construct(
        private readonly SubscriptionDetector $subscriptionDetector,
        private readonly ImportService $importService,
    ) {
    }

    #[Route('/analyze', name: 'api_import_analyze', methods: ['POST'])]
    public function analyze(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        $apiKey = trim((string) $request->request->get('api_key', ''));

        if (!$file instanceof UploadedFile) {
            throw new BadRequestHttpException('CSV file is required.');
        }

        if ($apiKey === '') {
            throw new BadRequestHttpException('API key is required.');
        }

        $proposals = $this->subscriptionDetector->detectFromFile($apiKey, $file);

        return $this->json([
            'proposals' => $this->importService->serializeProposals($proposals),
        ]);
    }

    #[Route('/confirm', name: 'api_import_confirm', methods: ['POST'])]
    public function confirm(#[MapRequestPayload] ImportConfirmRequest $request): JsonResponse
    {
        $created = $this->importService->confirm($this->getAuthenticatedUser(), $request);

        return $this->json([
            'created' => $this->importService->serializeSubscriptions($created),
            'count' => count($created),
        ], Response::HTTP_CREATED);
    }

    private function getAuthenticatedUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }
}
