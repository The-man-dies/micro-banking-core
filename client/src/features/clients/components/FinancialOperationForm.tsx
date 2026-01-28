import React, { useState } from "react";
import { X } from "lucide-react";
import type { Client } from "../types";

type Props = {
    onClose: () => void;
    onSubmit: (clientId: number, amount?: number) => Promise<void>; // amount is optional for renew
    client: Client;
    operationType: 'deposit' | 'payout' | 'renew';
};

export default function FinancialOperationForm({ onClose, onSubmit, client, operationType }: Props) {
    const [amount, setAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clientLabel = `${client.firstname} ${client.lastname}`;

    const title =
        operationType === 'deposit' ? `Déposer sur le compte de ${clientLabel}` :
            operationType === 'payout' ? `Retirer du compte de ${clientLabel}` :
                `Renouveler le compte de ${clientLabel}`;

    const submitButtonText =
        operationType === 'deposit' ? "Confirmer le dépôt" :
            operationType === 'payout' ? "Confirmer le retrait" :
                "Confirmer le renouvellement";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (operationType === 'renew') {
                await onSubmit(client.id);
            } else { // deposit or payout
                if (amount <= 0) {
                    setError("Le montant doit être supérieur à zéro.");
                    setIsSubmitting(false);
                    return;
                }
                await onSubmit(client.id, amount);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'opération.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-2xl font-bold text-primary">{title}</h2>
                    <button
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={onClose}
                        type="button"
                        aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <p className="text-sm text-gray-300">
                        Client: <span className="font-bold">{clientLabel} (ID: {client.id})</span>
                    </p>
                    <p className="text-sm text-gray-300">
                        Solde actuel: <span className="font-bold">{client.accountBalance.toLocaleString()} FCFA</span>
                    </p>

                    {operationType !== 'renew' && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Montant *</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Ex: 5000"
                                className="input input-bordered w-full focus:input-primary"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>
                    )}

                    {operationType === 'renew' && (
                        <p className="py-4 text-center text-lg text-white">
                            Confirmez-vous le renouvellement du compte de {clientLabel} ?
                        </p>
                    )}

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Opération en cours...
                                    </>
                                ) : (
                                    submitButtonText
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}