<?php

namespace App\Controller;

use App\DTO\Subscription\SubscriptionRequest;
use App\Entity\User;
use App\Serializer\SubscriptionSerializer;
use App\Service\Subscription\SubscriptionManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/subscriptions')]
final class SubscriptionController extends AbstractController
{
    public function __construct(
        private readonly SubscriptionManager $subscriptionManager,
        private readonly SubscriptionSerializer $subscriptionSerializer,
    ) {
    }

    #[Route('', name: 'api_subscriptions_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $subscriptions = $this->subscriptionManager->listForUser($this->getAuthenticatedUser());

        return $this->json(array_map($this->subscriptionSerializer->toArray(...), $subscriptions));
    }

    #[Route('/summary', name: 'api_subscriptions_summary', methods: ['GET'])]
    public function summary(): JsonResponse
    {
        return $this->json($this->subscriptionManager->getSummary($this->getAuthenticatedUser()));
    }

    #[Route('/{id}', name: 'api_subscriptions_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $subscription = $this->subscriptionManager->getForUser($this->getAuthenticatedUser(), $id);

        return $this->json($this->subscriptionSerializer->toArray($subscription));
    }

    #[Route('', name: 'api_subscriptions_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] SubscriptionRequest $request): JsonResponse
    {
        $subscription = $this->subscriptionManager->create($this->getAuthenticatedUser(), $request);

        return $this->json($this->subscriptionSerializer->toArray($subscription), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_subscriptions_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(int $id, #[MapRequestPayload] SubscriptionRequest $request): JsonResponse
    {
        $subscription = $this->subscriptionManager->update($this->getAuthenticatedUser(), $id, $request);

        return $this->json($this->subscriptionSerializer->toArray($subscription));
    }

    #[Route('/{id}', name: 'api_subscriptions_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->subscriptionManager->delete($this->getAuthenticatedUser(), $id);

        return $this->json(null, Response::HTTP_NO_CONTENT);
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
