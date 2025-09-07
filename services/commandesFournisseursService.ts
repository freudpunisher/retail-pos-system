import axios, { AxiosResponse } from 'axios';
import {
    CommandeFournisseur,
    CreateCommandeFournisseur,
    UpdateCommandeFournisseur,
    CommandeFournisseurLigne,
    CreateCommandeFournisseurLigne,
    UpdateCommandeFournisseurLigne,
    Fournisseur,
    PointVente,
    User,
    Produit,
} from '@/types/commandesFournisseurs';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

export const fetchCommandesFournisseurs = async (): Promise<CommandeFournisseur[]> => {
    const response: AxiosResponse<CommandeFournisseur[]> = await axios.get(`${API_BASE_URL}commandes-fournisseurs/`);
    return response.data;
};

export const fetchCommandeFournisseurLignes = async (commandeId: string): Promise<CommandeFournisseurLigne[]> => {
    const response: AxiosResponse<CommandeFournisseurLigne[]> = await axios.get(
        `${API_BASE_URL}commandes-fournisseurs/${commandeId}/lignes/`
    );
    return response.data;
};

export const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
    const response: AxiosResponse<Fournisseur[]> = await axios.get(`${API_BASE_URL}fournisseurs/`);
    return response.data;
};

export const fetchPointsVente = async (): Promise<PointVente[]> => {
    const response: AxiosResponse<PointVente[]> = await axios.get(`${API_BASE_URL}points-vente/`);
    return response.data;
};

export const fetchUsers = async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await axios.get(`${API_BASE_URL}users/`);
    return response.data;
};

export const fetchProduits = async (): Promise<Produit[]> => {
    const response: AxiosResponse<Produit[]> = await axios.get(`${API_BASE_URL}produits/`);
    return response.data;
};

export const createCommandeFournisseur = async (data: CreateCommandeFournisseur): Promise<CommandeFournisseur> => {
    const response: AxiosResponse<CommandeFournisseur> = await axios.post(`${API_BASE_URL}commandes-fournisseurs/`, data);
    return response.data;
};

export const updateCommandeFournisseur = async (
    id: string,
    data: UpdateCommandeFournisseur
): Promise<CommandeFournisseur> => {
    const response: AxiosResponse<CommandeFournisseur> = await axios.put(
        `${API_BASE_URL}commandes-fournisseurs/${id}/`,
        data
    );
    return response.data;
};

export const deleteCommandeFournisseur = async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}commandes-fournisseurs/${id}/`);
};

export const createCommandeFournisseurLigne = async (
    data: CreateCommandeFournisseurLigne
): Promise<CommandeFournisseurLigne> => {
    const response: AxiosResponse<CommandeFournisseurLigne> = await axios.post(
        `${API_BASE_URL}commandes-fournisseurs/lignes/`,
        data
    );
    return response.data;
};

export const updateCommandeFournisseurLigne = async (
    id: string,
    data: UpdateCommandeFournisseurLigne
): Promise<CommandeFournisseurLigne> => {
    const response: AxiosResponse<CommandeFournisseurLigne> = await axios.put(
        `${API_BASE_URL}commandes-fournisseurs/lignes/${id}/`,
        data
    );
    return response.data;
};

export const deleteCommandeFournisseurLigne = async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}commandes-fournisseurs/lignes/${id}/`);
};