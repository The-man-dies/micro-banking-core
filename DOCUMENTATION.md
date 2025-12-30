# Documentation du Projet Micro-Banking Core

## Table des matières

1. [Architecture générale](#architecture-générale)
2. [Système d'authentification](#système-dauthentification)
3. [Pages de l'application](#pages-de-lapplication)
   - [LoginPage](#loginpage)
   - [Layout](#layout)
   - [DashboardPage](#dashboardpage)
   - [AgentPage](#agentpage)
   - [Clients](#clients)
   - [Transcations](#transcations)
   - [Comptabilite](#comptabilite)
4. [Composants principaux](#composants-principaux)
5. [Routes et navigation](#routes-et-navigation)

---

## Architecture générale

L'application est construite avec **React 19**, **TypeScript**, **React Router v7**, et utilise **Tailwind CSS** pour le styling. Le projet suit une architecture modulaire avec séparation des pages, composants et routes.

### Structure des dossiers

```
client/src/
├── pages/           # Pages principales de l'application
├── components/      # Composants réutilisables
│   ├── dashboard/   # Composants du dashboard
│   ├── agentUI/     # Composants de gestion des agents
│   └── ...
├── routes/          # Configuration des routes
├── store/           # Gestion d'état (si nécessaire)
└── types/           # Définitions TypeScript
```

---

## Système d'authentification

### Logique d'authentification

L'authentification est gérée via le **localStorage** avec la clé `isAuthenticated`. Le système fonctionne de la manière suivante :

1. **Vérification de l'authentification** : Vérifie la présence de `isAuthenticated === "true"` dans le localStorage
2. **Protection des routes** : Les routes protégées utilisent le composant `ProtectedRoute`
3. **Redirection automatique** : 
   - Si non authentifié → redirection vers `/login`
   - Si déjà authentifié sur `/login` → redirection vers `/dashboard`

### Composant ProtectedRoute

**Fichier** : `client/src/components/ProtectedRoute.tsx`

```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};
```

**Logique** :
- Vérifie l'authentification dans le localStorage
- Redirige vers `/login` si non authentifié
- Affiche les enfants (routes protégées) si authentifié

---

## Pages de l'application

### LoginPage

**Fichier** : `client/src/pages/LoginPage.tsx`  
**Route** : `/login`  
**Protection** : Route publique (redirige si déjà connecté)

#### Description

Page de connexion permettant aux administrateurs de se connecter à l'application.

#### États gérés

- `email` : Email de l'utilisateur
- `password` : Mot de passe
- `error` : Message d'erreur à afficher
- `isLoading` : État de chargement pendant la connexion

#### Logique de connexion

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
        // Simulation d'appel API (1 seconde)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validation : accepte tout email/password non vide (pour démo)
        if (email && password) {
            localStorage.setItem("isAuthenticated", "true");
            navigate("/dashboard");
        } else {
            setError("Veuillez entrer un email et un mot de passe valides");
        }
    } catch (err) {
        setError("Échec de la connexion. Veuillez réessayer.");
    } finally {
        setIsLoading(false);
    }
};
```

#### Fonctionnalités

- ✅ Validation des champs (email et password requis)
- ✅ Affichage d'erreurs en cas d'échec
- ✅ État de chargement avec spinner
- ✅ Stockage de l'authentification dans localStorage
- ✅ Redirection automatique vers le dashboard après connexion
- ✅ Option "Se souvenir de moi" (UI uniquement, non implémentée)

#### Note importante

⚠️ **Pour la production** : Remplacer la validation simple par un appel API réel vers le backend pour vérifier les identifiants.

---

### Layout

**Fichier** : `client/src/pages/Layout.tsx`  
**Protection** : Route protégée (nécessite authentification)

#### Description

Layout principal de l'application qui englobe toutes les pages protégées. Il contient la sidebar de navigation et la zone de contenu principal.

#### Structure

```typescript
<div className="flex h-screen w-full bg-gray-900">
    <SidebarItem />  {/* Sidebar de navigation */}
    <main>
        <Outlet />   {/* Contenu des routes enfants */}
    </main>
</div>
```

#### Composants utilisés

- `SidebarItem` : Barre latérale de navigation avec menu et bouton de déconnexion
- `Outlet` : Point d'injection des routes enfants (React Router)

#### Fonctionnalités

- ✅ Affichage de la sidebar sur toutes les pages protégées
- ✅ Zone de contenu scrollable
- ✅ Design responsive avec Tailwind CSS

---

### DashboardPage

**Fichier** : `client/src/pages/DashboardPage.tsx`  
**Route** : `/dashboard`  
**Protection** : Route protégée

#### Description

Page principale du tableau de bord affichant les indicateurs clés de performance (KPI) et des graphiques de visualisation des données.

#### Données affichées (actuellement en dur)

```typescript
const totalAgents = 10;
const activeAgents = 8;
const totalTransactions = 2011;
const totalAmount = "32.4M FCFA";
```

#### Structure de la page

1. **En-tête** : Titre et description du tableau de bord
2. **Cartes KPI** : 4 cartes affichant les métriques principales
3. **Graphiques** : 4 graphiques Chart.js pour visualiser les données

#### Composants utilisés

##### KPICard

**Fichier** : `client/src/components/dashboard/KPICard.tsx`

Affiche une métrique avec :
- Titre
- Valeur (nombre ou string)
- Icône
- Tendance (up/down) avec pourcentage

**Props** :
```typescript
interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: "up" | "down";
    trendValue: string;
}
```

##### Graphiques Chart.js

**Fichier** : `client/src/components/dashboard/graph.chartjs.tsx`

Quatre graphiques créés avec Chart.js :

1. **TransactionTimeSeriesChart** (Graphique en ligne)
   - Affiche l'évolution des transactions sur 7 jours
   - Double axe Y : nombre de transactions et montants
   - Données : Fausses données pour démonstration

2. **CategoryStatsChart** (Graphique en barres)
   - Répartition des transactions par catégorie
   - Catégories : Dépôt, Retrait, Transfert, Paiement, Recharge
   - Données : Fausses données

3. **AgentDistributionChart** (Graphique circulaire/Doughnut)
   - Répartition des agents (Actifs, Inactifs, En attente)
   - Données : Fausses données

4. **WeeklyAmountChart** (Graphique en barres)
   - Montants gérés par jour de la semaine
   - Données : Fausses données

#### Logique des graphiques

Tous les graphiques utilisent :
- **Chart.js 4.5.1** avec **react-chartjs-2 5.3.1**
- Thème sombre adapté au design de l'application
- Configuration responsive
- Données factices prêtes à être remplacées par des données réelles du backend

#### Intégration future

⚠️ **À faire** : Remplacer les données factices par des appels API vers le backend pour récupérer :
- Série temporelle des transactions
- Statistiques par catégorie
- Répartition des agents
- Montants par période

---

### AgentPage

**Fichier** : `client/src/pages/agentPage.tsx`  
**Route** : `/agent`  
**Protection** : Route protégée

#### Description

Page de gestion complète des agents bancaires permettant de visualiser, ajouter, modifier et supprimer des agents.

#### Structure de données

```typescript
type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};
```

#### États gérés

- `agents` : Liste de tous les agents (état initial avec 20 agents de démo)
- `update` : État pour gérer l'affichage du formulaire d'ajout (`"add"` ou `null`)
- `searchTerm` : Terme de recherche pour filtrer les agents

#### Fonctionnalités principales

##### 1. Affichage de la liste

- Tableau responsive affichant tous les agents
- Tri automatique par code agent
- Filtrage en temps réel par recherche

##### 2. Recherche et filtrage

```typescript
const filteredAgents = agents.filter(
    agent =>
        agent.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.telephone.toString().includes(searchTerm) ||
        agent.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.code_agents.toString().includes(searchTerm)
);
```

**Critères de recherche** :
- Nom et prénom
- Numéro de téléphone
- Adresse
- Code agent

##### 3. Ajout d'un agent

**Fonction** : `handleSubmit`

**Validations** :
- ✅ Tous les champs requis (code, nom, téléphone, adresse)
- ✅ Code agent doit être positif
- ✅ Code agent unique (vérification d'unicité)
- ✅ Numéro de téléphone unique (vérification d'unicité)

**Logique** :
```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extraction des données
    const code = Number(formData.get("code"));
    const name = formData.get("name")?.toString().trim();
    const tel = Number(formData.get("tel"));
    const adresse = formData.get("adresse")?.toString().trim();
    
    // Validations...
    
    // Ajout et tri automatique
    setAgents(prev => {
        const updatedAgents = [...prev, newAgent];
        updatedAgents.sort((a, b) => a.code_agents - b.code_agents);
        return updatedAgents;
    });
};
```

##### 4. Génération automatique du code

**Fonction** : `getNextAvailableCode`

Trouve le prochain code disponible en vérifiant les codes manquants dans la séquence :

```typescript
const getNextAvailableCode = () => {
    if (agents.length === 0) return 1;
    const maxCode = Math.max(...agents.map(agent => agent.code_agents));
    for (let i = 1; i <= maxCode + 1; i++) {
        if (!agents.some(agent => agent.code_agents === i)) {
            return i;
        }
    }
    return maxCode + 1;
};
```

#### Composants utilisés

##### Addagents

**Fichier** : `client/src/components/agentUI/addagents.tsx`

Modal pour ajouter un nouvel agent avec :
- Formulaire avec validation
- Auto-remplissage du code suggéré
- Fermeture via bouton X ou en dehors du modal

##### TableauAgent

**Fichier** : `client/src/components/agentUI/tableauAgent.tsx`

Tableau affichant la liste des agents avec :
- Colonnes : Code, Nom/Prénom, Téléphone, Adresse, Actions
- Actions : Modifier, Supprimer
- Design responsive

##### UpdateAgent

**Fichier** : `client/src/components/agentUI/updateAgent.tsx`

Modal pour modifier un agent existant avec :
- Pré-remplissage des champs avec les données actuelles
- Validation des modifications
- Vérification d'unicité du code et téléphone

#### Gestion d'état

- **État local** : Les agents sont stockés dans le state React (pas de persistence)
- **Tri automatique** : Les agents sont triés par code après chaque ajout
- **Filtrage en temps réel** : La recherche filtre instantanément la liste

#### Note importante

⚠️ **Pour la production** : 
- Remplacer l'état local par des appels API vers le backend
- Implémenter la persistence des données
- Ajouter la gestion des erreurs réseau

---

### Clients

**Fichier** : `client/src/pages/clients.tsx`  
**Route** : `/client`  
**Protection** : Route protégée

#### Description

Page de gestion des clients (en développement).

#### État actuel

```typescript
function Clients() {
    return <div>clients</div>;
}
```

#### À implémenter

- Liste des clients
- Formulaire d'ajout/modification
- Recherche et filtrage
- Statistiques clients

---

### Transcations

**Fichier** : `client/src/pages/transcations.tsx`  
**Route** : `/transactions`  
**Protection** : Route protégée

#### Description

Page de gestion des transactions (en développement).

#### État actuel

```typescript
export default function Transcations() {
    return <div>transcations</div>;
}
```

#### À implémenter

- Liste des transactions
- Filtres par date, type, agent, client
- Détails d'une transaction
- Export des données
- Statistiques de transactions

---

### Comptabilite

**Fichier** : `client/src/pages/comptabilite.tsx`  
**Route** : `/comptabilité`  
**Protection** : Route protégée

#### Description

Page de comptabilité (en développement).

#### État actuel

```typescript
function Comptabilite() {
    return <div>Comptabilite</div>;
}
```

#### À implémenter

- Journal comptable
- Bilan
- Compte de résultat
- Rapports financiers
- Export comptable

---

## Composants principaux

### SidebarItem

**Fichier** : `client/src/components/sidebartems.tsx`

#### Description

Barre latérale de navigation avec menu et profil utilisateur.

#### Fonctionnalités

- Navigation entre les pages
- Indication de la page active
- Profil utilisateur avec bouton de déconnexion
- Design responsive

#### Logique de déconnexion

```typescript
const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
};
```

#### Menu de navigation

- 📊 Dashboard (`/dashboard`)
- 👥 Clients (`/client`)
- 👤 Agents (`/agent`)
- 🔄 Transactions (`/transactions`)
- 💰 Comptabilité (`/comptabilité`)

---

## Routes et navigation

### Configuration des routes

**Fichier** : `client/src/routes/app.routes.tsx`

#### Structure des routes

```typescript
<Routes>
    {/* Route publique */}
    <Route path="/login" element={<LoginRoute />} />
    
    {/* Routes protégées avec Layout */}
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/client" element={<Clients />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/transactions" element={<Transcations />} />
        <Route path="/comptabilité" element={<Comptabilite />} />
    </Route>
</Routes>
```

#### Composants de routage

##### RootRedirect

Redirige automatiquement selon l'état d'authentification :
- Authentifié → `/dashboard`
- Non authentifié → `/login`

##### LoginRoute

Protège la route de login :
- Si déjà authentifié → redirige vers `/dashboard`
- Sinon → affiche la page de login

#### Protection des routes

Toutes les routes sauf `/login` sont protégées par le composant `ProtectedRoute` qui :
1. Vérifie l'authentification dans localStorage
2. Redirige vers `/login` si non authentifié
3. Affiche le Layout avec la sidebar si authentifié

---

## Technologies utilisées

### Frontend

- **React 19.2.0** : Bibliothèque UI
- **TypeScript 5.9.3** : Typage statique
- **React Router DOM 7.10.1** : Routage
- **Tailwind CSS 4.1.18** : Styling
- **Chart.js 4.5.1** : Graphiques
- **react-chartjs-2 5.3.1** : Wrapper React pour Chart.js
- **Lucide React 0.561.0** : Icônes

### Build Tools

- **Vite 7.2.4** : Build tool et dev server
- **ESLint** : Linting
- **PostCSS** : Traitement CSS

---

## Notes importantes

### Authentification

⚠️ L'authentification actuelle est basique et utilise localStorage. Pour la production :
- Implémenter un système de tokens (JWT)
- Ajouter un refresh token
- Gérer l'expiration des sessions
- Sécuriser les routes côté backend

### Données

⚠️ Les données sont actuellement :
- En dur dans les composants (Dashboard)
- Stockées dans le state React (Agents)
- Non persistées (sauf authentification)

**À faire** :
- Créer des services API pour communiquer avec le backend
- Implémenter la gestion d'état globale (Redux, Zustand, etc.)
- Ajouter la gestion des erreurs et du chargement

### Graphiques

⚠️ Les graphiques utilisent des données factices. Pour la production :
- Remplacer par des appels API
- Ajouter la gestion des erreurs
- Implémenter le rechargement des données
- Ajouter des filtres de période

---

## Prochaines étapes

1. **Backend Integration**
   - Créer les endpoints API
   - Implémenter l'authentification réelle
   - Connecter les graphiques aux données réelles

2. **Pages en développement**
   - Compléter la page Clients
   - Compléter la page Transactions
   - Compléter la page Comptabilité

3. **Améliorations**
   - Gestion d'état globale
   - Gestion des erreurs
   - Tests unitaires
   - Documentation API

---

**Dernière mise à jour** : 2024

