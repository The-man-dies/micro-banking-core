import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { type Client } from "../types";
import api from "../../../services/api-client";
import type { Agent } from "../../agents/types";

// Define the type for the data submitted by the form for creation
export type ClientFormData = Omit<Client, 'id' | 'accountBalance' | 'accountExpiresAt' | 'status'>;

type Props = {
    onClose: () => void;
    onSubmit: (clientData: ClientFormData, id?: number) => Promise<void>;
    initialData?: Client | null;
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

export default function ClientForm({ onClose, onSubmit, initialData }: Props) {
    // Form States
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [agentId, setAgentId] = useState<number | string>("");

    // CHANGED: State is now string to handle text input formatting
    const [montantEngagement, setMontantEngagement] = useState<string>("");

    // Data & UI States
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agentSearch, setAgentSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasAgents = agents.length > 0;
    const isEditMode = !!initialData;
    const formTitle = isEditMode ? "Modifier Client" : "Ajouter un Client";
    const submitButtonText = isEditMode ? "Enregistrer" : "Ajouter le Client";

    // Initialize Form Data
    useEffect(() => {
        if (initialData) {
            setFirstname(initialData.firstname);
            setLastname(initialData.lastname);
            setPhone(initialData.phone);
            setEmail(initialData.email ?? "");
            setLocation(initialData.location);
            setAgentId(initialData.agentId);
            // Format initial number to string with spaces
            setMontantEngagement(formatCurrencyInput(initialData.montantEngagement));
        }
    }, [initialData]);

    // Fetch Agents
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await api<{ data: Agent[] }>("/agents");
                const list = response.data.data || [];
                setAgents(list);

                // Auto-select first agent if creating new client and no agent selected
                if (!initialData && list.length > 0) {
                    setAgentId(Number(list[0].id));
                }
            } catch (err) {
                console.error("Failed to fetch agents", err);
                setAgents([]);
            }
        };
        fetchAgents();
    }, []); // Changed from [initialData] to [] to ensure fetch on mount/open

    // Optimized Agent Filtering (Performance improvement)
    const filteredAgents = useMemo(() => {
        const term = agentSearch.trim().toLowerCase();
        if (!term) return agents;

        return agents.filter((a) => {
            const haystack = [
                a.id?.toString() ?? "",
                a.firstname,
                a.lastname,
                a.email ?? "",
                a.location ?? "",
            ].join(" ").toLowerCase();
            return haystack.includes(term);
        });
    }, [agents, agentSearch]);

    const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Formats input value on the fly (1000 -> 1 000)
        setMontantEngagement(formatCurrencyInput(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // NORMALIZE: Convert formatted string "10 000" back to number 10000
        const normalizedAmount = normalizeCurrencyInput(montantEngagement);

        const clientData: ClientFormData = {
            firstname,
            lastname,
            email: email.trim() ? email.trim() : undefined,
            phone,
            location,
            agentId: Number(agentId),
            montantEngagement: normalizedAmount, // Sending clean number to backend
        };

        try {
            if (isEditMode && initialData?.id) {
                await onSubmit(clientData, initialData.id);
            } else {
                await onSubmit(clientData);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-base-100 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-2xl font-bold text-primary">{formTitle}</h2>
                    <button
                        className="btn btn-circle btn-ghost btn-sm hover:bg-base-200 transition-colors"
                        onClick={onClose}
                        type="button"
                        aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {error && (
                            <div role="alert" className="alert alert-error md:col-span-2 shadow-sm text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!hasAgents && (
                            <div role="alert" className="alert alert-warning md:col-span-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span>Attention : Aucun agent disponible. Veuillez en créer un avant de continuer.</span>
                            </div>
                        )}

                        {isEditMode && (
                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold text-base-content/70">ID Client</span>
                                </label>
                                <input
                                    type="text"
                                    value={initialData?.id || ''}
                                    className="input input-bordered w-full bg-base-200 text-base-content/50 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        )}

                        <div className="divider md:col-span-2 text-primary/80 font-medium">Informations personnelles</div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Prénom *</span>
                            </label>
                            <input
                                type="text"
                                name="firstname"
                                placeholder="Ex: Moussa"
                                className="input input-bordered w-full focus:input-primary transition-all"
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
                                placeholder="Ex: Diarra"
                                className="input input-bordered w-full focus:input-primary transition-all"
                                required
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Téléphone *</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Ex: 78 33 44 33"
                                className="input input-bordered w-full focus:input-primary transition-all"
                                required
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
                                placeholder="client@exemple.com"
                                className="input input-bordered w-full focus:input-primary transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text font-semibold">Adresse Complète *</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Ex: Bamako, Commune VI, Magnambougou"
                                className="input input-bordered w-full focus:input-primary transition-all"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="divider md:col-span-2 text-primary/80 font-medium">Contrat & Affectation</div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Montant d'engagement (FCFA) *</span>
                            </label>
                            {/* 
                                CHANGED: Input type text for formatting. 
                                Value is normalized before submit in handleSubmit 
                            */}
                            <input
                                type="text"
                                name="montantEngagement"
                                placeholder="Ex: 5 000"
                                className="input input-bordered w-full focus:input-primary font-mono text-lg"
                                required
                                value={montantEngagement}
                                onChange={handleMontantChange}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Agent Responsable *</span>
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="🔍 Filtrer agent..."
                                    className="input input-bordered input-sm w-full focus:input-primary"
                                    value={agentSearch}
                                    onChange={(e) => setAgentSearch(e.target.value)}
                                    disabled={!hasAgents}
                                />
                                <select
                                    name="agentId"
                                    className="select select-bordered w-full"
                                    required
                                    value={agentId}
                                    onChange={(e) => setAgentId(Number(e.target.value))}
                                    disabled={!hasAgents}
                                >
                                    {!hasAgents ? (
                                        <option value="">Aucun agent disponible</option>
                                    ) : (
                                        filteredAgents.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.firstname} {a.lastname} (#{a.id})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-control pt-4 md:col-span-2 mt-4">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className="btn btn-ghost flex-1 hover:bg-base-200"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                                    disabled={isSubmitting || !hasAgents}
                                >
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

                        <div className="text-xs text-base-content/40 text-center mt-2 md:col-span-2">
                            * Les champs marqués sont obligatoires
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}