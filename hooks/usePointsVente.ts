import { useState, useCallback } from 'react';
import { pointVenteService } from '../services/pointVenteService';
import { PointVenteResponse, CreatePointVenteRequest, UpdatePointVenteRequest } from '../types/pointVenteType';

export const usePointsVente = () => {
  const [pointsVente, setPointsVente] = useState<PointVenteResponse[]>([]);
  const [pointsVenteLoading, setPointsVenteLoadingLoading] = useState(false);
  const [pointsVenteError, setPointsVenteErrorError] = useState<string | null>(null);

  const fetchPointsVente = useCallback(async () => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      const data = await pointVenteService.getPointsVente();
      setPointsVente(data);
    } catch (err) {
      setPointsVenteErrorError('Failed to fetch points of sale');
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  const fetchPointVenteById = useCallback(async (id: string) => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      const data = await pointVenteService.getPointVenteById(id);
      return data;
    } catch (err) {
      setPointsVenteErrorError(`Failed to fetch point of sale with id ${id}`);
      throw err;
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  const createPointVente = useCallback(async (pointVenteData: CreatePointVenteRequest) => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      const newPointVente = await pointVenteService.createPointVente(pointVenteData);
      setPointsVente((prev) => [...prev, newPointVente]);
      return newPointVente;
    } catch (err) {
      setPointsVenteErrorError('Failed to create point of sale');
      throw err;
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  const updatePointVente = useCallback(async (id: string, pointVenteData: UpdatePointVenteRequest) => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      const updatedPointVente = await pointVenteService.updatePointVente(id, pointVenteData);
      setPointsVente((prev) =>
        prev.map((point) => (point.id === id ? { ...point, ...updatedPointVente } : point))
      );
      return updatedPointVente;
    } catch (err) {
      setPointsVenteErrorError(`Failed to update point of sale with id ${id}`);
      throw err;
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  const deletePointVente = useCallback(async (id: string) => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      await pointVenteService.deletePointVente(id);
      setPointsVente((prev) => prev.filter((point) => point.id !== id));
    } catch (err) {
      setPointsVenteErrorError(`Failed to delete point of sale with id ${id}`);
      throw err;
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  const togglePointVenteActive = useCallback(async (id: string, isActive: boolean) => {
    setPointsVenteLoadingLoading(true);
    setPointsVenteErrorError(null);
    try {
      const updatedPointVente = await pointVenteService.togglePointVenteActive(id, isActive);
      setPointsVente((prev) =>
        prev.map((point) => (point.id === id ? { ...point, is_active: updatedPointVente.is_active } : point))
      );
      return updatedPointVente;
    } catch (err) {
      setPointsVenteErrorError(`Failed to toggle active status for point of sale with id ${id}`);
      throw err;
    } finally {
      setPointsVenteLoadingLoading(false);
    }
  }, []);

  return {
    pointsVente,
    pointsVenteLoading,
    pointsVenteError,
    fetchPointsVente,
    fetchPointVenteById,
    createPointVente,
    updatePointVente,
    deletePointVente,
    togglePointVenteActive,
  };
};