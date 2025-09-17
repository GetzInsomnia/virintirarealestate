import { useState, FormEvent } from 'react';

import AdminLoginForm from '@/src/components/admin/AdminLoginForm';
import { useAdminAuth } from '@/src/context/AdminAuthContext';
import { ApiError, apiRequest } from '@/src/lib/api';

interface FormState {
  type: string;
  province: string;
  district: string;
  priceTHB: string;
  beds: string;
  baths: string;
  areaBuilt: string;
}

export default function AdminPropertyManager() {
  const [form, setForm] = useState<FormState>({
    type: 'condo',
    province: '',
    district: '',
    priceTHB: '',
    beds: '',
    baths: '',
    areaBuilt: '',
  });
  const { isAuthenticated, isReady } = useAdminAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePublish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in again to publish.');
      return;
    }
    try {
      await apiRequest('/v1/properties', {
        method: 'POST',
        json: {
          ...form,
          priceTHB: Number(form.priceTHB),
          beds: form.beds ? Number(form.beds) : undefined,
          baths: form.baths ? Number(form.baths) : undefined,
          areaBuilt: Number(form.areaBuilt),
        },
      });
      alert('Property published and index build queued.');
      setForm({ type: 'condo', province: '', district: '', priceTHB: '', beds: '', baths: '', areaBuilt: '' });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Publish failed';
      alert(message);
    }
  };

  const handleDemo = async () => {
    if (!isAuthenticated) {
      alert('Please sign in again to run demo generation.');
      return;
    }
    try {
      await apiRequest('/v1/properties/demo', {
        method: 'POST',
      });
      if (window.confirm('Demo properties generated. Publish index now?')) {
        await apiRequest('/v1/search/reindex', {
          method: 'POST',
        });
        alert('Index build triggered');
      }
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err?.message || 'Operation failed';
      alert(message);
    }
  };

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <AdminLoginForm title="Admin property tools" description="Sign in to manage property content." />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Quick Add Property</h1>
      <form onSubmit={handlePublish} className="space-y-2">
        <div>
          <label className="block">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="border p-1" required>
            <option value="condo">Condo</option>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>
        <div>
          <label className="block">Province</label>
          <input name="province" value={form.province} onChange={handleChange} className="border p-1" required />
        </div>
        <div>
          <label className="block">District</label>
          <input name="district" value={form.district} onChange={handleChange} className="border p-1" required />
        </div>
        <div>
          <label className="block">Price (THB)</label>
          <input type="number" name="priceTHB" value={form.priceTHB} onChange={handleChange} className="border p-1" required />
        </div>
        <div>
          <label className="block">Beds</label>
          <input type="number" name="beds" value={form.beds} onChange={handleChange} className="border p-1" />
        </div>
        <div>
          <label className="block">Baths</label>
          <input type="number" name="baths" value={form.baths} onChange={handleChange} className="border p-1" />
        </div>
        <div>
          <label className="block">Area Built (sqm)</label>
          <input type="number" name="areaBuilt" value={form.areaBuilt} onChange={handleChange} className="border p-1" required />
        </div>
        <button type="submit" className="px-4 py-1 border">Publish</button>
      </form>
      {process.env.NODE_ENV !== 'production' && (
        <div>
          <button onClick={handleDemo} className="px-4 py-1 border">Generate Demo</button>
        </div>
      )}
    </div>
  );
}

