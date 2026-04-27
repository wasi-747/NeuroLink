import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getEntries, addEntry, updateEntry, deleteEntry } from '../../api/journal';
import { Plus, Edit, Trash } from 'lucide-react';

const journalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
});

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(journalSchema),
  });

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await getEntries();
      if (data) {
        setEntries(data.data);
      } else {
        setError('Could not fetch journal entries.');
      }
    };
    fetchEntries();
  }, []);

  const openForm = (entry = null) => {
    setIsFormOpen(true);
    if (entry) {
      setEditingEntry(entry);
      setValue('title', entry.title);
      setValue('content', entry.content);
      setValue('category', entry.category);
    } else {
      setEditingEntry(null);
      reset({ title: '', content: '', category: '' });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
    reset();
  };

  const onSubmit = async (formData) => {
    const apiCall = editingEntry
      ? updateEntry(editingEntry._id, formData)
      : addEntry(formData);

    const { data, error } = await apiCall;

    if (data) {
      if (editingEntry) {
        setEntries(entries.map((e) => (e._id === editingEntry._id ? data.data : e)));
      } else {
        setEntries([data.data, ...entries]);
      }
      closeForm();
    } else {
      setError(editingEntry ? 'Could not update entry.' : 'Could not add entry.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const { error } = await deleteEntry(id);
      if (!error) {
        setEntries(entries.filter((e) => e._id !== id));
      } else {
        setError('Could not delete entry.');
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Personal Journal</h2>
        <button
          onClick={() => openForm()}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 flex items-center"
        >
          <Plus size={20} />
          <span className="ml-2">New Entry</span>
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <input
                  {...register('title')}
                  placeholder="Title"
                  className="w-full p-2 border rounded"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>
              <div className="mb-4">
                <textarea
                  {...register('content')}
                  placeholder="Write your thoughts..."
                  className="w-full p-2 border rounded"
                  rows="10"
                ></textarea>
                {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
              </div>
              <div className="mb-4">
                <input
                  {...register('category')}
                  placeholder="Category (e.g., Work, Personal)"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={closeForm} className="mr-2 px-4 py-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  {editingEntry ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry._id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{entry.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(entry.createdAt).toLocaleDateString()} - {entry.category}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openForm(entry)} className="text-gray-500 hover:text-blue-500">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(entry._id)} className="text-gray-500 hover:text-red-500">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
