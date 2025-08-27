<?php

namespace App\Controller;

use App\Repository\ScoreRepository;
use App\Entity\Score;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class GameController extends AbstractController
{
    #[Route('/jeu', name: 'game_index')]
public function index(ScoreRepository $scoreRepo): Response
{
    /** @var \App\Entity\User|null $user */
    $user = $this->getUser();
    $pseudo = $user ? $user->getPseudo() : 'Player';

    // Récupération du top 10 des scores pour le leaderboard
    $scores = $scoreRepo->findBy([], ['score' => 'DESC'], 10);

    // Récupération du meilleur score du joueur connecté
    $bestScore = null;
    if ($user) {
        $userBest = $scoreRepo->findBy(['player' => $user], ['score' => 'DESC'], 1);
        if (!empty($userBest)) {
            $bestScore = $userBest[0]->getScore();
        }
    }

    return $this->render('game/index.html.twig', [
        'pseudo' => $pseudo,
        'scores' => $scores,
        'bestScore' => $bestScore,
    ]);
}


    #[Route('/jeu/score', name: 'game_save_score', methods: ['POST'])]
    public function saveScore(Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $scoreValue = $data['score'] ?? 0;
        $missClicks = $data['missClicks'] ?? 0;

        $entityManager = $doctrine->getManager();

        $score = new Score();
        $score->setPlayer($user); // <-- correction : setPlayer
        $score->setScore($scoreValue);
        $score->setMissClicks($missClicks);

        $entityManager->persist($score);
        $entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/jeu/scores', name: 'game_get_scores', methods: ['GET'])]
public function getScores(ScoreRepository $scoreRepo): JsonResponse
{
    // Récupération des 10 meilleurs scores
    $scores = $scoreRepo->findBy([], ['score' => 'DESC'], 10);

    $data = [];
    foreach ($scores as $score) {
        $data[] = [
            'pseudo' => $score->getPlayer()->getPseudo(),
            'score' => $score->getScore(),
            'missClicks' => $score->getMissClicks(),
        ];
    }

    return new JsonResponse($data);
}

}
