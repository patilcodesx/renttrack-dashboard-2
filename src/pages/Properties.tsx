import { useEffect, useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { PropertyCard, PropertyCardSkeleton } from '@/components/ui/PropertyCard';
import type { Property } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const amenitiesList = ['pool', 'gym', 'parking', 'security', 'laundry', 'garden', 'doorman'];
const bhkOptions = [1, 2, 3, 4];

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 5000]);
  const [selectedBHK, setSelectedBHK] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await apiClient.getProperties();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query)
      );
    }

    // Budget filter
    filtered = filtered.filter(
      (p) => p.price >= budgetRange[0] && p.price <= budgetRange[1]
    );

    // BHK filter
    if (selectedBHK.length > 0) {
      filtered = filtered.filter((p) => selectedBHK.includes(p.bhk));
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((p) =>
        selectedAmenities.every((a) => p.amenities.includes(a))
      );
    }

    // Availability filter
    if (availability !== 'all') {
      filtered = filtered.filter((p) =>
        availability === 'available' ? p.available : !p.available
      );
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, budgetRange, selectedBHK, selectedAmenities, availability]);

  const toggleBHK = (bhk: number) => {
    setSelectedBHK((prev) =>
      prev.includes(bhk) ? prev.filter((b) => b !== bhk) : [...prev, bhk]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setBudgetRange([0, 5000]);
    setSelectedBHK([]);
    setSelectedAmenities([]);
    setAvailability('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    budgetRange[0] > 0 ||
    budgetRange[1] < 5000 ||
    selectedBHK.length > 0 ||
    selectedAmenities.length > 0 ||
    availability !== 'all';

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Budget Range */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Budget</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={budgetRange[1]}
            onChange={(e) => setBudgetRange([budgetRange[0], Number(e.target.value)])}
            className="w-full accent-primary"
            aria-label="Maximum budget"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${budgetRange[0]}</span>
            <span>${budgetRange[1]}</span>
          </div>
        </div>
      </div>

      {/* BHK */}
      <div>
        <h3 className="font-medium text-foreground mb-3">BHK</h3>
        <div className="flex flex-wrap gap-2">
          {bhkOptions.map((bhk) => (
            <button
              key={bhk}
              onClick={() => toggleBHK(bhk)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selectedBHK.includes(bhk)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {bhk} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenitiesList.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm capitalize text-foreground">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Availability</h3>
        <div className="relative">
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as typeof availability)}
            className="input-field appearance-none pr-10"
            aria-label="Filter by availability"
          >
            <option value="all">All Properties</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="btn-ghost w-full text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} properties found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full sm:w-64"
            aria-label="Search properties"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-outline lg:hidden',
              hasActiveFilters && 'border-primary text-primary'
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {selectedBHK.length + selectedAmenities.length + (availability !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filters modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card p-4 animate-slide-in-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-ghost p-2"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary w-full mt-6"
              >
                Show {filteredProperties.length} Results
              </button>
            </div>
          </div>
        )}

        {/* Property grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-lg font-medium text-foreground">No properties found</p>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary mt-4">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
