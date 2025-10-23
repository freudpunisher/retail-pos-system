import {useState, useEffect, useCallback} from 'react';
import {userService} from '../services/userServices';
import {User, UseUsersResult} from '../types/user';

export const useUsers = (): UseUsersResult => {
    const [users, setUsers] = useState<User[]>([]);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setUserLoading
            (true);
            const data = await userService.getUsers();
            setUsers(data);
            setUserLoading
            (false);
        } catch (err) {
            setUserError('Failed to fetch users');
            setUserLoading
            (false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // @ts-ignore
    return {users, userLoading, userError, refetch: fetchUsers, fetchUsers};
};