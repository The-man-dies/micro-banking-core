import { useEffect, useState } from "react";
import { api } from "../../../services/api-client";

interface AdminProfile {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}

const formatUnixTimestamp = (value?: number) => {
  if (!value) return "N/A";
  return new Date(value * 1000).toLocaleString();
};

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api<AdminProfile>("/admin/profile", {
          method: "GET",
        });
        setProfile(response);
      } catch (err: any) {
        setError(
          err?.message || "Impossible de charger le profil administrateur.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-4">
        Profil Administrateur
      </h1>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        {isLoading && (
          <p className="text-gray-300">
            Chargement du profil administrateur...
          </p>
        )}

        {!isLoading && error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && profile && (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">ID</p>
              <p className="text-lg font-semibold text-white">{profile.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Nom d'utilisateur</p>
              <p className="text-lg font-semibold text-white">
                {profile.username}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Token émis à</p>
              <p className="text-base text-gray-200">
                {formatUnixTimestamp(profile.iat)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Token expire à</p>
              <p className="text-base text-gray-200">
                {formatUnixTimestamp(profile.exp)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
