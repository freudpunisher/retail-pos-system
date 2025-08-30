import axiosInstance from '../lib/axiosInstance';
import { Category, CategoryResponse } from '../types/category.types';

const API_URL = '/api/categories/';

export const categoryService = {
  async getCategories(): Promise<CategoryResponse[]> {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  async getCategory(id: string): Promise<CategoryResponse> {
    const response = await axiosInstance.get(`${API_URL}${id}/`);
    return response.data;
  },

  async createCategory(category: Category): Promise<CategoryResponse> {
    const response = await axiosInstance.post(API_URL, category);
    return response.data;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<CategoryResponse> {
    const response = await axiosInstance.patch(`${API_URL}${id}/`, category);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}${id}/`);
  },
};