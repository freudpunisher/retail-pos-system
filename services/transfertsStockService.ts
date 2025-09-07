import axios from 'axios';
import { TransfertStock, CreateTransfertStock, UpdateTransfertStock, TransfertStockLigne } from '@/types/transfertsStock';

const API_URL = 'http://127.0.0.1:8000/api/transferts-stock/';

export const getTransfertsStock = async (): Promise<TransfertStock[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createTransfertStock = async (data: CreateTransfertStock): Promise<TransfertStock> => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateTransfertStock = async (id: string, data: UpdateTransfertStock): Promise<TransfertStock> => {
    const response = await axios.put(`${API_URL}${id}/`, data);
    return response.data;
};

export const deleteTransfertStock = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}${id}/`);
};

export const getTransfertStockLignes = async (transfertId: string): Promise<TransfertStockLigne[]> => {
    const response = await axios.get(`${API_URL}${transfertId}/lignes/`);
    return response.data;
};

export const createTransfertStockLigne = async (transfertId: string, data: TransfertStockLigne): Promise<TransfertStockLigne> => {
    const response = await axios.post(`${API_URL}${transfertId}/lignes/`, data);
    return response.data;
};

export const updateTransfertStockLigne = async (transfertId: string, ligneId: string, data: TransfertStockLigne): Promise<TransfertStockLigne> => {
    const response = await axios.put(`${API_URL}${transfertId}/lignes/${ligneId}/`, data);
    return response.data;
};

export const deleteTransfertStockLigne = async (transfertId: string, ligneId: string): Promise<void> => {
    await axios.delete(`${API_URL}${transfertId}/lignes/${ligneId}/`);
};