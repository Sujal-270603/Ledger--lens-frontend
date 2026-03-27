import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineItemRow } from './LineItemRow';
import type { FieldErrors } from 'react-hook-form';
import type { CreateInvoiceItemInput } from '@/types/invoice.types';

interface LineItemsSectionProps {
  items: CreateInvoiceItemInput[];
  onChange: (items: CreateInvoiceItemInput[]) => void;
  errors: FieldErrors<{ items: CreateInvoiceItemInput[] }>;
}

export function LineItemsSection({ items, onChange, errors }: LineItemsSectionProps) {
  const handleItemChange = (index: number, field: keyof CreateInvoiceItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate amount when qty or price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? (value as number) : newItems[index].quantity;
      const price = field === 'unitPrice' ? (value as number) : newItems[index].unitPrice;
      newItems[index].amount = parseFloat((qty * price).toFixed(2));
    }
    
    onChange(newItems);
  };

  const addItem = () => {
    onChange([
      ...items,
      { description: '', hsnCode: '', quantity: 1, unitPrice: 0, amount: 0, taxRate: 18 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      
      {/* Desktop Column Headers */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
        <div className="col-span-3">Description</div>
        <div className="col-span-2">HSN/SAC</div>
        <div className="col-span-1">Qty</div>
        <div className="col-span-1">Price</div>
        <div className="col-span-2">Tax %</div>
        <div className="col-span-2 text-right pr-3">Amount</div>
        <div className="col-span-1 text-center pr-2">Actions</div>
      </div>

      <div className="space-y-4 md:space-y-2">
        {items.map((item, index) => (
          <LineItemRow
            key={index} // Note: in real app, better to use unique stable IDs (e.g. from react-hook-form useFieldArray)
            index={index}
            item={item}
            onChange={handleItemChange}
            onRemove={removeItem}
            isOnly={items.length === 1}
            error={errors?.items?.[index]}
          />
        ))}
      </div>

      {errors?.items?.root && (
        <p className="text-sm text-destructive mt-2">{errors.items.root.message}</p>
      )}

      <div className="pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="text-brand-600 border-brand-200 hover:bg-brand-50"
          onClick={addItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Line Item
        </Button>
      </div>

    </div>
  );
}
