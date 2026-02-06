import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { useClients } from "../hooks/useClients";
import type { Client } from "../types";
import ClientForm, { type ClientFormData } from "../components/ClientForm";
import ClientTable from "../components/ClientTable";
import FinancialOperationForm from "../components/FinancialOperationForm";

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
        try {
            await deleteClient(id);
        } catch (err: any) {
            alert(err.message);
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

    const handleFinancialOperationSubmit = async (clientId: number, amount?: number) => {
        switch (financialOperationType) {
            case 'deposit':
                if (amount === undefined) throw new Error("Amount is required for deposit.");
                await deposit(clientId, amount);
                break;
            case 'payout':
                if (amount === undefined) throw new Error("Amount is required for payout.");
                await payout(clientId, amount);
                break;
            case 'renew':
                await renewAccount(clientId);
                break;
        }
    };

    const handleClientFormSubmit = async (clientData: ClientFormData, id: number | undefined) => {
        if (editingClient && id) {
            await updateClient(id, clientData);
        } else {
            await createClient(clientData);
        }
    };

    // Filter clients based on search term
    const filteredClients = clients.filter(client => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;

        const haystack = [
            client.firstname,
            client.lastname,
            client.email ?? "",
            client.phone,
            client.location,
            String(client.id),
        ]
            .join(" ")
            .toLowerCase();

        return haystack.includes(term);
    });

    const summary = useMemo(() => {
        const total = filteredClients.length;
        const active = filteredClients.filter((c) => c.status === 'active').length;
        const expired = filteredClients.filter((c) => c.status !== 'active').length;
        const totalBalance = filteredClients.reduce((sum, c) => sum + (c.accountBalance || 0), 0);
        return { total, active, expired, totalBalance };
    }, [filteredClients]);

    // Define main content to be rendered always (as background for modals)
    const mainContent = (
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

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Clients</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{summary.total}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Actifs</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{summary.active}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Expirés</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{summary.expired}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Solde total</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{summary.totalBalance.toLocaleString()}</p>
                </div>
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
            <ClientTable
                clients={filteredClients}
                onEdit={handleEditClientClick}
                onDelete={handleDeleteClient}
                onFinancialOp={handleFinancialOperationClick}
            />
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
            {isLoading && <p className="text-white text-center py-10">Chargement des clients...</p>}
            {error && <p className="text-red-500 text-center py-10">Erreur: {error}</p>}

            {!isLoading && !error && mainContent}

            {/* Client Form Modal */}
            {isClientFormOpen && (
                <ClientForm
                    onClose={handleCloseClientForm}
                    onSubmit={handleClientFormSubmit}
                    initialData={editingClient}
                />
            )}

            {/* Financial Operation Modal */}
            {isFinancialOperationModalOpen && selectedClientForFinancialOp && financialOperationType && (
                <FinancialOperationForm
                    onClose={handleCloseFinancialOperationModal}
                    onSubmit={handleFinancialOperationSubmit}
                    client={selectedClientForFinancialOp}
                    operationType={financialOperationType}
                />
            )}
        </div>
    );
}
