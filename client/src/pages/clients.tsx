import { useState } from "react";
import { Download, Plus, Users, User, DollarSign, AlertCircle } from "lucide-react";
import HeaderStats from "../components/client/headerStats";
import SearchFilterBar from "../components/client/searchFilterBar";
import ClientTable from "../components/client/clientTable";
import ClientModal from "../components/client/clientModal";
import ClientFormModal from "../components/client/clientFormModal";
import ClientDeleteModal from "../components/client/clientDeleteModal";
import ClientsPagination from "../components/client/clientsPagination";
import type { Client, SortConfig, FilterStatus, StatCard, ClientFormData } from "../components/client/types";

// Données de 24 clients
const initialClients: Client[] = [
  { id: 1, nom: "Dupont", prenom: "Jean", numero_carnet: "CAR001", somme_actuelle: 1850, seuil: 2000, status: "actif", nombre_transactions: 28, email: "jean.dupont@email.com", telephone: "0612345678", adresse: "12 Rue de Paris, 75001 Paris", date_inscription: "2023-01-15" },
  { id: 2, nom: "Martin", prenom: "Marie", numero_carnet: "CAR002", somme_actuelle: 3250, seuil: 3000, status: "actif", nombre_transactions: 42, email: "marie.martin@email.com", telephone: "0623456789", adresse: "25 Avenue des Champs, 69000 Lyon", date_inscription: "2023-02-20" },
  { id: 3, nom: "Bernard", prenom: "Alice", numero_carnet: "CAR003", somme_actuelle: 4200, seuil: 4000, status: "actif", nombre_transactions: 55, email: "alice.bernard@email.com", telephone: "0634567890", adresse: "8 Rue de la République, 13000 Marseille", date_inscription: "2023-03-10" },
  { id: 4, nom: "Dubois", prenom: "Pierre", numero_carnet: "CAR004", somme_actuelle: 950, seuil: 1500, status: "inactif", nombre_transactions: 12, email: "pierre.dubois@email.com", telephone: "0645678901", adresse: "40 Rue Victor Hugo, 31000 Toulouse", date_inscription: "2023-04-05" },
  { id: 5, nom: "Thomas", prenom: "Sophie", numero_carnet: "CAR005", somme_actuelle: 2750, seuil: 2500, status: "actif", nombre_transactions: 38, email: "sophie.thomas@email.com", telephone: "0656789012", adresse: "15 Rue du Commerce, 44000 Nantes", date_inscription: "2023-05-12" },
  { id: 6, nom: "Robert", prenom: "Luc", numero_carnet: "CAR006", somme_actuelle: 1800, seuil: 2000, status: "actif", nombre_transactions: 25, email: "luc.robert@email.com", telephone: "0667890123", adresse: "32 Boulevard Gambetta, 33000 Bordeaux", date_inscription: "2023-06-18" },
  { id: 7, nom: "Petit", prenom: "Emma", numero_carnet: "CAR007", somme_actuelle: 650, seuil: 1000, status: "inactif", nombre_transactions: 8, email: "emma.petit@email.com", telephone: "0678901234", adresse: "5 Place Bellecour, 69002 Lyon", date_inscription: "2023-07-22" },
  { id: 8, nom: "Richard", prenom: "Louis", numero_carnet: "CAR008", somme_actuelle: 3100, seuil: 3000, status: "actif", nombre_transactions: 47, email: "louis.richard@email.com", telephone: "0689012345", adresse: "18 Rue de la Paix, 75002 Paris", date_inscription: "2023-08-30" },
  { id: 9, nom: "Durand", prenom: "Camille", numero_carnet: "CAR009", somme_actuelle: 1200, seuil: 1500, status: "actif", nombre_transactions: 22, email: "camille.durand@email.com", telephone: "0690123456", adresse: "22 Cours Mirabeau, 13100 Aix-en-Provence", date_inscription: "2023-09-14" },
  { id: 10, nom: "Leroy", prenom: "Antoine", numero_carnet: "CAR010", somme_actuelle: 4800, seuil: 4500, status: "actif", nombre_transactions: 62, email: "antoine.leroy@email.com", telephone: "0601234567", adresse: "7 Rue Royale, 59800 Lille", date_inscription: "2023-10-05" },
  { id: 11, nom: "Moreau", prenom: "Julie", numero_carnet: "CAR011", somme_actuelle: 850, seuil: 1200, status: "inactif", nombre_transactions: 14, email: "julie.moreau@email.com", telephone: "0612345679", adresse: "14 Place du Capitole, 31000 Toulouse", date_inscription: "2023-11-11" },
  { id: 12, nom: "Simon", prenom: "Paul", numero_carnet: "CAR012", somme_actuelle: 2200, seuil: 2000, status: "actif", nombre_transactions: 33, email: "paul.simon@email.com", telephone: "0623456780", adresse: "9 Quai des Chartrons, 33000 Bordeaux", date_inscription: "2023-12-03" },
  { id: 13, nom: "Laurent", prenom: "Claire", numero_carnet: "CAR013", somme_actuelle: 1950, seuil: 1800, status: "actif", nombre_transactions: 29, email: "claire.laurent@email.com", telephone: "0634567891", adresse: "27 Rue de la République, 69001 Lyon", date_inscription: "2024-01-15" },
  { id: 14, nom: "Michel", prenom: "David", numero_carnet: "CAR014", somme_actuelle: 350, seuil: 800, status: "inactif", nombre_transactions: 5, email: "david.michel@email.com", telephone: "0645678902", adresse: "3 Rue de Rivoli, 75004 Paris", date_inscription: "2024-02-20" },
  { id: 15, nom: "Garcia", prenom: "Ana", numero_carnet: "CAR015", somme_actuelle: 2900, seuil: 2800, status: "actif", nombre_transactions: 41, email: "ana.garcia@email.com", telephone: "0656789013", adresse: "16 Avenue Jean Médecin, 06000 Nice", date_inscription: "2024-03-10" },
  { id: 16, nom: "Rodriguez", prenom: "Carlos", numero_carnet: "CAR016", somme_actuelle: 4100, seuil: 4000, status: "actif", nombre_transactions: 58, email: "carlos.rodriguez@email.com", telephone: "0667890124", adresse: "45 Rue de la Pompe, 75116 Paris", date_inscription: "2024-04-05" },
  { id: 17, nom: "Fournier", prenom: "Léa", numero_carnet: "CAR017", somme_actuelle: 1250, seuil: 1500, status: "actif", nombre_transactions: 19, email: "lea.fournier@email.com", telephone: "0678901235", adresse: "8 Rue du Palais, 44000 Nantes", date_inscription: "2024-05-12" },
  { id: 18, nom: "Lefebvre", prenom: "Thomas", numero_carnet: "CAR018", somme_actuelle: 800, seuil: 1200, status: "inactif", nombre_transactions: 11, email: "thomas.lefebvre@email.com", telephone: "0689012346", adresse: "12 Place de la Comédie, 34000 Montpellier", date_inscription: "2024-06-18" },
  { id: 19, nom: "Roux", prenom: "Sarah", numero_carnet: "CAR019", somme_actuelle: 2600, seuil: 2500, status: "actif", nombre_transactions: 36, email: "sarah.roux@email.com", telephone: "0690123457", adresse: "20 Cours Julien, 13006 Marseille", date_inscription: "2024-07-22" },
  { id: 20, nom: "Vincent", prenom: "Nicolas", numero_carnet: "CAR020", somme_actuelle: 1750, seuil: 2000, status: "actif", nombre_transactions: 24, email: "nicolas.vincent@email.com", telephone: "0601234568", adresse: "33 Rue de Strasbourg, 67000 Strasbourg", date_inscription: "2024-08-30" },
  { id: 21, nom: "Faure", prenom: "Élise", numero_carnet: "CAR021", somme_actuelle: 3200, seuil: 3000, status: "actif", nombre_transactions: 45, email: "elise.faure@email.com", telephone: "0612345670", adresse: "11 Rue Sainte-Catherine, 69001 Lyon", date_inscription: "2024-09-14" },
  { id: 22, nom: "Mercier", prenom: "Julien", numero_carnet: "CAR022", somme_actuelle: 950, seuil: 1500, status: "inactif", nombre_transactions: 13, email: "julien.mercier@email.com", telephone: "0623456781", adresse: "6 Place de la Bourse, 33000 Bordeaux", date_inscription: "2024-10-05" },
  { id: 23, nom: "Blanc", prenom: "Céline", numero_carnet: "CAR023", somme_actuelle: 2300, seuil: 2200, status: "actif", nombre_transactions: 34, email: "celine.blanc@email.com", telephone: "0634567892", adresse: "14 Rue de la République, 06000 Nice", date_inscription: "2024-11-11" },
  { id: 24, nom: "Guerin", prenom: "Philippe", numero_carnet: "CAR024", somme_actuelle: 1800, seuil: 2000, status: "actif", nombre_transactions: 27, email: "philippe.guerin@email.com", telephone: "0645678903", adresse: "9 Rue de la Barre, 59000 Lille", date_inscription: "2024-12-03" },
];

const ITEMS_PER_PAGE = 10;

const ClientsPage = () => {
  // États principaux
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // États de filtrage et tri
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Calcul des statistiques
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === "actif").length;
  const totalSolde = clients.reduce((sum, c) => sum + c.somme_actuelle, 0);
  const clientsAtSeuil = clients.filter(c => c.somme_actuelle >= c.seuil).length;
  const totalTransactions = clients.reduce((sum, c) => sum + c.nombre_transactions, 0);

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      searchQuery === "" ||
      client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.numero_carnet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.telephone && client.telephone.includes(searchQuery));
    
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Tri sécurisé
  const sortedClients = [...filteredClients].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;
    
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClients = sortedClients.slice(startIndex, endIndex);

  // Handlers pour le tri
  const handleSort = (key: keyof Client) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
    setCurrentPage(1);
  };

  // Handlers CRUD
  const handleCreateClient = (formData: ClientFormData) => {
    const newClient: Client = {
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      nom: formData.nom,
      prenom: formData.prenom,
      numero_carnet: formData.numero_carnet,
      somme_actuelle: formData.somme_actuelle,
      seuil: formData.seuil,
      status: formData.status,
      nombre_transactions: formData.nombre_transactions || 0,
      email: formData.email || undefined,
      telephone: formData.telephone || undefined,
      adresse: formData.adresse || undefined,
      date_inscription: formData.date_inscription || new Date().toISOString().split("T")[0]
    };
    
    setClients(prev => [...prev, newClient]);
    setShowCreateModal(false);
    setCurrentPage(Math.ceil((filteredClients.length + 1) / ITEMS_PER_PAGE));
  };

  const handleUpdateClient = (formData: ClientFormData) => {
    if (!clientToEdit) return;
    
    setClients(prev => prev.map(client => 
      client.id === clientToEdit.id 
        ? {
            ...client,
            nom: formData.nom,
            prenom: formData.prenom,
            numero_carnet: formData.numero_carnet,
            somme_actuelle: formData.somme_actuelle,
            seuil: formData.seuil,
            status: formData.status,
            email: formData.email || undefined,
            telephone: formData.telephone || undefined,
            adresse: formData.adresse || undefined,
            date_inscription: formData.date_inscription || client.date_inscription
          }
        : client
    ));
    
    setClientToEdit(null);
  };

  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    
    setClients(prev => prev.filter(client => client.id !== clientToDelete.id));
    setClientToDelete(null);
    
    // Ajuster la pagination si nécessaire
    if (filteredClients.length % ITEMS_PER_PAGE === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["ID", "Nom", "Prénom", "Numéro Carnet", "Solde (€)", "Seuil (€)", "Statut", "Transactions", "Email", "Téléphone", "Adresse", "Date Inscription"],
      ...sortedClients.map(client => [
        client.id,
        client.nom,
        client.prenom,
        client.numero_carnet,
        client.somme_actuelle,
        client.seuil,
        client.status,
        client.nombre_transactions,
        client.email || "",
        client.telephone || "",
        client.adresse || "",
        client.date_inscription || ""
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  // Navigation de pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Gestion des modals
  const handleEditClick = (client: Client) => {
    setClientToEdit(client);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
  };

  // Cartes de statistiques
  const statsCards: StatCard[] = [
    { 
      label: "Total Clients", 
      value: totalClients.toString(), 
      change: "+12%", 
      icon: Users,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      label: "Clients Actifs", 
      value: `${activeClients} (${Math.round((activeClients / totalClients) * 100)}%)`, 
      change: "+8%", 
      icon: User,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    { 
      label: "Solde Total", 
      value: `${(totalSolde / 1000).toFixed(1)}K €`, 
      change: "+18%", 
      icon: DollarSign,
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500"
    },
    { 
      label: "Atteint Seuil", 
      value: `${clientsAtSeuil} (${Math.round((clientsAtSeuil / totalClients) * 100)}%)`, 
      change: "+5%", 
      icon: AlertCircle,
      bgColor: "bg-rose-500/10",
      iconColor: "text-rose-500"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      {/* Header avec statistiques */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Clients</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {totalClients} clients | {totalTransactions} transactions totales
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download size={16} />
              Exporter CSV
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              Nouveau Client
            </button>
          </div>
        </div>

        <HeaderStats stats={statsCards} />
      </div>

      {/* Barre de recherche et filtres */}
      <SearchFilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filteredClientsCount={filteredClients.length}
        onReset={handleResetFilters}
      />

      {/* Tableau des clients */}
      <ClientTable 
        clients={clients}
        filteredClients={paginatedClients}
        sortConfig={sortConfig}
        onSort={handleSort}
        onViewDetails={setSelectedClient}
        onEditClient={handleEditClick}
        onDeleteClient={handleDeleteClick}
      />

      {/* Pagination */}
      {sortedClients.length > 0 && (
        <ClientsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedClients.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={handlePageChange}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      )}

      {/* Modal de détails du client */}
      {selectedClient && (
        <ClientModal 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}

      {/* Modal de création de client */}
      <ClientFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClient}
        mode="create"
      />

      {/* Modal d'édition de client */}
      <ClientFormModal
        isOpen={!!clientToEdit}
        onClose={() => setClientToEdit(null)}
        onSubmit={handleUpdateClient}
        initialData={clientToEdit}
        mode="edit"
      />

      {/* Modal de suppression de client */}
      <ClientDeleteModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteClient}
        client={clientToDelete}
      />
    </div>
  );
};

export default ClientsPage;