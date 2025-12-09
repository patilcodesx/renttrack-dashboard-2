import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { InputField } from '@/components/ui/InputField';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { UploadZone } from '@/components/ui/UploadZone';
import { toast } from '@/components/ui/AppToast';

const steps = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Documents' },
  { id: 3, title: 'Review' },
  { id: 4, title: 'Submit' },
];

interface TenantData {
  name: string;
  email: string;
  phone: string;
  govtId: string;
  address: string;
  propertyId: string;
  propertyName: string;
  rentAmount: number;
  deposit: number;
  leaseStart: string;
  leaseEnd: string;
}

const initialData: TenantData = {
  name: '',
  email: '',
  phone: '',
  govtId: '',
  address: '',
  propertyId: 'prop-1',
  propertyName: 'Sunset View Apartment',
  rentAmount: 2500,
  deposit: 5000,
  leaseStart: '',
  leaseEnd: '',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantData>(initialData);
  const [documents, setDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof TenantData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof TenantData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof TenantData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.govtId.trim()) newErrors.govtId = 'Government ID is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (documents.length === 0) {
      toast.warning('Please upload at least one document');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof TenantData, string>> = {};

    if (!formData.leaseStart) newErrors.leaseStart = 'Lease start date is required';
    if (!formData.leaseEnd) newErrors.leaseEnd = 'Lease end date is required';
    if (formData.leaseStart && formData.leaseEnd && formData.leaseStart >= formData.leaseEnd) {
      newErrors.leaseEnd = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const tenant = await apiClient.createTenant(formData);
      toast.success('Tenant created successfully!', `${formData.name} has been added to the system.`);
      navigate(`/tenants/${tenant.id}`);
    } catch (error) {
      toast.error('Failed to create tenant', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setDocuments((prev) => [...prev, file]);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tenant Onboarding</h1>
        <p className="text-muted-foreground">Add a new tenant to your property</p>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} className="mb-8" />

      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="John Smith"
                required
              />
              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder="john@example.com"
                required
              />
              <InputField
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
                required
              />
              <InputField
                label="Government ID"
                name="govtId"
                value={formData.govtId}
                onChange={(e) => updateField('govtId', e.target.value)}
                error={errors.govtId}
                placeholder="DL-123456789"
                required
              />
            </div>
            <InputField
              label="Address"
              name="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              error={errors.address}
              placeholder="123 Main St, City, State, ZIP"
              required
            />
          </div>
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Upload Documents</h2>
            <p className="text-sm text-muted-foreground">
              Upload identification documents, proof of income, or other relevant files.
            </p>
            <UploadZone onFileSelect={handleFileSelect} />
            
            {documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== index))}
                      className="text-sm text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Lease Details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Lease Start Date"
                type="date"
                name="leaseStart"
                value={formData.leaseStart}
                onChange={(e) => updateField('leaseStart', e.target.value)}
                error={errors.leaseStart}
                required
              />
              <InputField
                label="Lease End Date"
                type="date"
                name="leaseEnd"
                value={formData.leaseEnd}
                onChange={(e) => updateField('leaseEnd', e.target.value)}
                error={errors.leaseEnd}
                required
              />
              <InputField
                label="Monthly Rent"
                type="number"
                name="rentAmount"
                value={formData.rentAmount.toString()}
                onChange={(e) => updateField('rentAmount', Number(e.target.value))}
                placeholder="2500"
              />
              <InputField
                label="Security Deposit"
                type="number"
                name="deposit"
                value={formData.deposit.toString()}
                onChange={(e) => updateField('deposit', Number(e.target.value))}
                placeholder="5000"
              />
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-lg bg-muted p-4">
              <h3 className="font-medium text-foreground mb-3">Summary</h3>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{formData.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{formData.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{formData.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Government ID</dt>
                  <dd className="font-medium">{formData.govtId || '-'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Property</dt>
                  <dd className="font-medium">{formData.propertyName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Documents</dt>
                  <dd className="font-medium">{documents.length} file(s)</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Step 4: Submit */}
        {currentStep === 4 && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Ready to Submit</h2>
            <p className="mt-2 text-muted-foreground">
              Review your information and click submit to complete the onboarding.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleBack}
            className="btn-outline"
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < 4 ? (
            <button onClick={handleNext} className="btn-primary">
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Submitting...
                </span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
