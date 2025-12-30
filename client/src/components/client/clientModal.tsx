import { XCircle, Mail, Phone, MapPin, BarChart3, AlertCircle, CreditCard } from "lucide-react";
import type { Client } from "./types";

// ... reste du code inchangé
// ... reste du code inchangé
interface ClientModalProps {
  client: Client;
  onClose: () => void;
}

const ClientModal = ({ client, onClose }: ClientModalProps) => {
  const seuilAtteint = client.somme_actuelle >= client.seuil;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Détails du Client</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* En-tête avec avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {client.nom[0]}{client.prenom[0]}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                {client.nom} {client.prenom}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">Client #{client.id}</p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              client.status === "actif"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
            }`}>
              {client.status === "actif" ? "Actif" : "Inactif"}
            </span>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Numéro Carnet</p>
              <p className="font-mono text-slate-800 dark:text-white">{client.numero_carnet}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date d'inscription</p>
              <p className="text-slate-800 dark:text-white">{client.date_inscription || "Non spécifié"}</p>
            </div>
          </div>

          {/* Solde et seuil */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Solde Actuel</p>
              <p className={`text-lg font-bold ${
                seuilAtteint 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-slate-800 dark:text-white"
              }`}>
                {client.somme_actuelle.toLocaleString()} €
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Seuil Maximum</p>
              <p className="text-slate-800 dark:text-white">{client.seuil.toLocaleString()} €</p>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Progression</span>
                <span>{Math.min(100, Math.round((client.somme_actuelle / client.seuil) * 100))}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    seuilAtteint 
                      ? "bg-amber-500" 
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(100, (client.somme_actuelle / client.seuil) * 100)}%` }}
                />
              </div>
            </div>

            {seuilAtteint && (
              <div className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle size={16} />
                <span>Le seuil est atteint - Dépôts bloqués</span>
              </div>
            )}
          </div>

          {/* Contact et transactions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Contact</p>
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail size={14} />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                {client.telephone && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone size={14} />
                    <span className="text-sm">{client.telephone}</span>
                  </div>
                )}
                {client.adresse && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin size={14} />
                    <span className="text-sm">{client.adresse}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Transactions</p>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {client.nombre_transactions}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Transactions effectuées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Fermer
          </button>
          <button className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Voir l'historique
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;