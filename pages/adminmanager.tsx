import { useState, FormEvent } from 'react';

interface UploadResponse {
  webp: string;
  avif: string;
}

export default function AdminImageManager() {
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
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
          <button type="submit" className="px-4 py-1 border">Upload</button>
        </div>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div className="space-y-2">
          <p>WebP URL: {result.webp}</p>
          <p>AVIF URL: {result.avif}</p>
          <picture>
            <source srcSet={result.avif} type="image/avif" />
            <source srcSet={result.webp} type="image/webp" />
            <img src={result.webp} alt="Uploaded preview" width={300} height={200} />
          </picture>
        </div>
      )}
    </div>
  );
}
