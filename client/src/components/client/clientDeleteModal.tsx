// components/clientdeletemodal.tsx
import { XCircle, AlertTriangle, User } from "lucide-react";
import type { Client } from "./types";

interface ClientDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  client: Client | null;
}

const ClientDeleteModal = ({ isOpen, onClose, onConfirm, client }: ClientDeleteModalProps) => {
  if (!isOpen || !client) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={20} />
              Confirmer la suppression
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <User className="text-rose-600 dark:text-rose-400" size={20} />
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-white">
                {client.nom} {client.prenom}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Numéro carnet : {client.numero_carnet}
              </p>
            </div>
          </div>
          
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
            <p className="text-rose-700 dark:text-rose-300 text-sm">
              <AlertTriangle className="inline mr-2" size={16} />
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
              Toutes les données associées à ce client seront définitivement perdues.
            </p>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium mb-1">Informations qui seront supprimées :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Informations personnelles</li>
              <li>Solde : {client.somme_actuelle.toLocaleString()} €</li>
              <li>Historique des transactions ({client.nombre_transactions} transactions)</li>
              <li>Informations de contact</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDeleteModal;