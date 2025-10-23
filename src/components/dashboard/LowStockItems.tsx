import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/contexts/InventoryContext";
import { AlertTriangle } from "lucide-react";

export const LowStockItems = () => {
  const { products } = useInventory();
  
  // Get products with low stock or out of stock
  const lowStockProducts = products
    .filter(p => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    if (stock <= 5) return "bg-warning/10 text-warning hover:bg-warning/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {lowStockProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground">All products are well stocked!</p>
      ) : (
        lowStockProducts.map((product, index) => (
          <div key={product.sku} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              </div>
            </div>
            <Badge variant="secondary" className={getStatusColor(product.stock)}>
              {product.stock} in stock
            </Badge>
          </div>
        ))
      )}
    </div>
  );
};
