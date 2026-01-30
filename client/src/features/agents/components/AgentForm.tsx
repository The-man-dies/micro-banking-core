import { X, User, MapPin, Mail, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import type { Agent } from "../types";

type AgentFormData = Omit<Agent, 'id'>;

type Props = {
    onClose: () => void;
    onSubmit: (agentData: AgentFormData, id?: number) => Promise<void>;
    initialData?: Agent | null;
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
    const submitButtonText = isEditMode ? "Enregistrer" : "Créer l'agent";

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
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="text-secondary" />
                        {formTitle}
                    </h2>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Prénom *</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                                <User size={18} className="text-base-content/50" />
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    className="grow"
                                    required
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Nom *</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                                <User size={18} className="text-base-content/50" />
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    className="grow"
                                    required
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Email</span>
                        </label>
                        <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                            <Mail size={18} className="text-base-content/50" />
                            <input
                                type="email"
                                placeholder="agent@exemple.com"
                                className="grow"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Localisation</span>
                        </label>
                        <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                            <MapPin size={18} className="text-base-content/50" />
                            <input
                                type="text"
                                placeholder="Ville, Quartier"
                                className="grow"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button type="button" className="btn btn-ghost flex-1 hover:bg-base-200" onClick={onClose} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-primary/20" disabled={isSubmitting}>
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
