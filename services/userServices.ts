import  axiosInstance from '../lib/axiosInstance';
import { User, CreateUserRequest, RoleEnum } from '../types/user';
import { useUsers } from '../hooks/useUsers';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get('/api/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      const response = await axiosInstance.post('/api/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  toggleUserActive: async (userId: string, isActive: boolean): Promise<User> => {
    try {
      const response = await axiosInstance.patch(`/api/users/${userId}/`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling user active status:', error);
      throw error;
    }
  },
};

// Re-export useUsers and RoleEnum for convenience
export { useUsers, RoleEnum };