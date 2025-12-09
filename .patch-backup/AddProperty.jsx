import React, { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';

export default function AddProperty() {
  const [form, setForm] = useState({ title: '', address: '', bhk: 1, price: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.createProperty(form);
      // navigate to properties list after create
      nav('/properties');
    } catch (err) {
      console.error(err);
      alert('Failed to save property (see console)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4 bg-white rounded shadow'>
      <h2 className='text-xl mb-3'>Add Property</h2>
      <form onSubmit={submit} className='space-y-3'>
        <label className='block'>Title
          <input className='w-full border p-2' value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        </label>
        <label className='block'>Address
          <textarea className='w-full border p-2' value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
        </label>
        <label className='block'>BHK
          <input type='number' className='w-32 border p-2' value={form.bhk} onChange={e=>setForm({...form,bhk:parseInt(e.target.value||1)})} />
        </label>
        <label className='block'>Price
          <input className='w-full border p-2' value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
        </label>
        <div className='flex gap-2'>
          <button disabled={loading} className='px-4 py-2 bg-teal-600 text-white rounded'>{loading ? 'Saving...' : 'Save'}</button>
          <button type='button' className='px-4 py-2 border rounded' onClick={()=>nav(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
