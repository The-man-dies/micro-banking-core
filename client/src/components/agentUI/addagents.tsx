import { X } from "lucide-react";
import type React from "react";
import { useEffect } from "react";

type Props = {
    update?: string | null;
    setUpdate: React.Dispatch<React.SetStateAction<string | null>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    nextCode?: number;
};

export default function Addagents({ setUpdate, handleSubmit, nextCode }: Props) {
    // Auto-remplir le champ code avec la suggestion
    useEffect(() => {
        if (nextCode) {
            const codeInput = document.querySelector('input[name="code"]') as HTMLInputElement;
            if (codeInput) {
                codeInput.value = nextCode.toString();
                codeInput.focus();
            }
        }
    }, [nextCode]);

    const handleClose = () => {
        setUpdate(null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-base-300">
                    <h2 className="text-2xl font-bold text-primary">Ajouter un Agent</h2>
                    <button
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={handleClose}
                        type="button"
                        aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Code Agent *</span>
                        </label>
                        <input
                            type="number"
                            name="code"
                            placeholder="Ex: 21"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            min="1"
                            step="1"
                        />
                        {nextCode && (
                            <div className="label-text-alt text-info mt-1">
                                💡 Suggestion: Prochain code disponible: <strong>{nextCode}</strong>
                            </div>
                        )}
                    </div>

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
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Numéro de Téléphone *</span>
                        </label>
                        <input
                            type="tel"
                            name="tel"
                            placeholder="Ex: 70123456"
                            className="input input-bordered w-full focus:input-primary"
                            required
                            pattern="[0-9]{8,}"
                            title="8 chiffres minimum"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Adresse *</span>
                        </label>
                        <input
                            type="text"
                            name="adresse"
                            placeholder="Ex: Bamako, Hamdallaye"
                            className="input input-bordered w-full focus:input-primary"
                            required
                        />
                    </div>

                    <div className="form-control pt-4">
                        <div className="flex gap-3">
                            <button type="button" className="btn btn-ghost flex-1" onClick={handleClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary flex-1">
                                Ajouter l'Agent
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center mt-4">* Champs obligatoires</div>
                </form>
            </div>
        </div>
    );
}
