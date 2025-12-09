import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { UploadZone } from '@/components/ui/UploadZone';
import { toast } from '@/components/ui/AppToast';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const { uploadId } = await apiClient.uploadFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setStatus('processing');

      toast.info('Processing OCR...', 'Your document is being analyzed.');

      // Poll for parsed result
      let attempts = 0;
      const maxAttempts = 12;
      const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
          const upload = await apiClient.getUploadParsed(uploadId);
          
          if (upload?.status === 'completed' && upload.parsedJson) {
            clearInterval(pollInterval);
            setStatus('done');
            toast.success('OCR Complete', 'Document has been processed successfully.');
            navigate(`/ocr-preview/${uploadId}`);
          } else if (upload?.status === 'failed') {
            clearInterval(pollInterval);
            setStatus('idle');
            toast.error('OCR Failed', 'Failed to process the document.');
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setStatus('idle');
            toast.error('Timeout', 'OCR processing took too long. Please try again.');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setStatus('idle');
          toast.error('Error', 'Failed to check OCR status.');
        }
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('idle');
      toast.error('Upload failed', 'Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground">
          Upload tenant documents for OCR processing and automatic data extraction.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-lg border border-border bg-card p-6">
        {status === 'processing' ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Processing OCR...</h2>
            <p className="mt-2 text-muted-foreground">
              Extracting data from your document. This may take a few seconds.
            </p>
            <div className="mt-6 mx-auto max-w-xs">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <UploadZone onFileSelect={handleFileSelect} />

            {file && (
              <>
                {/* Upload progress */}
                {status === 'uploading' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground">Uploading...</span>
                      <span className="text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action button */}
                {status === 'idle' && (
                  <button
                    onClick={handleUpload}
                    className="btn-primary w-full mt-6"
                    disabled={isUploading}
                  >
                    <FileText className="h-4 w-4" />
                    Process with OCR
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-muted/50 p-4">
        <h3 className="font-medium text-foreground">Supported Documents</h3>
        <ul className="mt-2 text-sm text-muted-foreground space-y-1">
          <li>• Government-issued IDs (Driver's License, Passport)</li>
          <li>• Lease agreements and rental applications</li>
          <li>• Proof of income documents</li>
          <li>• Bank statements</li>
        </ul>
      </div>
    </div>
  );
}
