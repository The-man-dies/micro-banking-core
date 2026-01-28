import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { type Client } from "../types";
import api from "../../../services/api-client";
import type { Agent } from "../../agents/types";

// Define the type for the data submitted by the form for creation
export type ClientFormData = Omit<Client, 'id' | 'accountBalance' | 'accountExpiresAt' | 'status'>;

type Props = {
    onClose: () => void;
    onSubmit: (clientData: ClientFormData, id?: number) => Promise<void>;
    initialData?: Client | null; // Optional prop for editing existing clients
};

export default function ClientForm({ onClose, onSubmit, initialData }: Props) {
    const [firstname, setFirstname] = useState(initialData?.firstname || "");
    const [lastname, setLastname] = useState(initialData?.lastname || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [agentId, setAgentId] = useState(initialData?.agentId || 1); // Default to agentId 1 for now
    const [montantEngagement, setMontantEngagement] = useState<number>(initialData?.montantEngagement || 0);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agentSearch, setAgentSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasAgents = agents.length > 0;

    const isEditMode = !!initialData;
    const formTitle = isEditMode ? "Modifier Client" : "Ajouter un Client";
    const submitButtonText = isEditMode ? "Enregistrer les modifications" : "Ajouter le Client";

    useEffect(() => {
        if (initialData) {
            setFirstname(initialData.firstname);
            setLastname(initialData.lastname);
            setPhone(initialData.phone);
            setEmail(initialData.email ?? "");
            setLocation(initialData.location);
            setAgentId(initialData.agentId);
            setMontantEngagement(initialData.montantEngagement);
        }
    }, [initialData]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await api<{ data: Agent[] }>("/agents");
                const list = response.data.data;
                setAgents(list);
                if (!initialData && list.length > 0) {
                    setAgentId(prev => prev || Number(list[0].id));
                }
            } catch {
                setAgents([]);
            }
        };

        fetchAgents();
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const clientData: ClientFormData = {
            firstname,
            lastname,
            email: email.trim() ? email.trim() : undefined,
            phone,
            location,
            agentId,
            montantEngagement,
        };

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-base-100 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
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

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {error && (
                            <div className="bg-red-500 text-white p-3 rounded-lg text-sm md:col-span-2">
                                {error}
                            </div>
                        )}

                        {!hasAgents && (
                            <div className="bg-amber-500/20 text-amber-200 p-3 rounded-lg text-sm border border-amber-500/30 md:col-span-2">
                                Vous devez créer au moins un agent avant de pouvoir créer un client.
                            </div>
                        )}

                        {isEditMode && (
                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold">ID Client</span>
                                </label>
                                <input
                                    type="text"
                                    value={initialData?.id || ''}
                                    title="ID Client"
                                    className="input input-bordered w-full bg-gray-200"
                                    readOnly
                                />
                            </div>
                        )}

                        <div className="divider md:col-span-2">Informations client</div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Prenom *</span>
                            </label>
                            <input
                                type="text"
                                name="firstname"
                                placeholder="Ex: John"
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
                                placeholder="Ex: Doe"
                                className="input input-bordered w-full focus:input-primary"
                                required
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Numéro de Téléphone *</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Ex: +223 78 33 44 33"
                                className="input input-bordered w-full focus:input-primary"
                                required
                                title="8 chiffres minimum"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="prenom.nom@gmail.com"
                                className="input input-bordered w-full focus:input-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text font-semibold">Adresse *</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Ex: Bamako, Magnambougou"
                                className="input input-bordered w-full focus:input-primary"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="divider md:col-span-2">Agent & engagement</div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Montant d'engagement (FCFA) *</span>
                            </label>
                            <input
                                type="number"
                                name="montantEngagement"
                                placeholder="Ex: 5000"
                                className="input input-bordered w-full focus:input-primary"
                                required
                                min={1}
                                value={montantEngagement}
                                onChange={(e) => setMontantEngagement(Number(e.target.value))}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Agent *</span>
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    name="agentSearch"
                                    placeholder="Recherche : nom, email, localisation ou ID"
                                    className="input input-bordered w-full focus:input-primary"
                                    value={agentSearch}
                                    onChange={(e) => setAgentSearch(e.target.value)}
                                    disabled={!hasAgents}
                                    title="Rechercher un agent"
                                />
                                <select
                                    name="agentId"
                                    title="Agent"
                                    className="select select-bordered w-full"
                                    required
                                    value={agentId}
                                    onChange={(e) => setAgentId(Number(e.target.value))}
                                    disabled={!hasAgents}
                                >
                                    {!hasAgents ? (
                                        <option value={"" as any}>Aucun agent disponible</option>
                                    ) : (
                                        agents
                                            .filter((a) => {
                                                const term = agentSearch.trim().toLowerCase();
                                                if (!term) return true;
                                                const haystack = [
                                                    a.id?.toString?.() ?? String(a.id),
                                                    a.firstname,
                                                    a.lastname,
                                                    a.email ?? "",
                                                    a.location ?? "",
                                                ]
                                                    .join(" ")
                                                    .toLowerCase();
                                                return haystack.includes(term);
                                            })
                                            .map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.firstname} {a.lastname}
                                                    {a.email ? ` • ${a.email}` : ""}
                                                    {a.location ? ` • ${a.location}` : ""}
                                                    {` • #${a.id}`}
                                                </option>
                                            ))
                                    )}
                                </select>

                            </div>
                        </div>

                        <div className="form-control pt-2 md:col-span-2">
                            <div className="flex gap-3">
                                <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting || !hasAgents}>
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

                        <div className="text-xs text-slate-500 text-center mt-2 md:col-span-2">* Champs obligatoires</div>
                    </div>
                </form>
            </div>
        </div>
    );
}