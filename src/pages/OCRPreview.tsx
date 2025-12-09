import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, FileText, Edit2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { InputField } from '@/components/ui/InputField';
import { toast } from '@/components/ui/AppToast';
import type { Upload, ParsedOCRData } from '@/lib/mockData';
import { cn } from '@/lib/utils';

type FieldKey = keyof ParsedOCRData;

const fieldLabels: Record<FieldKey, string> = {
  name: 'Full Name',
  phone: 'Phone Number',
  email: 'Email Address',
  govtId: 'Government ID',
  address: 'Address',
  rent_amount: 'Monthly Rent',
  lease_start: 'Lease Start Date',
  lease_end: 'Lease End Date',
};

const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
};

const confidenceStyles = {
  high: 'confidence-high',
  medium: 'confidence-medium',
  low: 'confidence-low',
};

const confidenceLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function OCRPreview() {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  const [upload, setUpload] = useState<Upload | null>(null);
  const [formData, setFormData] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [manualReview, setManualReview] = useState<Set<FieldKey>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUpload = async () => {
      if (!uploadId) return;

      try {
        const data = await apiClient.getUploadParsed(uploadId);
        setUpload(data);

        if (data?.parsedJson) {
          const initial: Record<FieldKey, string> = {} as Record<FieldKey, string>;
          for (const key of Object.keys(data.parsedJson) as FieldKey[]) {
            initial[key] = data.parsedJson[key].value;
          }
          setFormData(initial);

          // Auto-mark low confidence fields for review
          const lowConfidence = new Set<FieldKey>();
          for (const key of Object.keys(data.parsedJson) as FieldKey[]) {
            if (data.parsedJson[key].confidence < 0.7) {
              lowConfidence.add(key);
            }
          }
          setManualReview(lowConfidence);
        }
      } catch (error) {
        console.error('Failed to fetch upload:', error);
        toast.error('Upload not found', 'The requested document could not be found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpload();
  }, [uploadId]);

  const handleFieldChange = (field: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleManualReview = (field: FieldKey) => {
    setManualReview((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const acceptAllHighConfidence = () => {
    if (!upload?.parsedJson) return;

    const toReview = new Set<FieldKey>();
    for (const key of Object.keys(upload.parsedJson) as FieldKey[]) {
      if (upload.parsedJson[key].confidence < 0.85) {
        toReview.add(key);
      }
    }
    setManualReview(toReview);
    toast.success('High confidence fields accepted', 'Low and medium confidence fields marked for review.');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const tenant = await apiClient.createTenant({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        govtId: formData.govtId,
        address: formData.address,
        rentAmount: Number(formData.rent_amount) || 0,
        leaseStart: formData.lease_start,
        leaseEnd: formData.lease_end,
        propertyId: 'prop-1',
        propertyName: 'Sunset View Apartment',
      });

      toast.success('Tenant created successfully!', `${formData.name} has been added.`);
      navigate(`/tenants/${tenant.id}`);
    } catch (error) {
      toast.error('Failed to create tenant', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton h-96 rounded-lg"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!upload || !upload.parsedJson) {
    return (
      <div className="animate-fade-in text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">Upload Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The requested document could not be found or is still processing.
        </p>
        <Link to="/upload" className="btn-primary mt-4 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </Link>
          <h1 className="text-2xl font-bold text-foreground">OCR Preview</h1>
          <p className="text-muted-foreground">Review and edit extracted data</p>
        </div>
        <button onClick={acceptAllHighConfidence} className="btn-outline">
          <Check className="h-4 w-4" />
          Accept All High Confidence
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File preview */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Preview
          </h2>
          {upload.previewUrl ? (
            <img
              src={upload.previewUrl}
              alt="Document preview"
              className="w-full rounded-lg border border-border"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-2">{upload.filename}</p>
              </div>
            </div>
          )}
        </div>

        {/* Parsed fields */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Extracted Data</h2>
          
          {(Object.keys(upload.parsedJson) as FieldKey[]).map((field) => {
            const { value, confidence } = upload.parsedJson![field];
            const level = getConfidenceLevel(confidence);
            const isMarkedForReview = manualReview.has(field);

            return (
              <div
                key={field}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  isMarkedForReview ? 'border-warning/50 bg-warning/5' : 'border-border bg-card'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    {fieldLabels[field]}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={cn('badge text-xs', confidenceStyles[level])}>
                      {confidenceLabels[level]} ({Math.round(confidence * 100)}%)
                    </span>
                    <button
                      onClick={() => toggleManualReview(field)}
                      className={cn(
                        'p-1 rounded transition-colors',
                        isMarkedForReview
                          ? 'text-warning hover:text-warning/80'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      aria-label={isMarkedForReview ? 'Remove from review' : 'Mark for review'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <input
                  type={field.includes('date') ? 'date' : field === 'rent_amount' ? 'number' : 'text'}
                  value={formData[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="input-field"
                  aria-label={fieldLabels[field]}
                />
                {isMarkedForReview && (
                  <p className="mt-2 text-xs text-warning flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Marked for manual review
                  </p>
                )}
              </div>
            );
          })}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Creating Tenant...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm & Create Tenant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
