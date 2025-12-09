// src/lib/navigation.js
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useNav() {
  const nav = useNavigate();
  return useCallback((path) => nav(path), [nav]);
}
