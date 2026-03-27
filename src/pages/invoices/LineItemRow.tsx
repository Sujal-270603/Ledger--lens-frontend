import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import type { CreateInvoiceItemInput } from '@/types/invoice.types';
import { formatCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface LineItemRowProps {
  index: number;
  item: CreateInvoiceItemInput;
  onChange: (index: number, field: keyof CreateInvoiceItemInput, value: string | number) => void;
  onRemove: (index: number) => void;
  isOnly: boolean;
  error?: FieldErrors<CreateInvoiceItemInput>;
}

export function LineItemRow({ index, item, onChange, onRemove, isOnly, error }: LineItemRowProps) {
  const taxOptions = [
    { value: '0', label: '0%' },
    { value: '5', label: '5%' },
    { value: '12', label: '12%' },
    { value: '18', label: '18%' },
    { value: '28', label: '28%' },
  ];

  return (
    <div className="p-4 md:p-0 md:py-2 bg-gray-50 md:bg-transparent rounded-lg border md:border-none space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-start group relative">
      
      {/* Mobile labels shown inline, hidden on desktop map */}
      <div className="md:col-span-3">
        <Label className="md:hidden mb-1 block">Description</Label>
        <Input 
          placeholder="Service or product name" 
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          error={error?.description?.message}
        />
      </div>

      <div className="md:col-span-2">
        <Label className="md:hidden mb-1 block">HSN/SAC Code</Label>
        <Input 
          placeholder="HSN" 
          value={item.hsnCode || ''}
          onChange={(e) => onChange(index, 'hsnCode', e.target.value)}
          error={error?.hsnCode?.message}
        />
      </div>

      <div className="grid grid-cols-2 md:col-span-2 gap-4">
        <div>
          <Label className="md:hidden mb-1 block">Qty</Label>
          <Input 
            type="number"
            min="0.01"
            step="0.01"
            value={item.quantity}
            onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            error={error?.quantity?.message}
          />
        </div>
        <div>
          <Label className="md:hidden mb-1 block">Unit Price</Label>
          <Input 
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
            error={error?.unitPrice?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:col-span-4 gap-4 items-start">
        <div className="md:col-span-1">
          <Label className="md:hidden mb-1 block">Tax %</Label>
          <Select 
            options={taxOptions}
            value={item.taxRate.toString()}
            onChange={(e) => onChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
            error={error?.taxRate?.message}
          />
        </div>
        <div className="md:col-span-1">
          <Label className="md:hidden mb-1 block">Amount</Label>
          <div className="relative">
            <Input 
              readOnly 
              tabIndex={-1}
              value={formatCurrency(item.amount)} 
              className="bg-gray-100 font-medium text-right cursor-default focus-visible:ring-0 text-navy-900 border-gray-200"
              error={error?.amount?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex md:col-span-1 items-center justify-end md:justify-center pt-2 md:pt-0">
        <Button
          type="button"
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          onClick={() => onRemove(index)}
          disabled={isOnly}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}
