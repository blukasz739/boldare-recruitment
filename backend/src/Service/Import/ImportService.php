<?php

namespace App\Service\Import;

use App\DTO\Import\ImportConfirmRequest;
use App\DTO\Import\ImportProposalData;
use App\DTO\Subscription\SubscriptionRequest;
use App\Entity\Subscription;
use App\Entity\User;
use App\Serializer\SubscriptionSerializer;
use App\Service\Subscription\SubscriptionManager;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ImportService
{
    public function __construct(
        private readonly SubscriptionManager $subscriptionManager,
        private readonly ImportProposalFactory $importProposalFactory,
        private readonly ValidatorInterface $validator,
        private readonly SubscriptionSerializer $subscriptionSerializer,
    ) {
    }

    /**
     * @return list<Subscription>
     */
    public function confirm(User $user, ImportConfirmRequest $request): array
    {
        $created = [];

        foreach ($request->proposals as $rawProposal) {
            if (!$this->importProposalFactory->isSelected($rawProposal)) {
                continue;
            }

            $proposal = $this->importProposalFactory->fromConfirmItem($rawProposal);

            $subscriptionRequest = new SubscriptionRequest(
                name: $proposal->name,
                amount: $proposal->amount,
                billing_cycle: $proposal->billing_cycle,
                category: $proposal->category,
            );

            $violations = $this->validator->validate($subscriptionRequest);

            if (count($violations) > 0) {
                throw new UnprocessableEntityHttpException(
                    'Invalid subscription in import: ' . $violations->get(0)->getMessage(),
                );
            }

            $created[] = $this->subscriptionManager->create($user, $subscriptionRequest);
        }

        return $created;
    }

    /**
     * @return list<array<string, bool|float|int|string>>
     */
    public function serializeProposals(array $proposals): array
    {
        return array_map(
            static fn (ImportProposalData $proposal): array => [
                'name' => $proposal->name,
                'amount' => $proposal->amount,
                'billing_cycle' => $proposal->billing_cycle->value,
                'category' => $proposal->category->value,
                'selected' => $proposal->selected,
            ],
            $proposals,
        );
    }

    /**
     * @param list<Subscription> $subscriptions
     *
     * @return list<array<string, int|string>>
     */
    public function serializeSubscriptions(array $subscriptions): array
    {
        return array_map($this->subscriptionSerializer->toArray(...), $subscriptions);
    }
}
