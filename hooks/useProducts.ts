import { useState, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, ProductResponse } from '../types/product.types';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Product) => {
    setLoading(true);
    try {
      const newProduct = await productService.createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
      setError(null);
      return newProduct;
    } catch (err) {
      setError('Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    setLoading(true);
    try {
      const updatedProduct = await productService.updateProduct(id, product);
      setProducts((prev) =>
        prev.map((prod) => (prod.id === id ? updatedProduct : prod))
      );
      setError(null);
      return updatedProduct;
    } catch (err) {
      setError('Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};