import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  status: string;
  salesCount: number;
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (sku: string, updates: Partial<Product>) => void;
  reduceStock: (items: { id: string; quantity: number }[]) => boolean;
  getProduct: (sku: string) => Product | undefined;
  loading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const getProductStatus = (stock: number): string => {
  if (stock === 0) return "out-of-stock";
  if (stock <= 10) return "low-stock";
  return "in-stock";
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load products from database
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (error) throw error;

        const formattedProducts: Product[] = (data || []).map(p => ({
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          cost: Number(p.cost),
          stock: p.stock,
          status: getProductStatus(p.stock),
          salesCount: p.sales_count
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addProduct = async (product: Product) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          sku: product.sku,
          user_id: user.id,
          name: product.name,
          category: product.category,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          sales_count: 0
        }]);

      if (error) throw error;

      // Optimistically update local state
      setProducts([...products, product]);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (sku: string, updates: Partial<Product>) => {
    if (!user) return;

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.salesCount !== undefined) dbUpdates.sales_count = updates.salesCount;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('sku', sku);

      if (error) throw error;

      // Optimistically update local state
      setProducts(
        products.map((product) =>
          product.sku === sku
            ? {
                ...product,
                ...updates,
                status: updates.stock !== undefined ? getProductStatus(updates.stock) : product.status,
              }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const reduceStock = (items: { id: string; quantity: number }[]): boolean => {
    // First, check if all items have sufficient stock
    for (const item of items) {
      const product = products.find((p) => p.sku === item.id);
      if (!product || product.stock < item.quantity) {
        return false;
      }
    }

    // Update stock in database
    items.forEach(async (item) => {
      const product = products.find((p) => p.sku === item.id);
      if (product) {
        const newStock = product.stock - item.quantity;
        const newSalesCount = product.salesCount + item.quantity;

        try {
          const { error } = await supabase
            .from('products')
            .update({
              stock: newStock,
              sales_count: newSalesCount
            })
            .eq('sku', item.id);

          if (error) throw error;

          // Optimistically update local state
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.sku === item.id
                ? {
                    ...p,
                    stock: newStock,
                    status: getProductStatus(newStock),
                    salesCount: newSalesCount,
                  }
                : p
            )
          );
        } catch (error) {
          console.error('Error reducing stock:', error);
          toast.error('Failed to update inventory');
        }
      }
    });

    return true;
  };

  const getProduct = (sku: string) => {
    return products.find((p) => p.sku === sku);
  };

  return (
    <InventoryContext.Provider
      value={{ products, addProduct, updateProduct, reduceStock, getProduct, loading }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
