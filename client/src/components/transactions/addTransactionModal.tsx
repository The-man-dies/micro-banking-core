// components/transactions/AddTransactionModal.tsx
import React, { useState } from 'react';
import type { Transaction, TransactionType, TransactionStatus, PaymentMethod } from './type';
import Modal from './transactionModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [formData, setFormData] = useState({
    type: 'depot' as TransactionType,
    user: '',
    userId: '',
    agent: '',
    agentId: '',
    amount: '',
    status: 'Reçu' as TransactionStatus,
    commission: '',
    location: '',
    method: 'Espèces' as PaymentMethod
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
     const newTransaction: Omit<Transaction, 'id'> = {
    type: formData.type,
    user: formData.user,
    userId: formData.userId,
    agent: formData.agent,
    agentId: formData.agentId,
    amount: Number(formData.amount),
    date: new Date().toISOString(), // ✅ La date est maintenant incluse
    status: formData.status,
    commission: Number(formData.commission),
    location: formData.location,
    method: formData.method
  };

    onAddTransaction(newTransaction);
    onClose();
    setFormData({
      type: 'depot',
      user: '',
      userId: '',
      agent: '',
      agentId: '',
      amount: '',
      status: 'Reçu',
      commission: '',
      location: '',
      method: 'Espèces'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une nouvelle transaction"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit"
            form="add-transaction-form"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Ajouter
          </button>
        </div>
      }
    >
      <form id="add-transaction-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="depot">Dépôt</option>
              <option value="retrait">Retrait</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Statut *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="Reçu">Reçu</option>
              <option value="Complet">Complet</option>
              <option value="En cours">En cours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Client *</label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="Nom du client"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ID Client *</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="CL001"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Agent *</label>
            <input
              type="text"
              name="agent"
              value={formData.agent}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="Nom de l'agent"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ID Agent *</label>
            <input
              type="text"
              name="agentId"
              value={formData.agentId}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="AG001"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Montant (FCFA) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="10000"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Commission (FCFA) *</label>
            <input
              type="number"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="100"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Méthode *</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="Espèces">Espèces</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Carte">Carte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Localisation *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="Dakar"
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;