import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Trash2, Plus, Minus, Receipt, Download } from "lucide-react";
import { CartItem } from "@/pages/POS";
import { useInventory } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface BillSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
}

export const BillSection = ({ cart, onUpdateQuantity, onClearCart }: BillSectionProps) => {
  const [customer, setCustomer] = useState("");
  const { reduceStock, products } = useInventory();
  const { user } = useAuth();
  const { settings } = useStore();
  const { formatCurrency } = useCurrency();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const generatePDF = () => {
    const doc = new jsPDF();
    const storeName = settings?.store_name || 'My Store';
    const currentDate = new Date().toLocaleString();

    // Header
    doc.setFontSize(20);
    doc.text(storeName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Invoice', 105, 30, { align: 'center' });
    doc.text(`Date: ${currentDate}`, 105, 35, { align: 'center' });
    
    if (customer) {
      doc.text(`Customer: ${customer}`, 20, 45);
    }

    // Items header
    doc.setFontSize(12);
    doc.text('Item', 20, 55);
    doc.text('Qty', 120, 55);
    doc.text('Price', 150, 55);
    doc.text('Total', 180, 55);
    
    doc.line(20, 57, 190, 57);

    // Items
    doc.setFontSize(10);
    let yPos = 65;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      doc.text(item.name.substring(0, 30), 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(formatCurrency(item.price), 150, yPos);
      doc.text(formatCurrency(itemTotal), 180, yPos);
      yPos += 8;
    });

    // Totals
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    doc.text('Subtotal:', 150, yPos);
    doc.text(formatCurrency(subtotal), 180, yPos);
    yPos += 8;
    
    doc.text('Tax (5%):', 150, yPos);
    doc.text(formatCurrency(tax), 180, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 150, yPos);
    doc.text(formatCurrency(total), 180, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Download
    doc.save(`invoice-${new Date().getTime()}.pdf`);
    toast.success('Invoice downloaded successfully!');
  };

  const handleGenerateInvoice = async (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // Attempt to reduce stock
    const success = reduceStock(cart);
    
    if (!success) {
      toast.error("Insufficient stock for one or more items!");
      return;
    }

    // Calculate profit
    const costAmount = cart.reduce((sum, item) => {
      const product = products.find(p => p.sku === item.id);
      return sum + (product?.cost || 0) * item.quantity;
    }, 0);

    const profitAmount = subtotal - costAmount;

    // Record transaction
    try {
      const { error } = await supabase
        .from('sales_transactions')
        .insert([{
          user_id: user?.id!,
          total_amount: total,
          cost_amount: costAmount,
          profit_amount: profitAmount,
          items: cart as any
        }]);

      if (error) throw error;

      toast.success(`Invoice generated! Payment: ${paymentMethod}. Stock updated.`);
      onClearCart();
      setCustomer("");
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Sale completed but failed to record transaction');
    }
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Current Bill</CardTitle>
        <div className="space-y-2 pt-2">
          <Label htmlFor="customer">Customer</Label>
          <Input
            id="customer"
            placeholder="Search or add customer..."
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items in cart
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-medium w-20 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (5%):</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleGenerateInvoice("Cash")}
            disabled={cart.length === 0}
          >
            <Banknote className="h-4 w-4" />
            Cash
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleGenerateInvoice("Card")}
            disabled={cart.length === 0}
          >
            <CreditCard className="h-4 w-4" />
            Card
          </Button>
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => handleGenerateInvoice("Invoice")}
          disabled={cart.length === 0}
        >
          <Receipt className="h-4 w-4" />
          Generate Invoice
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={generatePDF}
          disabled={cart.length === 0}
        >
          <Download className="h-4 w-4" />
          Download Bill as PDF
        </Button>
      </CardContent>
    </Card>
  );
};
