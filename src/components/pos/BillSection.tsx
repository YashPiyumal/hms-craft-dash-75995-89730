import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Trash2, Plus, Minus, Receipt } from "lucide-react";
import { CartItem } from "@/pages/POS";
import { useInventory } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BillSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
}

export const BillSection = ({ cart, onUpdateQuantity, onClearCart }: BillSectionProps) => {
  const [customer, setCustomer] = useState("");
  const { reduceStock, products } = useInventory();
  const { user } = useAuth();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

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
                    ${item.price.toFixed(2)} each
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
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (5%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
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
      </CardContent>
    </Card>
  );
};
