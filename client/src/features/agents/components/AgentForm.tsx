import { X } from "lucide-react";
import React, { useState } from "react";
import type { Agent } from "../types"; // Import the Agent type

// Define the type for the data submitted by the form
type AgentFormData = Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>;

type Props = {
    onClose: () => void;
    onSubmit: (agentData: AgentFormData, id?: number) => Promise<void>;
    initialData?: Agent | null; // Optional prop for editing existing agents
};

export default function AgentForm({ onClose, onSubmit, initialData }: Props) {
    const [name, setName] = useState(initialData?.name || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialData;
    const formTitle = isEditMode ? "Modifier l'Agent" : "Ajouter un Agent";
    const submitButtonText = isEditMode ? "Enregistrer les modifications" : "Ajouter l'Agent";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const agentData: AgentFormData = { name, phone, address };

        try {
            if (isEditMode && initialData?.id) {
                await onSubmit(agentData, initialData.id);
            } else {
                await onSubmit(agentData);
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
                                <span className="label-text font-semibold">ID Agent</span>
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
                            <span className="label-text font-semibold">Nom et Prénom *</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ex: Assimi Goita"
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
                            placeholder="Ex: Bamako, Hamdallaye"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
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
