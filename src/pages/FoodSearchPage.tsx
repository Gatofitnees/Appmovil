import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Filter, Save } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { useFoodSelection } from '@/hooks/useFoodSelection';
import { useFoodSaving } from '@/hooks/useFoodSaving';
import FoodSearchItem from '@/components/nutrition/FoodSearchItem';
import FilterSlidePanel from '@/components/nutrition/FilterSlidePanel';
import FoodSelectionHeader from '@/components/nutrition/FoodSelectionHeader';
import SaveFoodModal from '@/components/nutrition/SaveFoodModal';

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') || undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [macroFilters, setMacroFilters] = useState<any>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const { searchFoods, results, isLoading, error, loadMoreFoods, hasMore } = useFoodSearch();
  const {
    selectedFoods,
    quantities,
    toggleFoodSelection,
    updateQuantity,
    clearSelection,
    isSelected,
    getQuantity,
  } = useFoodSelection();
  const { saveFoods, isSaving } = useFoodSaving(selectedDate);

  useEffect(() => {
    // Hide status bar on mount
    const hideStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.hide();
        } catch (e) {
          console.error('Error hiding status bar:', e);
        }
      }
    };

    hideStatusBar();

    return () => {
      // Show status bar on unmount
      const showStatusBar = async () => {
        if (Capacitor.isNativePlatform()) {
          try {
            await StatusBar.show();
          } catch (e) {
            console.error('Error showing status bar:', e);
          }
        }
      };
      showStatusBar();
    };
  }, []);

  useEffect(() => {
    // Always search - if no query/filters, it will load default foods
    const allFilters = Object.keys(macroFilters).length > 0 || selectedCategories.length > 0 ? { ...macroFilters, categories: selectedCategories } : undefined;
    searchFoods(debouncedQuery, allFilters);
  }, [debouncedQuery, macroFilters, selectedCategories, searchFoods]);

  // Infinite scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Load more when scrolled to bottom (with some buffer)
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading && !debouncedQuery.trim() && Object.keys(macroFilters).length === 0 && selectedCategories.length === 0) {
      loadMoreFoods();
    }
  }, [hasMore, isLoading, loadMoreFoods, debouncedQuery, macroFilters, selectedCategories]);

  const handleSave = async (customName?: string) => {
    const success = await saveFoods(selectedFoods, quantities, customName);
    if (success) {
      clearSelection();
      setShowSaveModal(false);
      navigate('/nutrition');
    }
  };

  const handleSaveClick = () => {
    if (selectedFoods.length === 1) {
      // Auto-save single food
      handleSave();
    } else {
      // Show modal for multiple foods
      setShowSaveModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div
        className="sticky top-0 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/30 border-b z-10 transition-all duration-300"
        style={{ paddingTop: selectedFoods.length > 0 ? 'calc(env(safe-area-inset-top) + 48px)' : 'calc(env(safe-area-inset-top) + 16px)' }}
      >
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Buscar Alimentos</h1>
          {selectedFoods.length > 0 && (
            <Button
              onClick={handleSaveClick}
              size="sm"
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Guardar ({selectedFoods.length})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Selection Header */}
        {selectedFoods.length > 0 && (
          <FoodSelectionHeader
            selectedCount={selectedFoods.length}
            onSave={handleSaveClick}
            onClear={clearSelection}
            isSaving={isSaving}
          />
        )}

        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar alimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterPanelOpen(true)}
              className={Object.keys(macroFilters).length > 0 || selectedCategories.length > 0 ? "border-primary text-primary" : ""}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="p-4">
          {isLoading && results.length === 0 ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">Error</div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : results.length === 0 && (searchQuery.trim() || Object.keys(macroFilters).length > 0 || selectedCategories.length > 0) ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No se encontraron alimentos
              </h3>
              <p className="text-sm text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((food) => (
                <FoodSearchItem
                  key={food.id}
                  food={food}
                  isSelected={isSelected(food.id)}
                  quantity={getQuantity(food.id)}
                  onToggleSelect={() => toggleFoodSelection(food)}
                  onQuantityChange={(quantity) => updateQuantity(food.id, quantity)}
                />
              ))}

              {/* Loading more indicator */}
              {isLoading && results.length > 0 && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Cargando más alimentos...</p>
                </div>
              )}

              {/* End of results indicator */}
              {!hasMore && results.length > 0 && !searchQuery.trim() && Object.keys(macroFilters).length === 0 && selectedCategories.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No hay más alimentos que mostrar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <FilterSlidePanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        selectedCategories={selectedCategories}
        onCategoriesChange={(filters) => {
          const { categories, ...macros } = filters;
          setMacroFilters(macros);
          setSelectedCategories(categories || []);
        }}
      />

      {/* Save Modal */}
      <SaveFoodModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        foods={selectedFoods}
        quantities={quantities}
        isSaving={isSaving}
      />
    </div>
  );
};

export default FoodSearchPage;