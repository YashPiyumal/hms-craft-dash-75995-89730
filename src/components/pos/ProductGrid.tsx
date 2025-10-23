import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInventory } from "@/contexts/InventoryContext";
import { useCurrency } from "@/hooks/useCurrency";

interface ProductGridProps {
  searchTerm: string;
  onAddToCart: (product: { id: string; name: string; price: number }) => void;
}

export const ProductGrid = ({ searchTerm, onAddToCart }: ProductGridProps) => {
  const { products } = useInventory();
  const { formatCurrency } = useCurrency();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <Card
          key={product.sku}
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => onAddToCart({ id: product.sku, name: product.name, price: product.price })}
        >
          <CardContent className="p-4 space-y-3">
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <p className="text-lg font-bold text-primary mt-1">
                {formatCurrency(product.price)}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                Stock: {product.stock}
              </Badge>
            </div>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart({ id: product.sku, name: product.name, price: product.price });
              }}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
