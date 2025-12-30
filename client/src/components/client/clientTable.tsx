// components/clienttable.tsx
import { ChevronUp, ChevronDown, Users } from "lucide-react";
import type { Client, SortConfig } from "./types";
import ClientRow from "./clientRow";

interface ClientTableProps {
  clients: Client[];
  filteredClients: Client[];
  sortConfig: SortConfig;
  onSort: (key: keyof Client) => void;
  onViewDetails: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

const ClientTable = ({ 
  clients, 
  filteredClients, 
  sortConfig, 
  onSort, 
  onViewDetails,
  onEditClient,
  onDeleteClient
}: ClientTableProps) => {
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Client }) => (
    <th className="text-left p-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
      <button 
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-300"
      >
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </button>
    </th>
  );

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <SortableHeader label="ID" sortKey="id" />
              <SortableHeader label="Client" sortKey="nom" />
              <th className="text-left p-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                Numéro Carnet
              </th>
              <SortableHeader label="Solde" sortKey="somme_actuelle" />
              <SortableHeader label="Seuil" sortKey="seuil" />
              <th className="text-left p-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                Statut
              </th>
              <SortableHeader label="Transactions" sortKey="nombre_transactions" />
              <th className="text-left p-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <ClientRow 
                key={client.id} 
                client={client} 
                onViewDetails={onViewDetails}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            <Users className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Aucun client trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ClientTable;