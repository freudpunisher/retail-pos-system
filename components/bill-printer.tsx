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

    const printContent = document.getElementById('thermal-receipt')?.innerHTML || ''
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu ${vente.numero_facture || vente.id}</title>
          <meta charset="utf-8">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.3;
              color: #000;
              width: 80mm;
              margin: 0;
              padding: 2mm;
            }
            .receipt {
              width: 76mm;
              margin: 0;
              padding: 0;
            }
            .center { text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; }
            .small { font-size: 10px; }
            .company-name { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 2px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 3px 0;
              height: 1px;
            }
            .double-divider {
              border-top: 2px solid #000;
              margin: 3px 0;
              height: 2px;
            }
            .item-row {
              margin: 1px 0;
            }
            .item-name {
              font-weight: bold;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1px 0;
            }
            .final-total {
              font-size: 14px;
              font-weight: bold;
              margin: 2px 0;
            }
            .spacing { margin: 3px 0; }
            .thank-you {
              margin-top: 5mm;
              font-size: 11px;
            }
            
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
                font-size: 11px;
              }
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
    return (vente.lignes || []).reduce((sum, line) => {
      const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
      const discountAmount = lineTotal * (Number(line.remise_pourcentage || 0) / 100)
      return sum + (lineTotal - discountAmount)
    }, 0)
  }

  const calculateTotalTax = () => {
    return (vente.lignes || []).reduce((sum, line) => {
      const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
      const discountAmount = lineTotal * (Number(line.remise_pourcentage || 0) / 100)
      const taxableAmount = lineTotal - discountAmount
      return sum + (taxableAmount * (Number(line.taux_tva || 0) / 100))
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTotalTax()
    const globalDiscount = subtotal * (Number(vente.remise_globale || 0) / 100)
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
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm">
            Aperçu du Reçu
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="thermal-receipt" className="bg-white p-4">
          <div className="receipt">
            {/* Header */}
            <div className="center">
              <div className="company-name">RETAIL POS SYSTEM</div>
              <div className="small">123 Business Street</div>
              <div className="small">Tel: +1 (555) 123-4567</div>
              <div className="small">contact@retailpos.com</div>
            </div>
            
            <div className="divider"></div>
            
            {/* Receipt Info */}
            <div className="spacing">
              <div className="left bold">REÇU DE VENTE</div>
              <div className="left small">N°: {vente.numero_facture || vente.id?.slice(0, 8)}</div>
              <div className="left small">
                Date: {vente.created_at ? formatDate(vente.created_at).split(' ')[0] + ' ' + formatDate(vente.created_at).split(' ')[1] : new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {client && (
                <div className="left small">
                  Client: {client.nom} {client.prenom}
                </div>
              )}
              <div className="left small">
                Statut: {vente.payment_status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}
              </div>
            </div>
            
            <div className="divider"></div>
            
            {/* Items */}
            <div className="spacing">
              {vente.lignes?.map((line, index) => {
                const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
                const discountAmount = lineTotal * (Number(line.remise_pourcentage || 0) / 100)
                const taxAmount = (lineTotal - discountAmount) * (Number(line.taux_tva || 0) / 100)
                const finalTotal = lineTotal - discountAmount + taxAmount

                return (
                  <div key={index} className="item-row">
                    <div className="item-name">{line.produit}</div>
                    <div className="item-details">
                      <span>{line.quantite} x {Number(line.prix_unitaire_ht).toFixed(0)} FBU</span>
                      <span className="right bold">{finalTotal.toFixed(0)} FBU</span>
                    </div>
                    {Number(line.remise_pourcentage || 0) > 0 && (
                      <div className="left small">  Remise: -{Number(line.remise_pourcentage).toFixed(0)}%</div>
                    )}
                    {Number(line.taux_tva || 0) > 0 && (
                      <div className="left small">  TVA: {Number(line.taux_tva).toFixed(0)}%</div>
                    )}
                  </div>
                )
              }) || []}
            </div>
            
            <div className="divider"></div>
            
            {/* Totals */}
            <div className="spacing">
              <div className="total-row">
                <span>Sous-total:</span>
                <span>{calculateSubtotal().toFixed(0)} FBU</span>
              </div>
              
              {Number(vente.remise_globale || 0) > 0 && (
                <div className="total-row">
                  <span>Remise globale ({Number(vente.remise_globale).toFixed(0)}%):</span>
                  <span>-{(calculateSubtotal() * (Number(vente.remise_globale) / 100)).toFixed(0)} FBU</span>
                </div>
              )}
              
              <div className="total-row">
                <span>TVA:</span>
                <span>{calculateTotalTax().toFixed(0)} FBU</span>
              </div>
            </div>
            
            <div className="double-divider"></div>
            
            <div className="total-row final-total">
              <span className="bold large">TOTAL:</span>
              <span className="bold large">{calculateTotal().toFixed(0)} FBU</span>
            </div>
            
            <div className="divider"></div>
            
            {/* Payment Info */}
            <div className="spacing center small">
              <div>Mode de paiement: {vente.payment_status === 'paid' ? 'Espèces' : 'En attente'}</div>
            </div>
            
            {/* Comments */}
            {vente.commentaire && (
              <div className="spacing">
                <div className="left small bold">Note:</div>
                <div className="left small">{vente.commentaire}</div>
              </div>
            )}
            
            <div className="divider"></div>
            
            {/* Footer */}
            <div className="thank-you center">
              <div className="bold">MERCI DE VOTRE VISITE!</div>
              <div className="small">Conservez ce reçu</div>
              <div className="small">Service client: +1 (555) 123-4567</div>
            </div>
            
            {/* Cut line indicator */}
            <div style={{ marginTop: '10mm', textAlign: 'center', fontSize: '10px' }}>- - - - - - - - - - - - - - -</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}