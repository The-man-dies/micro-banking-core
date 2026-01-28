import type { Client } from "../types";
import { Edit, Trash2Icon, DollarSign, RefreshCw, MinusCircle } from "lucide-react";

type Props = {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (id: number) => void;
    onFinancialOp: (client: Client, type: 'deposit' | 'payout' | 'renew') => void;
};

export default function ClientTable({ clients, onEdit, onDelete, onFinancialOp }: Props) {
    if (!clients || clients.length === 0) {
        return <p className="text-white text-center py-10 text-gray-500">Aucun client trouvé.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800/50">
            <table className="table table-zebra w-full text-white">
                <thead className="bg-slate-900 text-slate-100">
                    <tr>
                        <th className="text-center">ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Localisation</th>
                        <th className="text-right">Solde</th>
                        <th>Statut</th>
                        <th className="text-center">Agent ID</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client: Client) => (
                        <tr key={client.id} className="hover:bg-slate-700/10">
                            <td className="text-center">{client.id}</td>
                            <td className="font-medium">{client.firstname} {client.lastname}</td>
                            <td>{client.email ?? '-'}</td>
                            <td>{client.phone}</td>
                            <td>{client.location}</td>
                            <td className="text-right font-bold">{client.accountBalance.toLocaleString()} FCFA</td>
                            <td>
                                <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'} text-white`}>
                                    {client.status}
                                </span>
                            </td>
                            <td className="text-center">{client.agentId}</td>
                            <td>
                                <div className="flex items-center justify-center gap-1">
                                    <button className="btn btn-ghost btn-sm text-info hover:text-info/80" onClick={() => onEdit(client)} title="Modifier">
                                        <Edit size={18} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-success hover:text-success/80" onClick={() => onFinancialOp(client, 'deposit')} title="Déposer">
                                        <DollarSign size={18} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-warning hover:text-warning/80" onClick={() => onFinancialOp(client, 'payout')} title="Retirer">
                                        <MinusCircle size={18} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-primary hover:text-primary/80" onClick={() => onFinancialOp(client, 'renew')} title="Renouveler Compte">
                                        <RefreshCw size={18} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-error hover:text-error/80" onClick={() => onDelete(client.id)} title="Supprimer">
                                        <Trash2Icon size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}