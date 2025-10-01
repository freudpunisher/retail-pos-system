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
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm text-slate-800 dark:text-slate-200">
            Aperçu du Reçu
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="thermal-receipt" className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
          <div className="receipt">
            {/* Header */}
            <div className="center">
              <div className="company-name text-slate-800 dark:text-slate-200">RETAIL POS SYSTEM</div>
              <div className="small text-slate-600 dark:text-slate-400">123 Business Street</div>
              <div className="small text-slate-600 dark:text-slate-400">Tel: +1 (555) 123-4567</div>
              <div className="small text-slate-600 dark:text-slate-400">contact@retailpos.com</div>
            </div>
            
            <div className="divider border-slate-300 dark:border-slate-600"></div>
            
            {/* Receipt Info */}
            <div className="spacing">
              <div className="left bold text-slate-800 dark:text-slate-200">REÇU DE VENTE</div>
              <div className="left small text-slate-600 dark:text-slate-400">N°: {vente.numero_facture || vente.id?.slice(0, 8)}</div>
              <div className="left small text-slate-600 dark:text-slate-400">
                Date: {vente.created_at ? formatDate(vente.created_at).split(' ')[0] + ' ' + formatDate(vente.created_at).split(' ')[1] : new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {client && (
                <div className="left small text-slate-600 dark:text-slate-400">
                  Client: {client.nom} {client.prenom}
                </div>
              )}
              <div className="left small text-slate-600 dark:text-slate-400">
                Statut: {vente.payment_status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}
              </div>
            </div>
            
            <div className="divider border-slate-300 dark:border-slate-600"></div>
            
            {/* Items */}
            <div className="spacing">
              {vente.lignes?.map((line, index) => {
                const lineTotal = Number(line.prix_unitaire_ht) * line.quantite
                const discountAmount = lineTotal * (Number(line.remise_pourcentage || 0) / 100)
                const taxAmount = (lineTotal - discountAmount) * (Number(line.taux_tva || 0) / 100)
                const finalTotal = lineTotal - discountAmount + taxAmount

                return (
                  <div key={index} className="item-row">
                    <div className="item-name text-slate-800 dark:text-slate-200">{line.produit}</div>
                    <div className="item-details text-slate-700 dark:text-slate-300">
                      <span>{line.quantite} x {Number(line.prix_unitaire_ht).toFixed(0)} FBU</span>
                      <span className="right bold text-slate-800 dark:text-slate-200">{finalTotal.toFixed(0)} FBU</span>
                    </div>
                    {Number(line.remise_pourcentage || 0) > 0 && (
                      <div className="left small text-slate-600 dark:text-slate-400">  Remise: -{Number(line.remise_pourcentage).toFixed(0)}%</div>
                    )}
                    {Number(line.taux_tva || 0) > 0 && (
                      <div className="left small text-slate-600 dark:text-slate-400">  TVA: {Number(line.taux_tva).toFixed(0)}%</div>
                    )}
                  </div>
                )
              }) || []}
            </div>
            
            <div className="divider border-slate-300 dark:border-slate-600"></div>
            
            {/* Totals */}
            <div className="spacing">
              <div className="total-row text-slate-700 dark:text-slate-300">
                <span>Sous-total:</span>
                <span>{calculateSubtotal().toFixed(0)} FBU</span>
              </div>
              
              {Number(vente.remise_globale || 0) > 0 && (
                <div className="total-row text-slate-700 dark:text-slate-300">
                  <span>Remise globale ({Number(vente.remise_globale).toFixed(0)}%):</span>
                  <span>-{(calculateSubtotal() * (Number(vente.remise_globale) / 100)).toFixed(0)} FBU</span>
                </div>
              )}
              
              <div className="total-row text-slate-700 dark:text-slate-300">
                <span>TVA:</span>
                <span>{calculateTotalTax().toFixed(0)} FBU</span>
              </div>
            </div>
            
            <div className="double-divider border-slate-400 dark:border-slate-500"></div>
            
            <div className="total-row final-total text-slate-800 dark:text-slate-100">
              <span className="bold large">TOTAL:</span>
              <span className="bold large">{calculateTotal().toFixed(0)} FBU</span>
            </div>
            
            <div className="divider border-slate-300 dark:border-slate-600"></div>
            
            {/* Payment Info */}
            <div className="spacing center small text-slate-600 dark:text-slate-400">
              <div>Mode de paiement: {vente.payment_status === 'paid' ? 'Espèces' : 'En attente'}</div>
            </div>
            
            {/* Comments */}
            {vente.commentaire && (
              <div className="spacing">
                <div className="left small bold text-slate-700 dark:text-slate-300">Note:</div>
                <div className="left small text-slate-600 dark:text-slate-400">{vente.commentaire}</div>
              </div>
            )}
            
            <div className="divider border-slate-300 dark:border-slate-600"></div>
            
            {/* Footer */}
            <div className="thank-you center text-slate-700 dark:text-slate-300">
              <div className="bold text-slate-800 dark:text-slate-200">MERCI DE VOTRE VISITE!</div>
              <div className="small text-slate-600 dark:text-slate-400">Conservez ce reçu</div>
              <div className="small text-slate-600 dark:text-slate-400">Service client: +1 (555) 123-4567</div>
            </div>
            
            {/* Cut line indicator */}
            <div style={{ marginTop: '10mm', textAlign: 'center', fontSize: '10px' }} className="text-slate-400 dark:text-slate-500">- - - - - - - - - - - - - - -</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}