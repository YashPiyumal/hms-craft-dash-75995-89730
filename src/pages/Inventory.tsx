import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ProductDialog, ProductFormData, Product } from "@/components/inventory/ProductDialog";
import { Layout } from "@/components/Layout";
import { useInventory } from "@/contexts/InventoryContext";
import { toast } from "sonner";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, addProduct, updateProduct } = useInventory();

  const getProductStatus = (stock: number): string => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 10) return "low-stock";
    return "in-stock";
  };

  const handleAddProduct = (data: ProductFormData) => {
    const newProduct: Product = {
      sku: data.sku,
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      stock: parseInt(data.stock),
      status: getProductStatus(parseInt(data.stock)),
      salesCount: 0,
    };
    
    addProduct(newProduct);
    setDialogOpen(false);
    toast.success("Product added successfully!");
  };

  const handleEditProduct = (data: ProductFormData) => {
    updateProduct(data.sku, {
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      stock: parseInt(data.stock),
    });
    setDialogOpen(false);
    setSelectedProduct(null);
    toast.success("Product updated successfully!");
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setDialogMode("edit");
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="lighting">Lighting</SelectItem>
              <SelectItem value="hand-tools">Hand Tools</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InventoryTable
          products={products}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          onEditProduct={openEditDialog}
        />

        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={dialogMode === "add" ? handleAddProduct : handleEditProduct}
          product={selectedProduct}
          mode={dialogMode}
        />
      </div>
    </Layout>
  );
};

export default Inventory;
