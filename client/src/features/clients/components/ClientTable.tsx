import { useState } from "react";
import type { Client } from "../types";
import {
    Edit, Trash2Icon, DollarSign, RefreshCw,
    MinusCircle, Eye, User, Phone,
    Mail, ShieldCheck, X, AlertCircle, CheckCircle2,
    MapPin
} from "lucide-react";

type Props = {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (id: number) => void;
    onFinancialOp: (client: Client, type: 'deposit' | 'payout' | 'renew') => void;
};

export default function ClientTable({ clients, onEdit, onDelete, onFinancialOp }: Props) {
    const [viewingClient, setViewingClient] = useState<Client | null>(null);
    const [financialClient, setFinancialClient] = useState<Client | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDeleteId, setClientToDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setClientToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (clientToDeleteId !== null) {
            onDelete(clientToDeleteId);
        }
        setShowDeleteModal(false);
        setClientToDeleteId(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setClientToDeleteId(null);
    };

    if (!clients || clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-xl border-2 border-dashed border-base-300">
                <div className="bg-base-200 p-4 rounded-full mb-4">
                    <User size={40} className="text-base-content/50" />
                </div>
                <p className="text-base-content/70 font-medium">Aucun client dans la base de données.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-sm border border-base-300">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr className="bg-base-200/50 text-base-content/70">
                            <th>Client</th>
                            <th>Contact</th>
                            <th>Localisation</th>
                            <th className="text-center">Statut</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} className="hover">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-xl w-10 flex items-center justify-center">
                                                <span className="text-xs font-bold">{client.firstname[0]}{client.lastname[0]}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{client.firstname} {client.lastname}</div>
                                            <div className="text-xs text-base-content/50 opacity-50">ID: #{client.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Phone size={12} className="opacity-70" /> {client.phone}
                                        </div>
                                        {client.email && (
                                            <div className="flex items-center gap-1 text-xs opacity-60">
                                                <Mail size={12} /> {client.email}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-1 text-sm opacity-80">
                                        <MapPin size={14} />
                                        {client.location}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'} gap-1 text-white`}>
                                        {client.status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        {client.status}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => setViewingClient(client)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Détails"
                                        >
                                            <Eye size={16} className="text-base-content/70" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(client)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Modifier"
                                        >
                                            <Edit size={16} className="text-info" />
                                        </button>

                                        <button
                                            onClick={() => setFinancialClient(client)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Opérations Financières"
                                        >
                                            <DollarSign size={16} className="text-success" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteClick(client.id)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Supprimer"
                                        >
                                            <Trash2Icon size={16} className="text-error" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL "FICHE CLIENT" */}
            {viewingClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setViewingClient(null)}>
                    <div
                        className="bg-base-100 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-primary" />
                                Détails Client
                            </h2>
                            <button
                                className="btn btn-circle btn-ghost btn-sm hover:bg-base-200"
                                onClick={() => setViewingClient(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-2xl w-20 flex items-center justify-center">
                                        <span className="text-2xl font-bold">{viewingClient.firstname[0]}{viewingClient.lastname[0]}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{viewingClient.firstname} {viewingClient.lastname}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`badge ${viewingClient.status === 'active' ? 'badge-success' : 'badge-error'} badge-sm text-white`}>
                                            {viewingClient.status}
                                        </span>
                                        <span className="text-sm text-base-content/60">ID #{viewingClient.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="stat bg-base-200/50 rounded-xl p-4">
                                    <div className="stat-title text-xs uppercase tracking-wider opacity-70">Solde Actuel</div>
                                    <div className="stat-value text-xl">{viewingClient.accountBalance.toLocaleString()} <span className="text-xs font-normal opacity-50">FCFA</span></div>
                                </div>
                                <div className="stat bg-primary/10 rounded-xl p-4">
                                    <div className="stat-title text-xs uppercase tracking-wider text-primary">Engagement</div>
                                    <div className="stat-value text-xl text-primary">{viewingClient.montantEngagement?.toLocaleString() || 0} <span className="text-xs font-normal opacity-50">FCFA</span></div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-base-200/30 p-4 rounded-xl border border-base-200">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-primary" />
                                    <div>
                                        <div className="text-xs font-bold uppercase opacity-50">Agent Responsable</div>
                                        <div className="font-medium">Agent ID #{viewingClient.agentId}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-base-content/70" />
                                    <div>
                                        <div className="text-xs font-bold uppercase opacity-50">Téléphone</div>
                                        <div className="font-medium">{viewingClient.phone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-base-content/70" />
                                    <div>
                                        <div className="text-xs font-bold uppercase opacity-50">Adresse</div>
                                        <div className="font-medium">{viewingClient.location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-base-300 bg-base-200/30 rounded-b-2xl flex gap-3">
                            <button
                                onClick={() => { onEdit(viewingClient); setViewingClient(null); }}
                                className="btn btn-outline btn-sm flex-1"
                            >
                                <Edit size={16} /> Modifier
                            </button>
                            <button
                                onClick={() => { setFinancialClient(viewingClient); setViewingClient(null); }}
                                className="btn btn-primary btn-sm flex-1"
                            >
                                <DollarSign size={16} /> Finances
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHOIX OPÉRATION FINANCIÈRE */}
            {financialClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setFinancialClient(null)}>
                    <div
                        className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center border-b border-base-300">
                            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-xl font-bold">Opération Financière</h3>
                            <p className="text-base-content/60 text-sm mt-1">Pour {financialClient.firstname} {financialClient.lastname}</p>
                        </div>

                        <div className="p-6 grid gap-3">
                            <button
                                onClick={() => { onFinancialOp(financialClient, 'deposit'); setFinancialClient(null); }}
                                className="btn btn-outline btn-success w-full justify-start gap-3"
                            >
                                <DollarSign size={18} /> Faire un dépôt
                            </button>
                            <button
                                onClick={() => { onFinancialOp(financialClient, 'payout'); setFinancialClient(null); }}
                                className="btn btn-outline btn-warning w-full justify-start gap-3"
                            >
                                <MinusCircle size={18} /> Faire un retrait
                            </button>

                            <div className="divider my-1"></div>

                            <button
                                onClick={() => { onFinancialOp(financialClient, 'renew'); setFinancialClient(null); }}
                                disabled={financialClient.status === 'active'}
                                className="btn btn-outline btn-primary w-full justify-start gap-3"
                            >
                                <RefreshCw size={18} className={financialClient.status !== 'active' ? "animate-pulse" : ""} />
                                Renouveler compte
                            </button>
                            {financialClient.status === 'active' && (
                                <p className="text-xs text-center text-base-content/40">Le compte est déjà actif</p>
                            )}
                        </div>

                        <div className="p-4 border-t border-base-300 bg-base-200/30 rounded-b-2xl">
                            <button
                                className="btn btn-ghost btn-sm w-full"
                                onClick={() => setFinancialClient(null)}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={cancelDelete}>
                    <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
                            <p className="text-base-content/60 text-sm">
                                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                            </p>
                        </div>
                        <div className="p-6 border-t border-base-300 flex gap-3 bg-base-200/30 rounded-b-2xl">
                            <button className="btn btn-ghost flex-1" onClick={cancelDelete}>Annuler</button>
                            <button className="btn btn-error flex-1" onClick={confirmDelete}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}