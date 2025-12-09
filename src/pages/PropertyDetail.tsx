import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Maximize, Check, Phone, Mail } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import type { Property } from '@/lib/mockData';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const data = await apiClient.getProperty(id);
        setProperty(data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-32"></div>
        <div className="skeleton h-96 rounded-lg"></div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-8 w-3/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
            <div className="skeleton h-24 w-full"></div>
          </div>
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="animate-fade-in text-center py-12">
        <h1 className="text-2xl font-bold text-foreground">Property Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The property you're looking for doesn't exist.
        </p>
        <Link to="/properties" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Link>

      {/* Hero image */}
      <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="badge badge-info capitalize">{property.type}</span>
          {property.available ? (
            <span className="badge badge-success">Available</span>
          ) : (
            <span className="badge badge-muted">Occupied</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
            <p className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}
            </p>
          </div>

          {/* Features */}
          <div className="flex items-center gap-6 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              {property.bhk} BHK
            </span>
            <span className="flex items-center gap-2">
              <Maximize className="h-5 w-5" />
              {property.sqft} sqft
            </span>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 rounded-lg bg-muted p-3"
                >
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm capitalize text-foreground">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="mt-6 space-y-3">
              <button className="btn-primary w-full">
                <Phone className="h-4 w-4" />
                Contact Owner
              </button>
              <button className="btn-outline w-full">
                <Mail className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Quick Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{property.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{property.sqft} sqft</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Bedrooms</dt>
                <dd className="font-medium">{property.bhk}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">
                  {property.available ? 'Available' : 'Occupied'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
