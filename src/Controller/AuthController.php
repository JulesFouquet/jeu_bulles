<?php

// src/Controller/AuthController.php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class AuthController extends AbstractController
{
    #[Route('/', name:'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $pseudo = $request->request->get('pseudo');
            $password = $request->request->get('password');

            if ($pseudo && $password) {
                $user = new User();
                $user->setPseudo($pseudo);
                $user->setPassword($hasher->hashPassword($user, $password));
                $user->setRoles(['ROLE_USER']);

                $em->persist($user);
                $em->flush();

                // 🔹 Redirect après POST pour Turbo
                return $this->redirectToRoute('login');
            }
        }

        return $this->render('auth/register.html.twig');
    }

    #[Route('/login', name:'login')]
    public function login(AuthenticationUtils $authUtils): Response
    {
        $error = $authUtils->getLastAuthenticationError();
        $lastUsername = $authUtils->getLastUsername();

        return $this->render('auth/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error
        ]);
    }

    #[Route('/logout', name:'app_logout')]
    public function logout(): void {}
}
