import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useInvoice, useClients } from '@/hooks/useInvoices';
import { invoiceApi } from '@/api/invoice.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateInvoiceInput, CreateInvoiceItemInput, InvoiceItemResponse } from '@/types/invoice.types';
import { LineItemsSection } from './LineItemsSection';
import { GSTSummarySection } from './GSTSummarySection';

export interface InvoiceFormData {
  invoiceNumber:  string;
  invoiceDate:    string;
  clientId?:      string;
  gstType:        'cgst_sgst' | 'igst';
  cgstAmount:     number;
  sgstAmount:     number;
  igstAmount:     number;
  gstAmount:      number;
  totalAmount:    number;
  items: {
    description: string;
    hsnCode?:    string;
    quantity:    number;
    unitPrice:   number;
    amount:      number;
    taxRate:     number;
  }[];
}

const invoiceFormSchema = z.object({
  invoiceNumber:  z.string().min(1, 'Invoice number is required').max(100),
  invoiceDate:    z.string().min(1, 'Invoice date is required'),
  clientId:       z.string().optional().or(z.literal('')),
  gstType:        z.enum(['cgst_sgst', 'igst']),
  cgstAmount:     z.coerce.number().min(0),
  sgstAmount:     z.coerce.number().min(0),
  igstAmount:     z.coerce.number().min(0),
  gstAmount:      z.coerce.number().min(0, 'GST amount is required'),
  totalAmount:    z.coerce.number().min(0, 'Total amount must be 0 or greater'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required').max(500),
    hsnCode:     z.string().max(8).optional().or(z.literal('')),
    quantity:    z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice:   z.coerce.number().min(0, 'Unit price must be 0 or greater'),
    amount:      z.coerce.number().min(0, 'Amount mismatch'),
    taxRate:     z.coerce.number().min(0).max(100),
  })).min(1, 'At least one line item is required'),
}).superRefine((data, ctx) => {
  // 1. Check line items
  data.items.forEach((item, i) => {
    const expectedObj = parseFloat((item.quantity * item.unitPrice).toFixed(2));
    if (Math.abs(item.amount - expectedObj) > 0.05) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Item amount mismatch',
        path: ['items', i, 'amount'],
      });
    }
  });

  // 2. GST Balance
  if (data.gstType === 'cgst_sgst') {
    if (Math.abs(data.cgstAmount + data.sgstAmount - data.gstAmount) > 0.05) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CGST + SGST must equal total GST', path: ['cgstAmount'] });
    }
  } else {
    if (Math.abs(data.igstAmount - data.gstAmount) > 0.05) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'IGST must equal total GST', path: ['igstAmount'] });
    }
  }

  // 3. Total Balance
  const itemsSub = data.items.reduce((s, item) => s + (item.amount || 0), 0);
  if (Math.abs(itemsSub + data.gstAmount - data.totalAmount) > 0.05) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Total amount is incorrect', path: ['totalAmount'] });
  }
});

export default function InvoiceFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  
  const isEditMode = !!id && location.pathname.endsWith('/edit');
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(id || '');
  const { data: clients = [] } = useClients();
  
  const [saveMode, setSaveMode] = useState<'draft' | 'submit'>('draft');

  const defaultValues: InvoiceFormData = {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    clientId: '',
    gstType: 'cgst_sgst',
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    gstAmount: 0,
    totalAmount: 0,
    items: [{ description: '', hsnCode: '', quantity: 1, unitPrice: 0, amount: 0, taxRate: 18 }]
  };

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const { replace } = useFieldArray({ control, name: 'items' });

  // Handle edit mode prefilling
  useEffect(() => {
    if (isEditMode && invoice) {
      if (invoice.status !== 'DRAFT' && invoice.status !== 'REJECTED') {
        navigate(`/invoices/${invoice.id}`);
        return;
      }
      
      const igst = parseFloat(invoice.igstAmount || '0');
      const cgst = parseFloat(invoice.cgstAmount || '0');
      const sgst = parseFloat(invoice.sgstAmount || '0');
      
      reset({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate.split('T')[0],
        clientId: invoice.clientId || '',
        gstType: igst > 0 ? 'igst' : 'cgst_sgst',
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        gstAmount: parseFloat(invoice.gstAmount || '0'),
        totalAmount: parseFloat(invoice.totalAmount || '0'),
        items: invoice.items.map((item: InvoiceItemResponse) => ({
          description: item.description,
          hsnCode: item.hsnCode || '',
          quantity: parseFloat(item.quantity || '0'),
          unitPrice: parseFloat(item.unitPrice || '0'),
          amount: parseFloat(item.amount || '0'),
          taxRate: parseFloat(item.taxRate || '0'),
        }))
      });
    }
  }, [isEditMode, invoice, reset, navigate]);

  const watchedItems = watch('items');
  const watchedGstAmount = watch('gstAmount');
  const watchedGstType = watch('gstType');

  // Auto-calculation effect
  useEffect(() => {
    const itemsTotal = (watchedItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const newTotal = parseFloat((itemsTotal + (watchedGstAmount || 0)).toFixed(2));
    
    setValue('totalAmount', newTotal, { shouldValidate: true });
  }, [watchedItems, watchedGstAmount, setValue]);

  // GST Type switch auto-balancer
  useEffect(() => {
    if (watchedGstType === 'igst') {
      setValue('cgstAmount', 0);
      setValue('sgstAmount', 0);
      setValue('igstAmount', watchedGstAmount || 0);
    } else {
      const half = parseFloat(((watchedGstAmount || 0) / 2).toFixed(2));
      setValue('igstAmount', 0);
      setValue('cgstAmount', half);
      setValue('sgstAmount', half);
    }
  }, [watchedGstType]);

  const createMut = useMutation({ mutationFn: invoiceApi.createInvoice });
  const updateMut = useMutation({ 
    mutationFn: (params: { id: string, data: Partial<CreateInvoiceInput> }) => 
      invoiceApi.updateInvoice(params.id, params.data) 
  });
  const submitMut = useMutation({ mutationFn: invoiceApi.submitInvoice });

  const onSubmit = async (data: InvoiceFormData) => {
    const payload: CreateInvoiceInput = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      clientId: data.clientId || undefined,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      items: data.items,
    };

    if (data.gstType === 'igst') {
      payload.igstAmount = data.igstAmount;
    } else {
      payload.cgstAmount = data.cgstAmount;
      payload.sgstAmount = data.sgstAmount;
    }

    try {
      let savedInvoiceId: string;

      if (isEditMode && id) {
        const res = await updateMut.mutateAsync({ id, data: payload });
        savedInvoiceId = res.id;
      } else {
        const res = await createMut.mutateAsync(payload);
        savedInvoiceId = res.id;
      }

      if (saveMode === 'submit') {
        await submitMut.mutateAsync(savedInvoiceId);
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(saveMode === 'submit' ? 'Invoice submitted successfully' : 'Invoice saved as draft');
      navigate(`/invoices/${savedInvoiceId}`);

    } catch (error: any) {
      if (error.response?.status === 409) {
        form.setError('invoiceNumber', { type: 'manual', message: 'Invoice number already exists' });
      } else if (error.response?.status === 422) {
        toast.error('Validation failed. Please check the fields.');
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const isSubmitting = createMut.isPending || updateMut.isPending || submitMut.isPending;

  if (isEditMode && isLoadingInvoice) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            {isEditMode ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          {isEditMode && invoice && (
            <p className="text-sm text-muted-foreground mt-1">
              Editing {invoice.invoiceNumber}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">

        {/* Section 1: Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">Invoice Number <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="INV-2024-001"
                  error={errors.invoiceNumber?.message}
                  {...register('invoiceNumber')}
                />
              </div>
              <div>
                <Label className="mb-2 block">Invoice Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  error={errors.invoiceDate?.message}
                  {...register('invoiceDate')}
                />
              </div>
              <div>
                <Label className="mb-2 block">Bill To (Client)</Label>
                <Select
                  options={[
                    { value: '', label: 'Select client...' },
                    ...clients.map((c) => ({ value: c.id, label: c.name }))
                  ]}
                  error={errors.clientId?.message}
                  {...register('clientId')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>
              Add the products or services on this invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 md:px-6">
            <LineItemsSection
              items={watchedItems as CreateInvoiceItemInput[]}
              onChange={(newItems) => replace(newItems)}
              errors={errors}
            />
          </CardContent>
        </Card>

        {/* Section 3: GST Summary */}
        <Card>
          <CardHeader>
            <CardTitle>GST & Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <GSTSummarySection 
              items={watchedItems as CreateInvoiceItemInput[]}
              gstType={watchedGstType}
              onGstTypeChange={(type) => setValue('gstType', type)}
              cgstAmount={watch('cgstAmount')}
              sgstAmount={watch('sgstAmount')}
              igstAmount={watch('igstAmount')}
              gstAmount={watchedGstAmount}
              totalAmount={watch('totalAmount')}
              onChange={(field, value) => setValue(field as any, value, { shouldValidate: true })}
              errors={errors as any}
            />
          </CardContent>
        </Card>

        {/* Sticky bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-4 flex items-center justify-between gap-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] lg:pl-64 transition-all">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setSaveMode('draft')}
              className="min-w-32"
            >
              {isSubmitting && saveMode === 'draft' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save as Draft'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !hasPermission('SUBMIT_INVOICE')}
              onClick={() => setSaveMode('submit')}
              className="min-w-36"
            >
              {isSubmitting && saveMode === 'submit' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Save & Submit'}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
