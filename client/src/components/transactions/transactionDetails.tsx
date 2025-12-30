// components/transactions/TransactionDetails.tsx
import React from 'react';
import type { Transaction } from './type';
import Modal from './transactionModal';
import StatusBadge from './transactionStatusBadge';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={!!transaction}
      onClose={onClose}
      title="Détails de la transaction"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Fermer
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            Imprimer reçu
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400">ID Transaction</p>
          <p className="text-white font-mono">#{transaction.id}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Type</p>
          <StatusBadge type={transaction.type} label={transaction.type === 'depot' ? 'Dépôt' : 'Retrait'} />
        </div>
        <div>
          <p className="text-sm text-slate-400">Client</p>
          <p className="text-white">{transaction.user}</p>
          <p className="text-xs text-slate-400">{transaction.userId}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Agent</p>
          <p className="text-white">{transaction.agent}</p>
          <p className="text-xs text-slate-400">{transaction.agentId}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Montant</p>
          <p className="text-white font-bold">{transaction.amount.toLocaleString()} FCFA</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Commission</p>
          <p className="text-white">{transaction.commission} FCFA</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Date et heure</p>
          <p className="text-white">{new Date(transaction.date).toLocaleString('fr-FR')}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Méthode</p>
          <p className="text-white">{transaction.method}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-slate-400">Localisation</p>
          <p className="text-white">{transaction.location}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-slate-400">Statut</p>
          <StatusBadge status={transaction.status} label={transaction.status} />
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetails;