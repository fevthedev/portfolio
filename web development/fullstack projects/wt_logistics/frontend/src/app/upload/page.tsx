'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const dropRef = useRef<HTMLLabelElement>(null);
  const router = useRouter();

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage('Only CSV files are allowed.');
      return;
    }
    setFile(selectedFile);
    setMessage('');
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('You have not selected a shipment file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`api/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          timeout: 120000, // setting 2 minute timeout limit to accommodate larger file processing
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
          if (percent === 100) setProcessing(true);
        },
      });

      if (res.status === 200) {
        setMessage(res.data.message || 'Upload successful');
        // direct user to the dashboard
        router.push('/');
      }
    } catch (e) {
      console.error('Failed to upload file:', e);
      setMessage('File upload failed.');
    } finally {
      setLoading(false);
    }


  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Upload Shipment CSV</h1>

      {loading ? (
        <LoadingSpinner label={processing
          ? 'Processing file...'
          : `Uploading... ${uploadProgress}%`} />
      ) : (
        <>
          {/* Drop zone container */}
          <label
            ref={dropRef}
            htmlFor="fileUpload"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-md p-10 text-center text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition"
          >
            <p className="mb-2">📂 Drag & drop your CSV here</p>
            <p>or <span className="underline text-blue-600">click to browse</span></p>
            {file && (
              <p className="mt-4 text-green-600 text-sm font-medium">
                Selected: {file.name}
              </p>
            )}
            <input
              type="file"
              id="fileUpload"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>

          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-5 py-2 rounded font-medium text-white transition cursor-pointer ${file
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              Upload
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-gray-700">{message}</p>
          )}
        </>
      )}
    </div>
  );
}