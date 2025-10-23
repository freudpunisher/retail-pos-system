import { useState, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, ProductResponse } from '../types/product.types';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setproductsError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setproductsError(null);
    } catch (err) {
      setproductsError('Failed to fetch products');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Product) => {
    setProductsLoading(true);
    try {
      const newProduct = await productService.createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
      setproductsError(null);
      return newProduct;
    } catch (err) {
      setproductsError('Failed to create product');
      throw err;
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    setProductsLoading(true);
    try {
      const updatedProduct = await productService.updateProduct(id, product);
      setProducts((prev) =>
        prev.map((prod) => (prod.id === id ? updatedProduct : prod))
      );
      setproductsError(null);
      return updatedProduct;
    } catch (err) {
      setproductsError('Failed to update product');
      throw err;
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProductsLoading(true);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      setproductsError(null);
    } catch (err) {
      setproductsError('Failed to delete product');
      throw err;
    } finally {
      setProductsLoading(false);
    }
  }, []);

  return {
    products,
    productsLoading,
    productsError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};