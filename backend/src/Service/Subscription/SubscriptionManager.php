<?php

namespace App\Service\Subscription;

use App\DTO\Subscription\SubscriptionRequest;
use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class SubscriptionManager
{
    public function __construct(
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly MonthlyTotalCalculator $monthlyTotalCalculator,
    ) {
    }

    /**
     * @return list<Subscription>
     */
    public function listForUser(User $user): array
    {
        return $this->subscriptionRepository->findAllByUser($user);
    }

    public function getForUser(User $user, int $id): Subscription
    {
        $subscription = $this->subscriptionRepository->findOneByIdAndUser($id, $user);

        if ($subscription === null) {
            throw new NotFoundHttpException('Subscription not found.');
        }

        return $subscription;
    }

    public function create(User $user, SubscriptionRequest $request): Subscription
    {
        $subscription = new Subscription();
        $subscription->setUser($user);
        $this->applyRequest($subscription, $request);

        $this->entityManager->persist($subscription);
        $this->entityManager->flush();

        return $subscription;
    }

    public function update(User $user, int $id, SubscriptionRequest $request): Subscription
    {
        $subscription = $this->getForUser($user, $id);
        $this->applyRequest($subscription, $request);

        $this->entityManager->flush();

        return $subscription;
    }

    public function delete(User $user, int $id): void
    {
        $subscription = $this->getForUser($user, $id);
        $this->entityManager->remove($subscription);
        $this->entityManager->flush();
    }

    /**
     * @return array{monthly_total: string, count: int}
     */
    public function getSummary(User $user): array
    {
        $subscriptions = $this->listForUser($user);

        return [
            'monthly_total' => $this->monthlyTotalCalculator->calculate($subscriptions),
            'count' => count($subscriptions),
        ];
    }

    private function applyRequest(Subscription $subscription, SubscriptionRequest $request): void
    {
        $subscription
            ->setName($request->name)
            ->setAmount(number_format($request->amount, 2, '.', ''))
            ->setBillingCycle($request->billing_cycle)
            ->setCategory($request->category);
    }
}
