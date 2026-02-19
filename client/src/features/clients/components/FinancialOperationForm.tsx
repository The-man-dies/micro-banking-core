import React, { useState } from "react";
import { X } from "lucide-react";
import type { Client } from "../types";

type Props = {
    onClose: () => void;
    onSubmit: (clientId: number, amount?: number) => Promise<void>; // amount is optional for renew
    client: Client;
    operationType: 'deposit' | 'payout' | 'renew';
};

// Utility: Adds spaces as thousands separators (e.g. 10000 -> 10 000)
const formatCurrencyInput = (value: string | number): string => {
    if (!value) return "";
    const strVal = value.toString().replace(/\D/g, ""); // Remove non-digits
    return strVal.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Utility: Removes spaces to get raw number (e.g. 10 000 -> 10000)
const normalizeCurrencyInput = (value: string): number => {
    return parseInt(value.replace(/\s/g, ""), 10) || 0;
};

export default function FinancialOperationForm({ onClose, onSubmit, client, operationType }: Props) {
    const [amount, setAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clientLabel = `${client.firstname} ${client.lastname}`;

    const statusTranslations: Record<Client['status'], string> = {
        active: 'Actif',
        withdraw_only: 'Retrait Uniquement',
        expired: 'Expiré',
    };
    const translatedStatus = statusTranslations[client.status] || client.status;

    let formDisabledReason: string | null = null;
    if (operationType === 'deposit' && (client.status === 'withdraw_only' || client.status === 'expired')) {
        formDisabledReason = client.status === 'withdraw_only'
            ? "Les dépôts ne sont pas autorisés pour un compte en mode Retrait Uniquement."
            : "Les dépôts ne sont pas autorisés pour un compte expiré.";
    } else if (operationType === 'payout' && client.status === 'expired') {
        formDisabledReason = "Les retraits ne sont pas autorisés pour un compte expiré.";
    }



    const title =
        operationType === 'deposit' ? `Déposer sur le compte de ${clientLabel}` :
            operationType === 'payout' ? `Retirer du compte de ${clientLabel}` :
                `Renouveler le compte de ${clientLabel}`;

    const submitButtonText =
        operationType === 'deposit' ? "Confirmer le dépôt" :
            operationType === 'payout' ? "Confirmer le retrait" :
                "Confirmer le renouvellement";

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(formatCurrencyInput(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);



        try {
            if (operationType === 'renew') {
                const numericAmount = normalizeCurrencyInput(amount);
                if (numericAmount <= 0) {
                    setError("Le montant de réactivation doit être supérieur à zéro.");
                    setIsSubmitting(false);
                    return;
                }
                await onSubmit(client.id, numericAmount);
            } else { // deposit or payout
                const numericAmount = normalizeCurrencyInput(amount);

                if (numericAmount <= 0) {
                    setError("Le montant doit être supérieur à zéro.");
                    setIsSubmitting(false);
                    return;
                }

                // New Frontend Validation for Payouts
                if (operationType === 'payout') {
                    if (client.accountBalance === 0) {
                        setError("Impossible de retirer. Le solde du compte est de zéro.");
                        setIsSubmitting(false);
                        return;
                    }
                    if (numericAmount > client.accountBalance) {
                        setError("Le montant du retrait ne peut pas être supérieur au solde disponible.");
                        setIsSubmitting(false);
                        return;
                    }
                }


                // VALIDATION: Deposit amount must equal engagement amount
                if (operationType === 'deposit' && client.montantEngagement && numericAmount !== client.montantEngagement) {
                    setError(`Le montant du dépôt doit être strictement égal au montant d'engagement (${client.montantEngagement.toLocaleString()} FCFA).`);
                    setIsSubmitting(false);
                    return;
                }

                await onSubmit(client.id, numericAmount);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'opération.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                    <button
                        className="btn btn-circle btn-ghost btn-sm hover:bg-base-200"
                        onClick={onClose}
                        type="button"
                        aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div role="alert" className="alert alert-error text-sm py-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-base-200/50 p-4 rounded-xl space-y-2">
                        <p className="text-sm opacity-70">
                            Client: <span className="font-bold opacity-100">{clientLabel} (ID: {client.id})</span>
                        </p>
                        <p className="text-sm opacity-70">
                            Solde actuel: <span className="font-bold opacity-100">{client.accountBalance.toLocaleString()} FCFA</span>
                        </p>
                        <p className="text-sm opacity-70">
                            Statut du compte: <span className="font-bold opacity-100">{translatedStatus}</span>
                        </p>
                    </div>

                    {(operationType === 'deposit' || operationType === 'payout' || operationType === 'renew') && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Montant ({operationType === 'renew' ? 'Frais de Réactivation' : 'FCFA'}) *</span>
                            </label>
                            <input
                                type="text"
                                name="amount"
                                placeholder="Ex: 5 000"
                                className="input input-bordered w-full focus:input-primary font-mono text-lg"
                                required
                                value={amount}
                                onChange={handleAmountChange}
                                autoComplete="off"
                                disabled={!!formDisabledReason || isSubmitting}
                            />
                            {formDisabledReason && (
                                <div className="text-warning text-sm mt-2">{formDisabledReason}</div>
                            )}
                        </div>
                    )}

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button type="button" className="btn btn-ghost flex-1 hover:bg-base-200" onClick={onClose} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-primary/20" disabled={!!formDisabledReason || isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Traitement...
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