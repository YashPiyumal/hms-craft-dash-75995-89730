import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/contexts/InventoryContext";
import { TrendingDown } from "lucide-react";

export const LowSalesProducts = () => {
  const { products } = useInventory();
  
  // Get products with lowest sales count
  const lowSalesProducts = products
    .filter(p => p.stock > 0) // Only show available products
    .sort((a, b) => a.salesCount - b.salesCount)
    .slice(0, 5);

  const getSalesColor = (salesCount: number) => {
    if (salesCount < 10) return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    if (salesCount < 25) return "bg-warning/10 text-warning hover:bg-warning/20";
    return "bg-success/10 text-success hover:bg-success/20";
  };

  return (
    <div className="space-y-4">
      {lowSalesProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products to display</p>
      ) : (
        lowSalesProducts.map((product) => (
          <div key={product.sku} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${product.price.toFixed(2)} • {product.stock} in stock
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={getSalesColor(product.salesCount)}>
              {product.salesCount} sold
            </Badge>
          </div>
        ))
      )}
    </div>
  );
};
