import { FormEvent, useState } from 'react';
import Image from 'next/image';
import {
  useAdminCsrfToken,
  withAdminCsrfHeader,
} from '@/src/lib/security/adminCsrf';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface UploadResponse {
  webp: string;
  avif: string;
}

export default function AdminImageManager() {
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const csrfToken = useAdminCsrfToken();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError('Please select a file');
      setResult(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, WebP, or AVIF.');
      setResult(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.');
      setResult(null);
      return;
    }

    if (!csrfToken) {
      setError('Missing security token. Please log in again.');
      setResult(null);
      return;
    }

    const data = new FormData();
    data.append('file', file);
    try {
      const headers = withAdminCsrfHeader(undefined, csrfToken);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
        headers,
      });
      if (!res.ok) {
        let message = 'Upload failed';
        try {
          const errData = await res.json();
          message = errData.error || message;
        } catch (e) {
          // ignore json parse errors
        }
        throw new Error(message);
      }
      const json = (await res.json()) as UploadResponse;
      setResult(json);
      setError(null);
    } catch (err: any) {
      setResult(null);
      setError(err.message || 'Upload failed');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Image Manager</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="file" name="file" accept="image/*" required />
        <div>
          <button type="submit" className="px-4 py-1 border">
            Upload
          </button>
        </div>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div className="space-y-2">
          <p>WebP URL: {result.webp}</p>
          <p>AVIF URL: {result.avif}</p>
          <Image
            src={result.webp}
            alt="Uploaded preview"
            width={300}
            height={200}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
