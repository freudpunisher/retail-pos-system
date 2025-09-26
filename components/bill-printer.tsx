"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Printer } from 'lucide-react'
import { Vente } from '@/types/vente.types'
import { Client } from '@/types/client.types'

interface BillPrinterProps {
  vente: Vente | null
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export function BillPrinter({ vente, client, isOpen, onClose }: BillPrinterProps) {
  if (!vente) return null

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = document.getElementById('invoice-content')?.innerHTML || ''
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${vente.numero_facture || vente.id}</title>
          <meta charset="utf-8">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
            .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .company-details { color: #666; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .bill-to, .invoice-info { flex: 1; }
            .bill-to h3, .invoice-info h3 { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background-color: #f5f5f5; font-weight: bold; }
            .items-table .text-right { text-align: right; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .totals-row.total { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 10px; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #ddd; padding-top: 15px; }
            @media print {
              body { font-size: 11px; }
              .invoice { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  const calculateSubtotal = () => {
    return vente.lignes.reduce((sum, line) => {
      const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
      const discountAmount = lineTotal * (Number(line.remise_pourcentage) / 100)
      return sum + (lineTotal - discountAmount)
    }, 0)
  }

  const calculateTotalTax = () => {
    return vente.lignes.reduce((sum, line) => {
      const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
      const discountAmount = lineTotal * (Number(line.remise_pourcentage) / 100)
      const taxableAmount = lineTotal - discountAmount
      return sum + (taxableAmount * (Number(line.taux_tva) / 100))
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTotalTax()
    const globalDiscount = subtotal * (Number(vente.remise_globale) / 100)
    return subtotal + tax - globalDiscount
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Aperçu de la Facture
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="bg-white p-6">
          <div className="invoice">
            {/* Header */}
            <div className="header">
              <div className="company-name">RETAIL POS SYSTEM</div>
              <div className="company-details">
                <div>123 Business Street, Downtown</div>
                <div>Tel: +1 (555) 123-4567 | Email: contact@retailpos.com</div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="invoice-details">
              <div className="bill-to">
                <h3>Facturé à:</h3>
                {client ? (
                  <div>
                    <div><strong>{client.nom} {client.prenom}</strong></div>
                    <div>Type: {client.type_client}</div>
                    <div>Email: {client.email}</div>
                    <div>Téléphone: {client.telephone}</div>
                    <div>Adresse: {client.adresse}</div>
                  </div>
                ) : (
                  <div>Client non spécifié</div>
                )}
              </div>

              <div className="invoice-info">
                <h3>Détails de la Facture:</h3>
                <div><strong>N° Facture:</strong> {vente.numero_facture || vente.id}</div>
                <div><strong>Date:</strong> {vente.created_at ? formatDate(vente.created_at) : formatDate(new Date().toISOString())}</div>
                <div><strong>Statut:</strong> {vente.status === 'confirmed' ? 'Confirmée' : vente.status === 'draft' ? 'Brouillon' : vente.status}</div>
                <div><strong>Paiement:</strong> {vente.payment_status === 'paid' ? 'Payé' : vente.payment_status === 'pending' ? 'En attente' : vente.payment_status}</div>
                {vente.date_echeance && (
                  <div><strong>Échéance:</strong> {formatDate(vente.date_echeance)}</div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Unité</th>
                  <th className="text-right">Quantité</th>
                  <th className="text-right">Prix Unitaire HT</th>
                  <th className="text-right">TVA (%)</th>
                  <th className="text-right">Remise (%)</th>
                  <th className="text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {vente.lignes.map((line, index) => {
                  const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
                  const discountAmount = lineTotal * (Number(line.remise_pourcentage) / 100)
                  const finalTotal = lineTotal - discountAmount

                  return (
                    <tr key={index}>
                      <td>{line.produit}</td>
                      <td>{line.unite}</td>
                      <td className="text-right">{line.quantite}</td>
                                    <td className="text-right">{Number(line.prix_unitaire_ht).toFixed(2)} FBU</td>
                      <td className="text-right">{Number(line.taux_tva).toFixed(1)}%</td>
                      <td className="text-right">{Number(line.remise_pourcentage).toFixed(1)}%</td>
                                    <td className="text-right">{finalTotal.toFixed(2)} FBU</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="totals-row">
                <span>Sous-total HT:</span>
                <span>{calculateSubtotal().toFixed(2)} FBU</span>
              </div>
              {Number(vente.remise_globale) > 0 && (
                <div className="totals-row">
                  <span>Remise globale ({Number(vente.remise_globale).toFixed(1)}%):</span>
                  <span>-{(calculateSubtotal() * (Number(vente.remise_globale) / 100)).toFixed(2)} FBU</span>
                </div>
              )}
              <div className="totals-row">
                <span>Total TVA:</span>
                <span>{calculateTotalTax().toFixed(2)} FBU</span>
              </div>
              <div className="totals-row total">
                <span>TOTAL TTC:</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>

            {/* Comments */}
            {vente.commentaire && (
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                <strong>Commentaires:</strong>
                <div>{vente.commentaire}</div>
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              <div>Merci pour votre achat!</div>
              <div>Cette facture a été générée électroniquement par le système Retail POS.</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}