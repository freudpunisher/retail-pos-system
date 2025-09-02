import axios, { AxiosResponse } from 'axios';
import {Fournisseur} from "@/types/fournisseur";

export class FournisseurService {
    private static API_URL = 'http://127.0.0.1:8000/api/fournisseurs/';

    // Fetch all fournisseurs
    static async getFournisseurs(): Promise<Fournisseur[]> {
        try {
            const response: AxiosResponse<Fournisseur[]> = await axios.get(this.API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching fournisseurs:', error);
            throw error;
        }
    }

    // Fetch a single fournisseur by ID
    static async getFournisseurById(id: string): Promise<Fournisseur> {
        try {
            const response: AxiosResponse<Fournisseur> = await axios.get(`${this.API_URL}${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching fournisseur with ID ${id}:`, error);
            throw error;
        }
    }

    // Create a new fournisseur
    static async createFournisseur(fournisseur: Omit<Fournisseur, 'id' | 'created_at'>): Promise<Fournisseur> {
        try {
            const response: AxiosResponse<Fournisseur> = await axios.post(this.API_URL, fournisseur);
            return response.data;
        } catch (error) {
            console.error('Error creating fournisseur:', error);
            throw error;
        }
    }

    // Update an existing fournisseur
    static async updateFournisseur(id: string, fournisseur: Partial<Fournisseur>): Promise<Fournisseur> {
        try {
            const response: AxiosResponse<Fournisseur> = await axios.put(`${this.API_URL}${id}/`, fournisseur);
            return response.data;
        } catch (error) {
            console.error(`Error updating fournisseur with ID ${id}:`, error);
            throw error;
        }
    }

    // Delete a fournisseur
    static async deleteFournisseur(id: string): Promise<void> {
        try {
            await axios.delete(`${this.API_URL}${id}/`);
        } catch (error) {
            console.error(`Error deleting fournisseur with ID ${id}:`, error);
            throw error;
        }
    }
}