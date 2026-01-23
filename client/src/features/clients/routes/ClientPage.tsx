import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useClients } from "../hooks/useClients";
import type { Client } from "../types";

// Placeholder components - will be created next
const ClientTable = ({ clients, onEdit, onDelete, onFinancialOp }: any) => {
    if (!clients || clients.length === 0) return <p className="text-center py-10 text-gray-500">Aucun client trouvé.</p>;
    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Adresse</th>
                        <th>Solde</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client: Client) => (
                        <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>{client.name}</td>
                            <td>{client.phone}</td>
                            <td>{client.address}</td>
                            <td>{client.accountBalance}</td>
                            <td>{client.accountStatus}</td>
                            <td>
                                <button className="btn btn-sm btn-info mr-2" onClick={() => onEdit(client)}>Modifier</button>
                                <button className="btn btn-sm btn-warning mr-2" onClick={() => onFinancialOp(client, 'deposit')}>Dépôt</button>
                                <button className="btn btn-sm btn-accent mr-2" onClick={() => onFinancialOp(client, 'payout')}>Retrait</button>
                                <button className="btn btn-sm btn-success mr-2" onClick={() => onFinancialOp(client, 'renew')}>Renouveler</button>
                                <button className="btn btn-sm btn-error" onClick={() => onDelete(client.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const ClientForm = ({ onClose, onSubmit, initialData }: any) => {
    const isEditMode = !!initialData;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Modifier Client" : "Ajouter Client"}</h2>
                <p>Client Form Placeholder</p>
                <button className="btn btn-primary mt-4" onClick={() => { alert('Form Submitted!'); onSubmit({ name: 'Test', phone: '123', address: 'xyz', agentId: 1 }); onClose(); }}>Submit (Demo)</button>
                <button className="btn btn-ghost ml-2" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};
const FinancialOperationForm = ({ onClose, onSubmit, client, operationType }: any) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{operationType} for {client?.name}</h2>
                <p>Financial Operation Form Placeholder</p>
                <button className="btn btn-primary mt-4" onClick={() => { alert('Operation Submitted!'); onSubmit(client?.id, 100); onClose(); }}>Submit (Demo)</button>
                <button className="btn btn-ghost ml-2" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};


export default function ClientPage() {
    const {
        clients,
        isLoading,
        error,
        createClient,
        updateClient,
        deleteClient,
        deposit,
        payout,
        renewAccount
    } = useClients();

    const [isClientFormOpen, setIsClientFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isFinancialOperationModalOpen, setIsFinancialOperationModalOpen] = useState(false);
    const [selectedClientForFinancialOp, setSelectedClientForFinancialOp] = useState<Client | null>(null);
    const [financialOperationType, setFinancialOperationType] = useState<'deposit' | 'payout' | 'renew' | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const handleCreateClientClick = () => {
        setEditingClient(null);
        setIsClientFormOpen(true);
    };

    const handleEditClientClick = (client: Client) => {
        setEditingClient(client);
        setIsClientFormOpen(true);
    };

    const handleCloseClientForm = () => {
        setIsClientFormOpen(false);
        setEditingClient(null);
    };

    const handleDeleteClient = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
            try {
                await deleteClient(id);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleFinancialOperationClick = (client: Client, type: 'deposit' | 'payout' | 'renew') => {
        setSelectedClientForFinancialOp(client);
        setFinancialOperationType(type);
        setIsFinancialOperationModalOpen(true);
    };

    const handleCloseFinancialOperationModal = () => {
        setIsFinancialOperationModalOpen(false);
        setSelectedClientForFinancialOp(null);
        setFinancialOperationType(null);
    };

    // Filter clients based on search term
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <p className="text-white text-center py-10">Chargement des clients...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center py-10">Erreur: {error}</p>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
            <div className="space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Gestion des clients</h1>
                        <p className="text-sm md:text-base text-gray-400">Liste de tous les clients enregistrés</p>
                    </div>
                    <button
                        onClick={handleCreateClientClick}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
                        <Plus size={18} />
                        <span>Nouveau client</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSearchTerm("")}
                                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg border border-gray-600 transition-colors flex items-center gap-2">
                                <X size={16} />
                                <span className="hidden sm:inline">Réinitialiser</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Client Table */}
                <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                    <ClientTable
                        clients={filteredClients}
                        onEdit={handleEditClientClick}
                        onDelete={handleDeleteClient}
                        onFinancialOp={handleFinancialOperationClick}
                    />
                </div>
            </div>

            {/* Client Form Modal */}
            {isClientFormOpen && (
                <ClientForm
                    onClose={handleCloseClientForm}
                    onSubmit={editingClient ? updateClient : createClient}
                    initialData={editingClient}
                />
            )}

            {/* Financial Operation Modal */}
            {isFinancialOperationModalOpen && selectedClientForFinancialOp && financialOperationType && (
                <FinancialOperationForm
                    onClose={handleCloseFinancialOperationModal}
                    onSubmit={
                        financialOperationType === 'deposit' ? deposit :
                            financialOperationType === 'payout' ? payout :
                                renewAccount
                    }
                    client={selectedClientForFinancialOp}
                    operationType={financialOperationType}
                />
            )}
        </div>
    );
}
