import { useState, FormEvent } from 'react';
import {
  useAdminCsrfToken,
  withAdminCsrfHeader,
} from '@/src/lib/security/adminCsrf';

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
  const csrfToken = useAdminCsrfToken();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePublish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!csrfToken) {
      alert('Missing security token. Please log in again.');
      return;
    }
    const headers = withAdminCsrfHeader(
      { 'Content-Type': 'application/json' },
      csrfToken
    );
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          priceTHB: Number(form.priceTHB),
          beds: form.beds ? Number(form.beds) : undefined,
          baths: form.baths ? Number(form.baths) : undefined,
          areaBuilt: Number(form.areaBuilt),
        }),
      });
      if (!res.ok) throw new Error('Publish failed');
      alert('Property published and index built');
      setForm({ type: 'condo', province: '', district: '', priceTHB: '', beds: '', baths: '', areaBuilt: '' });
    } catch (err: any) {
      alert(err.message || 'Publish failed');
    }
  };

  const handleDemo = async () => {
    if (!csrfToken) {
      alert('Missing security token. Please log in again.');
      return;
    }
    try {
      const demoHeaders = withAdminCsrfHeader(undefined, csrfToken);
      const res = await fetch('/api/admin/generate-demo', {
        method: 'POST',
        headers: demoHeaders,
      });
      if (!res.ok) throw new Error('Demo generation failed');
      if (window.confirm('Demo properties generated. Publish index now?')) {
        const buildHeaders = withAdminCsrfHeader(undefined, csrfToken);
        const r = await fetch('/api/admin/build-index', {
          method: 'POST',
          headers: buildHeaders,
        });
        if (!r.ok) throw new Error('Index build failed');
        alert('Index built');
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

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

