import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/contexts/InventoryContext";
import { TrendingDown } from "lucide-react";

export const LowSellingProducts = () => {
  const { products } = useInventory();
  
  // Get products with low profit margins (potential low sellers)
  const lowSellingProducts = products
    .map(p => ({
      ...p,
      profitMargin: ((p.price - p.cost) / p.price) * 100
    }))
    .filter(p => p.stock > 0) // Only show in-stock items
    .sort((a, b) => a.profitMargin - b.profitMargin)
    .slice(0, 5);

  const getMarginColor = (margin: number) => {
    if (margin < 20) return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    if (margin < 35) return "bg-warning/10 text-warning hover:bg-warning/20";
    return "bg-success/10 text-success hover:bg-success/20";
  };

  return (
    <div className="space-y-4">
      {lowSellingProducts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products to display</p>
      ) : (
        lowSellingProducts.map((product, index) => (
          <div key={product.sku} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Profit: ${(product.price - product.cost).toFixed(2)} per unit
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={getMarginColor(product.profitMargin)}>
              {product.profitMargin.toFixed(1)}% margin
            </Badge>
          </div>
        ))
      )}
    </div>
  );
};
