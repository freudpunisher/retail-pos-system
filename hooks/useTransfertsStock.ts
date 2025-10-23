import { useState, useCallback } from "react"
import { TransfertStock, CreateTransfertStock, UpdateTransfertStock } from "@/types/transfertsStock"
import { fetchTransferts, createTransfert, updateTransfert } from "@/services/transfertsStockService"

export function useTransferts() {
    const [transferts, setTransferts] = useState<TransfertStock[]>([])
    const [transfertsloading, setTransfertsLoading] = useState(false)
    const [transfertsError, setTransfertsError] = useState<string | null>(null)

    const loadTransferts = useCallback(async () => {
        setTransfertsLoading(true)
        try {
            const data = await fetchTransferts()
            setTransferts(data)
        } catch (error: any) {
            setTransfertsError(error.message)
        } finally {
            setTransfertsLoading(false)
        }
    }, [])

    const addTransfert = useCallback(async (payload: CreateTransfertStock) => {
        setTransfertsLoading(true)
        try {
            const newTransfert = await createTransfert(payload)
            setTransferts((prev) => [newTransfert, ...prev])
            return newTransfert
        } catch (err: any) {
            setTransfertsError(err.message)
            throw err
        } finally {
            setTransfertsLoading(false)
        }
    }, [])

    const editTransfert = useCallback(async (id: string, payload: UpdateTransfertStock) => {
        setTransfertsLoading(true)
        try {
            const updated = await updateTransfert(id, payload)
            setTransferts((prev) => prev.map((t) => (t.id === id ? updated : t)))
            return updated
        } catch (err: any) {
            setTransfertsError(err.message)
            throw err
        } finally {
            setTransfertsLoading(false)
        }
    }, [])

    return { transferts, transfertsloading, transfertsError, loadTransferts, addTransfert, editTransfert }
}
