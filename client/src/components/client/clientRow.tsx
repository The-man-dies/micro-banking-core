// components/clientrow.tsx
import { Mail, CreditCard, AlertCircle, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
import type { Client } from "./types";

interface ClientRowProps {
  client: Client;
  onViewDetails: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

const ClientRow = ({ client, onViewDetails, onEditClient, onDeleteClient }: ClientRowProps) => {
  const seuilAtteint = client.somme_actuelle >= client.seuil;
  const soldeClass = seuilAtteint ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-800 dark:text-white";
  
  return (
    <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
      <td className="p-4">
        <span className="font-mono text-slate-800 dark:text-white font-medium">#{client.id}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-300 font-bold text-sm">
              {client.nom[0]}{client.prenom[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              {client.nom} {client.prenom}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {client.email && (
                <>
                  <Mail size={12} />
                  <span>{client.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-slate-500" />
          <span className="font-mono text-slate-700 dark:text-slate-300">{client.numero_carnet}</span>
        </div>
      </td>
      <td className="p-4">
        <div className={`${soldeClass} font-mono`}>
          {client.somme_actuelle.toLocaleString()} €
          {seuilAtteint && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle size={12} />
              <span>Seuil atteint</span>
            </div>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {client.seuil.toLocaleString()} €
        </span>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          client.status === "actif"
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            : "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300"
        }`}>
          {client.status === "actif" ? "Actif" : "Inactif"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-slate-500" />
          <span className="text-slate-800 dark:text-white font-medium">
            {client.nombre_transactions}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewDetails(client)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Voir détails"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEditClient(client)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDeleteClient(client)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientRow;