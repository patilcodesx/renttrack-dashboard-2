import { Link } from 'react-router-dom';
import { MapPin, Bed, Maximize, Check } from 'lucide-react';
import type { Property } from '@/lib/mockData';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="property-card group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="badge badge-info capitalize">{property.type}</span>
          {property.available ? (
            <span className="badge badge-success">Available</span>
          ) : (
            <span className="badge badge-muted">Occupied</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">
            {property.title}
          </h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {property.city}
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bhk} BHK
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {property.sqft} sqft
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground"
            >
              <Check className="h-3 w-3 text-primary" />
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-lg font-bold text-primary">
              ${property.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/properties/${property.id}`}
              className="btn-outline px-3 py-1.5 text-sm"
            >
              View
            </Link>
            <button className="btn-primary px-3 py-1.5 text-sm">
              Contact
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="property-card">
      <div className="skeleton aspect-[4/3]"></div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="skeleton h-5 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
        <div className="flex gap-4">
          <div className="skeleton h-4 w-16"></div>
          <div className="skeleton h-4 w-20"></div>
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full"></div>
          <div className="skeleton h-6 w-16 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="skeleton h-6 w-24"></div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-16 rounded-lg"></div>
            <div className="skeleton h-8 w-20 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
