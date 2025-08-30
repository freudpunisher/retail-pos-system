import { useState, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { Category, CategoryResponse } from '../types/category.types';

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (category: Category) => {
    setLoading(true);
    try {
      const newCategory = await categoryService.createCategory(category);
      setCategories((prev) => [...prev, newCategory]);
      setError(null);
      return newCategory;
    } catch (err) {
      setError('Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, category: Partial<Category>) => {
    setLoading(true);
    try {
      const updatedCategory = await categoryService.updateCategory(id, category);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setError(null);
      return updatedCategory;
    } catch (err) {
      setError('Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};