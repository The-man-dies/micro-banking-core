import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Client } from "../types";

// Define the type for the data submitted by the form for creation
type ClientFormData = Omit<Client, 'id' | 'accountBalance' | 'accountStatus' | 'createdAt' | 'updatedAt'>;

type Props = {
    onClose: () => void;
    onSubmit: (clientData: ClientFormData, id?: number) => Promise<void>;
    initialData?: Client | null; // Optional prop for editing existing clients
};

export default function ClientForm({ onClose, onSubmit, initialData }: Props) {
    const [name, setName] = useState(initialData?.name || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [agentId, setAgentId] = useState(initialData?.agentId || 1); // Default to agentId 1 for now
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialData;
    const formTitle = isEditMode ? "Modifier Client" : "Ajouter un Client";
    const submitButtonText = isEditMode ? "Enregistrer les modifications" : "Ajouter le Client";

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPhone(initialData.phone);
            setAddress(initialData.address);
            setAgentId(initialData.agentId);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const clientData: ClientFormData = { name, phone, address, agentId };

        try {
            if (isEditMode && initialData?.id) {
                await onSubmit(clientData, initialData.id);
            } else {
                await onSubmit(clientData);
            }
            onClose(); // Close form on success
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-2xl font-bold text-primary">{formTitle}</h2>
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

                    {isEditMode && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">ID Client</span>
                            </label>
                            <input
                                type="text"
                                value={initialData?.id || ''}
                                className="input input-bordered w-full bg-gray-200"
                                readOnly
                            />
                        </div>
                    )}

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Nom complet *</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ex: John Doe"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Numéro de Téléphone *</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Ex: 70123456"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            pattern="[0-9]{8,}"
                            title="8 chiffres minimum"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Adresse *</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Ex: Bamako, Magnambougou"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">ID Agent *</span>
                        </label>
                        <input
                            type="number"
                            name="agentId"
                            placeholder="Ex: 1"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            min="1"
                            value={agentId}
                            onChange={(e) => setAgentId(Number(e.target.value))}
                        />
                    </div>

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        {isEditMode ? "Enregistrement..." : "Ajout..."}
                                    </>
                                ) : (
                                    submitButtonText
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center mt-4">* Champs obligatoires</div>
                </form>
            </div>
        </div>
    );
}