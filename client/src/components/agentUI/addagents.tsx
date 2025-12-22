import { X } from "lucide-react";
import type React from "react";

type Props = {
    update?: string | null;
    setUpdate: React.Dispatch<React.SetStateAction<string | null>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function Addagents({ setUpdate, handleSubmit }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 w-full max-w-md mx-4 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Ajouter un Agent</h2>
                    <button className="btn btn-circle btn-ghost btn-sm" onClick={() => setUpdate(null)}>
                        {" "}
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Code Agent</span>
                        </label>
                        <input
                            type="number"
                            name="code"
                            placeholder="Entrez le code"
                            className="input input-bordered input-primary w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Nom et Prénom</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Entrez le nom et prénom"
                            className="input input-bordered input-primary w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Numéro de Téléphone</span>
                        </label>
                        <input
                            type="number"
                            name="tel"
                            placeholder="Entrez le numéro"
                            className="input input-bordered input-primary w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Adresse</span>
                        </label>
                        <input
                            type="text"
                            name="adresse"
                            placeholder="Entrez l'adresse"
                            className="input input-bordered input-primary w-full"
                            required
                        />
                    </div>

                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary w-full">
                            Ajouter l'Agent
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
