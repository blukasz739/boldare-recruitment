<?php

namespace App\Tests\Unit\Service\Import;

use App\DTO\Import\ImportConfirmRequest;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use App\Serializer\SubscriptionSerializer;
use App\Service\Import\ImportProposalFactory;
use App\Service\Import\ImportService;
use App\Service\Subscription\MonthlyTotalCalculator;
use App\Service\Subscription\SubscriptionManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ImportServiceTest extends TestCase
{
    private function validator(): ValidatorInterface
    {
        return Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    private function subscriptionManager(?EntityManagerInterface $entityManager = null): SubscriptionManager
    {
        return new SubscriptionManager(
            $this->createMock(SubscriptionRepository::class),
            $entityManager ?? $this->createMock(EntityManagerInterface::class),
            new MonthlyTotalCalculator(),
        );
    }

    public function testConfirmSkipsUnselectedProposals(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('persist');
        $entityManager->expects($this->once())->method('flush');

        $service = new ImportService(
            $this->subscriptionManager($entityManager),
            new ImportProposalFactory(),
            $this->validator(),
            new SubscriptionSerializer(),
        );

        $created = $service->confirm(new User(), new ImportConfirmRequest([
            ['name' => 'Netflix', 'amount' => 60, 'billing_cycle' => 'monthly', 'category' => 'entertainment', 'selected' => true],
            ['name' => 'Spotify', 'amount' => 20, 'billing_cycle' => 'monthly', 'category' => 'music', 'selected' => false],
        ]));

        self::assertCount(1, $created);
    }

    public function testConfirmRejectsInvalidProposal(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->never())->method('persist');

        $service = new ImportService(
            $this->subscriptionManager($entityManager),
            new ImportProposalFactory(),
            $this->validator(),
            new SubscriptionSerializer(),
        );

        $this->expectException(UnprocessableEntityHttpException::class);
        $service->confirm(new User(), new ImportConfirmRequest([
            ['name' => '', 'amount' => -5, 'billing_cycle' => 'monthly', 'category' => 'other', 'selected' => true],
        ]));
    }
}
