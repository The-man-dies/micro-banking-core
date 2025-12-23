import { X } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";

type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};

type Props = {
    setModify: React.Dispatch<React.SetStateAction<string | null>>;
    agent: agentType;
    agents: agentType[];
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>;
};

export default function UpdateAgents({ setModify, agent, agents, setAgents }: Props) {
    // Initialiser les états avec les valeurs de l'agent
    const [name, setName] = useState<string>("");
    const [adress, setAdress] = useState<string>("");
    const [tel, setTel] = useState<string>("");
    const [codeAgent, setCodeAgent] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<{
        name?: string;
        tel?: string;
        adress?: string;
        code?: string;
    }>({});

    // Mettre à jour les états quand l'agent change
    useEffect(() => {
        if (agent) {
            setName(agent.nom_prenom);
            setAdress(agent.adresse);
            setTel(agent.telephone.toString());
            setCodeAgent(agent.code_agents);
            setErrors({});
        }
    }, [agent]);

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        // Validation du code
        if (!codeAgent || codeAgent <= 0) {
            newErrors.code = "Le code agent doit être un nombre positif";
        }

        // Validation du nom
        if (!name.trim()) {
            newErrors.name = "Le nom est obligatoire";
        } else if (name.trim().length < 3) {
            newErrors.name = "Le nom doit contenir au moins 3 caractères";
        }

        // Validation du téléphone
        if (!tel.trim()) {
            newErrors.tel = "Le téléphone est obligatoire";
        } else if (!/^\d{8,}$/.test(tel.trim())) {
            newErrors.tel = "Le téléphone doit contenir au moins 8 chiffres";
        } else {
            const telNumber = parseInt(tel.trim());
            // Vérifier si le téléphone existe déjà (sauf pour l'agent actuel)
            const phoneExists = agents.some(a => a.telephone === telNumber && a.code_agents !== agent.code_agents);
            if (phoneExists) {
                newErrors.tel = "Ce numéro de téléphone est déjà utilisé";
            }
        }

        // Validation de l'adresse
        if (!adress.trim()) {
            newErrors.adress = "L'adresse est obligatoire";
        } else if (adress.trim().length < 5) {
            newErrors.adress = "L'adresse doit contenir au moins 5 caractères";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const ModifyAgents = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedAgent = {
                code_agents: codeAgent,
                nom_prenom: name.trim(),
                telephone: parseInt(tel.trim()),
                adresse: adress.trim(),
            };

            if (setAgents) {
                // Créer une nouvelle liste avec l'agent modifié
                const updatedAgents = agents.map(a => (a.code_agents === agent.code_agents ? updatedAgent : a));

                // Trier par code pour maintenir l'ordre
                updatedAgents.sort((a, b) => a.code_agents - b.code_agents);
                setAgents(updatedAgents);

                console.log("Agent modifié avec succès:", updatedAgent);
            }

            setModify(null);
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            alert("Une erreur est survenue lors de la modification");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setModify(null);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            // Vérifier si le code existe déjà (sauf pour l'agent actuel)
            const codeExists = agents.some(a => a.code_agents === value && a.code_agents !== agent.code_agents);

            if (codeExists) {
                setErrors(prev => ({
                    ...prev,
                    code: `Le code ${value} est déjà utilisé par un autre agent`,
                }));
            } else {
                setErrors(prev => ({ ...prev, code: undefined }));
            }

            setCodeAgent(value);
        }
    };

    const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // N'autoriser que les chiffres
        if (/^\d*$/.test(value)) {
            setTel(value);
            // Effacer l'erreur quand l'utilisateur commence à taper
            if (value.length >= 8) {
                setErrors(prev => ({ ...prev, tel: undefined }));
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Modifier l'Agent</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Code original: <span className="font-semibold">{agent.code_agents}</span>
                        </p>
                    </div>
                    <button
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={handleClose}
                        type="button"
                        aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-6 space-y-5" onSubmit={ModifyAgents}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Code Agent *</span>
                        </label>
                        <input
                            type="number"
                            value={codeAgent}
                            onChange={handleCodeChange}
                            placeholder="Entrez le code"
                            className={`input input-bordered w-full ${
                                errors.code ? "input-error" : "focus:input-primary"
                            }`}
                            required
                            min="1"
                            disabled={isSubmitting}
                        />
                        {errors.code && <div className="label-text-alt text-error mt-1">⚠️ {errors.code}</div>}
                        <div className="label-text-alt text-info mt-1">
                            ℹ️ Le code doit être unique parmi tous les agents
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Nom et Prénom *</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (e.target.value.trim().length >= 3) {
                                    setErrors(prev => ({ ...prev, name: undefined }));
                                }
                            }}
                            placeholder="Entrez le nom et prénom"
                            className={`input input-bordered w-full ${
                                errors.name ? "input-error" : "focus:input-primary"
                            }`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.name && <div className="label-text-alt text-error mt-1">⚠️ {errors.name}</div>}
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Téléphone *</span>
                        </label>
                        <input
                            type="tel"
                            value={tel}
                            onChange={handleTelChange}
                            placeholder="Ex: 70123456"
                            className={`input input-bordered w-full ${
                                errors.tel ? "input-error" : "focus:input-primary"
                            }`}
                            required
                            disabled={isSubmitting}
                            maxLength={15}
                        />
                        {errors.tel && <div className="label-text-alt text-error mt-1">⚠️ {errors.tel}</div>}
                        <div className="label-text-alt text-slate-500 mt-1">Format: 8 chiffres minimum</div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Adresse *</span>
                        </label>
                        <input
                            type="text"
                            value={adress}
                            onChange={e => {
                                setAdress(e.target.value);
                                if (e.target.value.trim().length >= 5) {
                                    setErrors(prev => ({ ...prev, adress: undefined }));
                                }
                            }}
                            placeholder="Entrez l'adresse complète"
                            className={`input input-bordered w-full ${
                                errors.adress ? "input-error" : "focus:input-primary"
                            }`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.adress && <div className="label-text-alt text-error mt-1">⚠️ {errors.adress}</div>}
                    </div>

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="btn btn-ghost flex-1"
                                onClick={handleClose}
                                disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <span className="loading loading-spinner loading-sm mr-2"></span>
                                        Modification...
                                    </span>
                                ) : (
                                    "Modifier l'Agent"
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
