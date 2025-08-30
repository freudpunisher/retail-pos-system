import { useState, useCallback } from 'react';
import { pointVenteService } from '../services/pointVenteService';
import { PointVenteResponse, CreatePointVenteRequest, UpdatePointVenteRequest } from '../types/pointVenteType';

export const usePointsVente = () => {
  const [pointsVente, setPointsVente] = useState<PointVenteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPointsVente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pointVenteService.getPointsVente();
      setPointsVente(data);
    } catch (err) {
      setError('Failed to fetch points of sale');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPointVenteById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pointVenteService.getPointVenteById(id);
      return data;
    } catch (err) {
      setError(`Failed to fetch point of sale with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPointVente = useCallback(async (pointVenteData: CreatePointVenteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newPointVente = await pointVenteService.createPointVente(pointVenteData);
      setPointsVente((prev) => [...prev, newPointVente]);
      return newPointVente;
    } catch (err) {
      setError('Failed to create point of sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePointVente = useCallback(async (id: string, pointVenteData: UpdatePointVenteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPointVente = await pointVenteService.updatePointVente(id, pointVenteData);
      setPointsVente((prev) =>
        prev.map((point) => (point.id === id ? { ...point, ...updatedPointVente } : point))
      );
      return updatedPointVente;
    } catch (err) {
      setError(`Failed to update point of sale with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePointVente = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await pointVenteService.deletePointVente(id);
      setPointsVente((prev) => prev.filter((point) => point.id !== id));
    } catch (err) {
      setError(`Failed to delete point of sale with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePointVenteActive = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPointVente = await pointVenteService.togglePointVenteActive(id, isActive);
      setPointsVente((prev) =>
        prev.map((point) => (point.id === id ? { ...point, is_active: updatedPointVente.is_active } : point))
      );
      return updatedPointVente;
    } catch (err) {
      setError(`Failed to toggle active status for point of sale with id ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pointsVente,
    loading,
    error,
    fetchPointsVente,
    fetchPointVenteById,
    createPointVente,
    updatePointVente,
    deletePointVente,
    togglePointVenteActive,
  };
};