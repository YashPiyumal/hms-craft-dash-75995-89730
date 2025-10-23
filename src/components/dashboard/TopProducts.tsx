import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/contexts/InventoryContext";

export const TopProducts = () => {
  const { products } = useInventory();
  
  // Get top 5 products by salesCount
  const topProducts = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  if (topProducts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => (
        <div key={product.sku} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.salesCount} sold</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
            ${product.price}
          </Badge>
        </div>
      ))}
    </div>
  );
};
