import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Product } from "./ProductDialog";
import { useCurrency } from "@/hooks/useCurrency";

interface InventoryTableProps {
  products: Product[];
  searchTerm: string;
  categoryFilter: string;
  onEditProduct: (product: Product) => void;
}

export const InventoryTable = ({
  products,
  searchTerm,
  categoryFilter,
  onEditProduct,
}: InventoryTableProps) => {
  const { formatCurrency } = useCurrency();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "in-stock") {
      return <Badge variant="secondary" className="bg-success/10 text-success">In Stock</Badge>;
    } else if (status === "low-stock") {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">Low Stock</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Out of Stock</Badge>;
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.sku}>
              <TableCell className="font-medium">{product.sku}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className="capitalize">{product.category.replace("-", " ")}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
