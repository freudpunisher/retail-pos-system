
import { useState, useCallback } from 'react';
import { FournisseurService } from '../services/fournisseurService';
import { FournisseurResponse, CreateFournisseurRequest, UpdateFournisseurRequest } from '../types/fournisseur';

export const useFournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FournisseurService.getFournisseurs();
      setFournisseurs(data);
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFournisseurById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await FournisseurService.getFournisseurById(id);
      return data;
    } catch (err) {
      setError(`Failed to fetch supplier with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFournisseur = useCallback(async (fournisseurData: CreateFournisseurRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newFournisseur = await FournisseurService.createFournisseur(fournisseurData);
      setFournisseurs((prev) => [...prev, newFournisseur]);
      return newFournisseur;
    } catch (err) {
      setError('Failed to create supplier');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFournisseur = useCallback(async (id: string, fournisseurData: UpdateFournisseurRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedFournisseur = await FournisseurService.updateFournisseur(id, fournisseurData);
      setFournisseurs((prev) =>
        prev.map((fournisseur) => (fournisseur.id === id ? { ...fournisseur, ...updatedFournisseur } : fournisseur))
      );
      return updatedFournisseur;
    } catch (err) {
      setError(`Failed to update supplier with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFournisseur = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await FournisseurService.deleteFournisseur(id);
      setFournisseurs((prev) => prev.filter((fournisseur) => fournisseur.id !== id));
    } catch (err) {
      setError(`Failed to delete supplier with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFournisseurActive = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updatedFournisseur = await FournisseurService.toggleFournisseurActive(id, isActive);
      setFournisseurs((prev) =>
        prev.map((fournisseur) => (fournisseur.id === id ? { ...fournisseur, is_active: updatedFournisseur.is_active } : fournisseur))
      );
      return updatedFournisseur;
    } catch (err) {
      setError(`Failed to toggle active status for supplier with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fournisseurs,
    loading,
    error,
    fetchFournisseurs,
    fetchFournisseurById,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    toggleFournisseurActive,
  };
};