// components/clientpagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const ClientPagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPrevPage,
  onNextPage
}: ClientPaginationProps) => {
  
  // Générer les numéros de page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Affichage de <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> 
        sur <span className="font-semibold">{totalItems}</span> clients
      </div>
      
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentPage === 1
              ? "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          <ChevronLeft size={16} />
          Précédent
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {page}
            </button>
          ))}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="text-slate-400 px-1">...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentPage === totalPages
              ? "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
              : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Sélecteur de page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Page</span>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-600 dark:text-slate-400">sur {totalPages}</span>
      </div>
    </div>
  );
};

export default ClientPagination;