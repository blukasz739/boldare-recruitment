<?php

namespace App\Repository;

use App\Entity\Subscription;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Subscription>
 */
class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    /**
     * @return list<Subscription>
     */
    public function findAllByUser(User $user): array
    {
        return $this->findBy(['user' => $user], ['name' => 'ASC']);
    }

    public function findOneByIdAndUser(int $id, User $user): ?Subscription
    {
        return $this->findOneBy(['id' => $id, 'user' => $user]);
    }
}
