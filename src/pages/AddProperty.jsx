// src/pages/AddProperty.jsx
import React, { useState } from 'react';
import api from '@/lib/apiClient';

export default function AddProperty() {
  const [form, setForm] = useState({ title:'', address:'', bhk:1, price:'' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/properties', form);
      alert('Property created (mock): ' + res?.data?.id);
      window.history.back(); // or navigate to /properties
    } catch (err) {
      console.error(err);
      alert('Failed to save property');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-3">Add Property</h2>
      <form onSubmit={submit} className="space-y-3">
        <label>Title<input className="w-full border p-2" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></label>
        <label>Address<textarea className="w-full border p-2" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} /></label>
        <label>BHK<input type="number" className="w-32 border p-2" value={form.bhk} onChange={e=>setForm(f=>({...f,bhk:parseInt(e.target.value||1)}))} /></label>
        <label>Price<input className="w-full border p-2" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} /></label>
        <div className="flex gap-2">
          <button disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded">{loading?'Saving...':'Save'}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>window.history.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
