import {Fournisseur} from "@/types/fournisseur";
import {useEffect, useState} from "react";
import {FournisseurService} from "@/services/fournisseurService";


export const useFournisseurs = () => {
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFournisseurs = async () => {
            setLoading(true);
            try {
                const data = await FournisseurService.getFournisseurs();
                setFournisseurs(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch fournisseurs');
            } finally {
                setLoading(false);
            }
        };

        fetchFournisseurs();
    }, []);

    return { fournisseurs, loading, error };
};