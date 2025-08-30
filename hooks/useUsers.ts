import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userServices';
import { User } from '../types/user';

interface UseUsersResult {
  users: User[] | null;
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers , fetchUsers };
};