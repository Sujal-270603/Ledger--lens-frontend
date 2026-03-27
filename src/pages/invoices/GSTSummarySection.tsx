import { CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { CreateInvoiceItemInput } from '@/types/invoice.types';
import { cn } from '@/lib/utils';

interface GSTSummarySectionProps {
  items: CreateInvoiceItemInput[];
  gstType: 'cgst_sgst' | 'igst';
  onGstTypeChange: (type: 'cgst_sgst' | 'igst') => void;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstAmount: number;
  totalAmount: number;
  onChange: (field: string, value: number) => void;
  errors: any;
}

export function GSTSummarySection({
  items,
  gstType,
  onGstTypeChange,
  cgstAmount,
  sgstAmount,
  igstAmount,
  gstAmount,
  totalAmount,
  onChange,
  errors
}: GSTSummarySectionProps) {
  
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const itemsQtyPriceCalc = items.reduce((sum, item) => sum + parseFloat((item.quantity * item.unitPrice).toFixed(2)), 0);
  
  const isItemAmountMatch = Math.abs(itemsSubtotal - itemsQtyPriceCalc) < 0.05;
  
  let isGstMatch = false;
  if (gstType === 'cgst_sgst') {
    isGstMatch = Math.abs(cgstAmount + sgstAmount - gstAmount) < 0.05;
  } else {
    isGstMatch = Math.abs(igstAmount - gstAmount) < 0.05;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Left column — GST Type selector */}
      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">GST Type</Label>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-md hover:bg-gray-50 flex-1">
              <input
                type="radio"
                name="gstType"
                value="cgst_sgst"
                checked={gstType === 'cgst_sgst'}
                onChange={() => onGstTypeChange('cgst_sgst')}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium">Intra-state (CGST + SGST)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-md hover:bg-gray-50 flex-1">
              <input
                type="radio"
                name="gstType"
                value="igst"
                checked={gstType === 'igst'}
                onChange={() => onGstTypeChange('igst')}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium">Inter-state (IGST)</span>
            </label>
          </div>
        </div>

        {gstType === 'cgst_sgst' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CGST Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cgstAmount}
                onChange={(e) => onChange('cgstAmount', parseFloat(e.target.value) || 0)}
                error={errors?.cgstAmount?.message}
              />
            </div>
            <div>
              <Label>SGST Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={sgstAmount}
                onChange={(e) => onChange('sgstAmount', parseFloat(e.target.value) || 0)}
                error={errors?.sgstAmount?.message}
              />
            </div>
            <div className="col-span-2 flex items-center justify-between text-sm text-muted-foreground bg-blue-50 p-2 rounded border border-blue-100">
              <span>CGST = SGST = GST ÷ 2</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-white"
                onClick={() => {
                  const half = parseFloat((gstAmount / 2).toFixed(2));
                  onChange('cgstAmount', half);
                  onChange('sgstAmount', half);
                }}
              >
                Auto-fill
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <Label>IGST Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={igstAmount}
                onChange={(e) => onChange('igstAmount', parseFloat(e.target.value) || 0)}
                error={errors?.igstAmount?.message}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground bg-blue-50 p-2 rounded border border-blue-100">
              <span>IGST = Total GST Amount</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-white"
                onClick={() => onChange('igstAmount', gstAmount)}
              >
                Auto-fill
              </Button>
            </div>
          </div>
        )}

        <div>
          <Label className="text-base font-semibold">Total GST Amount</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={gstAmount}
            onChange={(e) => onChange('gstAmount', parseFloat(e.target.value) || 0)}
            error={errors?.gstAmount?.message}
            className="text-lg font-semibold h-12"
          />
        </div>
      </div>

      {/* Right column — Live invoice summary box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md">
        <div>
          <h3 className="text-lg font-bold mb-6 text-slate-100 tracking-tight">INVOICE SUMMARY</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-slate-300">
              <span>Items subtotal</span>
              <span className="font-medium text-slate-100">{formatCurrency(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Total GST amount</span>
              <span className="font-medium text-slate-100">{formatCurrency(gstAmount)}</span>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 pt-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-slate-300 font-medium">TOTAL</span>
              <span className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg">
            {gstType === 'cgst_sgst' ? (
              <>
                <div className="flex justify-between items-center text-sm text-slate-400">
                  <span>CGST</span>
                  <span>{formatCurrency(cgstAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-400">
                  <span>SGST</span>
                  <span>{formatCurrency(sgstAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>IGST</span>
                <span>{formatCurrency(igstAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Indicators */}
        <div className="mt-8 space-y-2 pt-4 border-t border-slate-800">
          <div className={cn("flex items-center text-xs gap-2", isItemAmountMatch ? "text-emerald-400" : "text-rose-400")}>
            {isItemAmountMatch ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isItemAmountMatch ? "Item amounts match" : "Item amount mismatch detected"}
          </div>
          <div className={cn("flex items-center text-xs gap-2", isGstMatch ? "text-emerald-400" : "text-rose-400")}>
            {isGstMatch ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isGstMatch ? "GST amounts balanced" : "GST amounts do not add up"}
          </div>
        </div>
      </div>
      
    </div>
  );
}
