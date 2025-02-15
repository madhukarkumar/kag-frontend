'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../components/Spinner';
import NavHeader from '@/components/NavHeader';
import UploadForm from '@/components/UploadForm';
import { api } from '../../../utils/api';

interface UploadResponse {
  task_id: string;
  doc_id: number;
  status: string;
  message?: string;
}

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const validateFile = (file: File): string | null => {
    if (!file.type || file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    const validationError = validateFile(droppedFile);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setFile(droppedFile);
    setError(null);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    if (uploading) return; // Prevent multiple uploads

    setUploading(true);
    setError(null);

    try {
      const result = await api.uploadFile<UploadResponse>('upload', file);
      if (result.status === 'started') {
        router.push('/kb');
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <UploadForm
            isDragging={isDragging}
            file={file}
            error={error}
            uploading={uploading}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
          />
        </div>
      </div>
    </main>
  );
}
