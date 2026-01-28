import { X } from "lucide-react";
import React, { useState } from "react";
import type { Agent } from "../types"; // Import the Agent type

// Define the type for the data submitted by the form
type AgentFormData = Omit<Agent, 'id'>;

type Props = {
    onClose: () => void;
    onSubmit: (agentData: AgentFormData, id?: number) => Promise<void>;
    initialData?: Agent | null; // Optional prop for editing existing agents
};

export default function AgentForm({ onClose, onSubmit, initialData }: Props) {
    const [firstname, setFirstname] = useState(initialData?.firstname || "");
    const [lastname, setLastname] = useState(initialData?.lastname || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialData;
    const formTitle = isEditMode ? "Modifier l'Agent" : "Ajouter un Agent";
    const submitButtonText = isEditMode ? "Enregistrer les modifications" : "Ajouter l'Agent";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const agentData: AgentFormData = {
            firstname,
            lastname,
            email: email.trim() ? email.trim() : undefined,
            location: location.trim() ? location.trim() : undefined,
        };

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
                                title="ID Agent"
                                className="input input-bordered w-full bg-gray-200"
                                readOnly
                            />
                        </div>
                    )}

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Prénom *</span>
                        </label>
                        <input
                            type="text"
                            name="firstname"
                            placeholder="Ex: Assimi"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Nom *</span>
                        </label>
                        <input
                            type="text"
                            name="lastname"
                            placeholder="Ex: Goita"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Ex: agent@example.com"
                            className="input input-bordered w-full focus:input-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Localisation</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            placeholder="Ex: Bamako"
                            className="input input-bordered w-full focus:input-primary"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
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
