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
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Csrf\CsrfToken;

class AuthController extends AbstractController
{
    #[Route('/', name:'app_register')]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $hasher, 
        EntityManagerInterface $em,
        CsrfTokenManagerInterface $csrfTokenManager
    ): Response {
        $csrfToken = $csrfTokenManager->getToken('register_form')->getValue();

        if ($request->isMethod('POST')) {
            $submittedToken = $request->request->get('_csrf_token');

            // Vérification du token CSRF
            if (!$csrfTokenManager->isTokenValid(new CsrfToken('register_form', $submittedToken))) {
                throw $this->createAccessDeniedException('Invalid CSRF token.');
            }

            $pseudo = $request->request->get('pseudo');
            $password = $request->request->get('password');

            if ($pseudo && $password) {
                $user = new User();
                $user->setPseudo($pseudo);
                $user->setPassword($hasher->hashPassword($user, $password));
                $user->setRoles(['ROLE_USER']);

                $em->persist($user);
                $em->flush();

                // Redirect après inscription
                return $this->redirectToRoute('login');
            }
        }

        return $this->render('auth/register.html.twig', [
            'csrf_token' => $csrfToken
        ]);
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
