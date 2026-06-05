import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext(null);
const MAX = 3;

export function CompareProvider({ children }) {
  const [items, setItems]   = useState([]);
  const [showModal, setShowModal] = useState(false);

  const add = (listing) => {
    if (items.find((l) => l._id === listing._id)) return;
    if (items.length >= MAX) {
      toast.error(`You can compare up to ${MAX} rooms at once`);
      return;
    }
    setItems((prev) => [...prev, listing]);
    toast.success('Added to compare');
  };

  const remove = (id) => setItems((prev) => prev.filter((l) => l._id !== id));
  const clear  = () => { setItems([]); setShowModal(false); };
  const isSelected = (id) => items.some((l) => l._id === id);
  const toggle = (listing) => isSelected(listing._id) ? remove(listing._id) : add(listing);

  return (
    <CompareContext.Provider value={{ items, add, remove, clear, toggle, isSelected, showModal, setShowModal }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
