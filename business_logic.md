# Logique Métier de l'Application

Ce document décrit la logique métier principale concernant le cycle de vie d'un client et les transactions financières associées.

## 1. Cycle de Vie du Client

Le cycle de vie d'un client est basé sur une période d'activité de 30 jours, initiée par un paiement.

### a. Création d'un Client

- **Flux** : Un nouveau client est créé en fournissant ses informations personnelles ainsi qu'un `montantEngagement`.
- **`montantEngagement`** : C'est le montant des frais d'inscription payés par le client. Ce montant **n'est pas ajouté** à son solde. Il sert de référence pour le contrat initial.
- **Solde Initial** : Le `accountBalance` (solde du compte) du client est initialisé à **zéro**.
- **Validité** : Le compte est créé avec un statut `active` et une date d'expiration (`accountExpiresAt`) fixée à 30 jours dans le futur.
- **Traçabilité** :
  - Une transaction de type `FraisInscription` est créée dans la table `Transactions` pour tracer ces frais.
  - Un ticket de support initial est également créé pour le client.

### b. Dépôts (Investissement)

- **Flux** : Une fois le compte actif, le client peut effectuer des dépôts.
- **Logique** : Tout montant déposé est **ajouté** au `accountBalance` du client.
- **Traçabilité** : Chaque dépôt génère une transaction de type `Depot` dans la table `Transactions`.

### c. Fin de Cycle et Retrait (Payout)

- **Flux** : À la fin de la période de 30 jours (ou manuellement via l'API), l'agent peut effectuer un "payout" pour le client.
- **Logique** :
  - La totalité du `accountBalance` est retirée.
  - Le `accountBalance` du client est remis à **zéro**.
  - Le statut du compte passe à `expired`.
- **Traçabilité** : Une transaction de type `Retrait` est créée pour enregistrer le montant total qui a été versé au client.

### d. Renouvellement de Compte

- **Flux** : Un client avec un compte `expired` (ou actif) peut le renouveler pour un nouveau cycle de 30 jours.
- **Logique** :
  - Le client paie de nouveaux frais, appelés `fraisReactivation`.
  - Ce montant met à jour le `montantEngagement` du client pour le nouveau cycle.
  - La date `accountExpiresAt` est prolongée de 30 jours.
  - Le statut du compte est (re)mis à `active`.
  - **Important** : Ces frais ne sont pas ajoutés au `accountBalance` du client.
- **Traçabilité** : Une transaction de type `FraisReactivation` est créée pour tracer les frais de renouvellement.

## 2. Traçabilité Financière

La table `Transactions` est au cœur du système. Elle a pour but de fournir un audit complet de tous les flux financiers :

- **`FraisInscription`** : Argent perçu par l'entreprise lors de la création d'un compte.
- **`FraisReactivation`** : Argent perçu par l'entreprise lors du renouvellement d'un compte.
- **`Depot`** : Argent appartenant au client, ajouté à son solde.
- **`Retrait`** : Argent appartenant au client, retiré de son solde et lui étant rendu.

Cette séparation garantit une comptabilité claire et précise, distinguant les revenus de l'entreprise des fonds des clients.
