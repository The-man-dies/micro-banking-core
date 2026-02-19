import { useComptabilite } from "../hooks/useComptabilite";
import { TransactionTimeSeriesChart } from "../../dashboard/components/Charts"; // Import TransactionTimeSeriesChart
import { ErrorComponent } from "@/components/ui/Error";

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

const ComptabilitePage = () => {
  const { accountingData, isLoading, error } = useComptabilite();

  const formatToXOF = (value?: number) => `${value ?? 0} FCFA`;

  if (isLoading) {
    return (
      <div className="text-center py-10 text-white">
        Chargement des données comptables...
      </div>
    );
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  // Calculate totals for the StatCards
  const totalDepositsAmount =
    accountingData?.deposits?.reduce(
      (sum: number, item: { totalAmount: number }) => sum + item.totalAmount,
      0,
    ) || 0;
  const totalDepositsCount =
    accountingData?.deposits?.reduce(
      (sum: number, item: { transactionCount: number }) =>
        sum + item.transactionCount,
      0,
    ) || 0;
  const totalPayoutsAmount =
    accountingData?.payouts?.reduce(
      (sum: number, item: { totalAmount: number }) => sum + item.totalAmount,
      0,
    ) || 0;
  const totalPayoutsCount =
    accountingData?.payouts?.reduce(
      (sum: number, item: { transactionCount: number }) =>
        sum + item.transactionCount,
      0,
    ) || 0;
  const totalInscriptionFeesAmount =
    accountingData?.inscriptionFees?.reduce(
      (sum: number, item: { totalAmount: number }) => sum + item.totalAmount,
      0,
    ) || 0;
  const totalInscriptionFeesCount =
    accountingData?.inscriptionFees?.reduce(
      (sum: number, item: { transactionCount: number }) =>
        sum + item.transactionCount,
      0,
    ) || 0;
  const totalReactivationFeesAmount =
    accountingData?.reactivationFees?.reduce(
      (sum: number, item: { totalAmount: number }) => sum + item.totalAmount,
      0,
    ) || 0;
  const totalReactivationFeesCount =
    accountingData?.reactivationFees?.reduce(
      (sum: number, item: { transactionCount: number }) =>
        sum + item.transactionCount,
      0,
    ) || 0;

  const totalRevenueAmount =
    totalInscriptionFeesAmount + totalReactivationFeesAmount;
  const totalRevenueCount =
    totalInscriptionFeesCount + totalReactivationFeesCount;

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Rapport de Comptabilité (30 derniers jours)
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Aperçu financier des 30 derniers jours
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Dépôts (Montant)"
            value={formatToXOF(totalDepositsAmount)}
            description={`Nombre de dépôts: ${totalDepositsCount}`}
          />
          <StatCard
            title="Total Retraits (Montant)"
            value={formatToXOF(totalPayoutsAmount)}
            description={`Nombre de retraits: ${totalPayoutsCount}`}
          />
          <StatCard
            title="Total Revenus (Montant)"
            value={formatToXOF(totalRevenueAmount)}
            description={`Nombre de transactions: ${totalRevenueCount}`}
          />
          <StatCard
            title="Frais Inscription (Montant)"
            value={formatToXOF(totalInscriptionFeesAmount)}
            description={`Nombre d'inscriptions: ${totalInscriptionFeesCount}`}
          />
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionTimeSeriesChart
            data={accountingData?.deposits}
            title="Évolution des Dépôts"
          />
          <TransactionTimeSeriesChart
            data={accountingData?.payouts}
            title="Évolution des Retraits"
          />
          <TransactionTimeSeriesChart
            data={accountingData?.inscriptionFees}
            title="Évolution des Frais d'Inscription"
          />
          <TransactionTimeSeriesChart
            data={accountingData?.reactivationFees}
            title="Évolution des Frais de Réactivation"
          />
        </div>
      </div>
    </div>
  );
};

export default ComptabilitePage;
