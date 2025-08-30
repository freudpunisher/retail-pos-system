import axiosInstance from '../lib/axiosInstance';
import { Product, ProductResponse } from '../types/product.types';

const API_URL = '/api/produits/';

export const productService = {
  async getProducts(): Promise<ProductResponse[]> {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  async getProduct(id: string): Promise<ProductResponse> {
    const response = await axiosInstance.get(`${API_URL}${id}/`);
    return response.data;
  },

  async createProduct(product: Product): Promise<ProductResponse> {
    const response = await axiosInstance.post(API_URL, product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<ProductResponse> {
    const response = await axiosInstance.patch(`${API_URL}${id}/`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}${id}/`);
  },
};