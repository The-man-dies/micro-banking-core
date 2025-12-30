// components/clientformmodal.tsx
import { XCircle, User, CreditCard, DollarSign, AlertCircle, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import type { Client, ClientFormData } from "./types";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: ClientFormData) => void;
  initialData?: Client | null;
  mode: "create" | "edit";
}

const ClientFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: ClientFormModalProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    numero_carnet: "",
    somme_actuelle: 0,
    seuil: 1000,
    status: "actif",
    email: "",
    telephone: "",
    adresse: "",
    date_inscription: new Date().toISOString().split("T")[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire avec les données existantes en mode édition
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        nom: initialData.nom,
        prenom: initialData.prenom,
        numero_carnet: initialData.numero_carnet,
        somme_actuelle: initialData.somme_actuelle,
        seuil: initialData.seuil,
        status: initialData.status,
        email: initialData.email || "",
        telephone: initialData.telephone || "",
        adresse: initialData.adresse || "",
        date_inscription: initialData.date_inscription || new Date().toISOString().split("T")[0]
      });
    } else if (mode === "create") {
      // Générer un numéro de carnet unique pour la création
      const generateCarnetNumber = () => {
        const prefix = "CAR";
        const randomNum = Math.floor(100 + Math.random() * 900);
        return `${prefix}${randomNum}`;
      };

      setFormData({
        nom: "",
        prenom: "",
        numero_carnet: generateCarnetNumber(),
        somme_actuelle: 0,
        seuil: 1000,
        status: "actif",
        email: "",
        telephone: "",
        adresse: "",
        date_inscription: new Date().toISOString().split("T")[0]
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.numero_carnet.trim()) newErrors.numero_carnet = "Le numéro de carnet est requis";
    if (formData.somme_actuelle < 0) newErrors.somme_actuelle = "Le solde ne peut pas être négatif";
    if (formData.seuil <= 0) newErrors.seuil = "Le seuil doit être supérieur à 0";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (formData.telephone && !/^[0-9\s\-\(\)\+]{10,}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = "Numéro de téléphone invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  // Gestion des changements
  const handleChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const modalTitle = mode === "create" ? "Créer un Nouveau Client" : "Modifier le Client";
  const submitButtonText = mode === "create" ? "Créer le Client" : "Enregistrer les Modifications";

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{modalTitle}</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User size={18} />
              Informations Personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.nom ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="Dupont"
                />
                {errors.nom && <p className="mt-1 text-sm text-rose-600">{errors.nom}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.prenom ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="Jean"
                />
                {errors.prenom && <p className="mt-1 text-sm text-rose-600">{errors.prenom}</p>}
              </div>
            </div>
          </div>

          {/* Informations bancaires */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard size={18} />
              Informations Bancaires
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Numéro Carnet *
                </label>
                <input
                  type="text"
                  value={formData.numero_carnet}
                  onChange={(e) => handleChange("numero_carnet", e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.numero_carnet ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="CAR001"
                  readOnly={mode === "edit"}
                />
                {errors.numero_carnet && <p className="mt-1 text-sm text-rose-600">{errors.numero_carnet}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as "actif" | "inactif")}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Solde et seuil */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Solde et Seuil
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Solde Actuel (€) *
                </label>
                <input
                  type="number"
                  value={formData.somme_actuelle}
                  onChange={(e) => handleChange("somme_actuelle", parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.somme_actuelle ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.somme_actuelle && <p className="mt-1 text-sm text-rose-600">{errors.somme_actuelle}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Seuil Maximum (€) *
                </label>
                <input
                  type="number"
                  value={formData.seuil}
                  onChange={(e) => handleChange("seuil", parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.seuil ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  min="1"
                  step="0.01"
                />
                {errors.seuil && <p className="mt-1 text-sm text-rose-600">{errors.seuil}</p>}
              </div>
            </div>
            
            {/* Avertissement si solde >= seuil */}
            {formData.somme_actuelle >= formData.seuil && (
              <div className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle size={16} />
                <span>Attention : Le seuil est atteint ou dépassé</span>
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Mail size={18} />
              Contact
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.email ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                  placeholder="client@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                    <Phone size={14} />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.telephone ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                    placeholder="0612345678"
                  />
                  {errors.telephone && <p className="mt-1 text-sm text-rose-600">{errors.telephone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                    <Calendar size={14} />
                    Date d'inscription
                  </label>
                  <input
                    type="date"
                    value={formData.date_inscription}
                    onChange={(e) => handleChange("date_inscription", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <MapPin size={14} />
                  Adresse
                </label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12 Rue de Paris, 75001 Paris"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;