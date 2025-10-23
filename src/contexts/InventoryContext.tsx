import React, { createContext, useContext, useState } from "react";

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number; // buying/wholesale price
  stock: number;
  status: string;
  salesCount: number; // total units sold
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (sku: string, updates: Partial<Product>) => void;
  reduceStock: (items: { id: string; quantity: number }[]) => boolean;
  getProduct: (sku: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    sku: "P1001",
    name: "Power Drill Kit",
    category: "tools",
    price: 129.99,
    cost: 85.00,
    stock: 25,
    status: "in-stock",
    salesCount: 45,
  },
  {
    sku: "E2034",
    name: "LED Bulbs (4-Pack)",
    category: "lighting",
    price: 15.5,
    cost: 10.00,
    stock: 8,
    status: "low-stock",
    salesCount: 120,
  },
  {
    sku: "H4012",
    name: "Hammer (16 oz)",
    category: "hand-tools",
    price: 25.0,
    cost: 16.00,
    stock: 50,
    status: "in-stock",
    salesCount: 8,
  },
  {
    sku: "G5151",
    name: "Safety Goggles",
    category: "safety",
    price: 9.75,
    cost: 6.50,
    stock: 0,
    status: "out-of-stock",
    salesCount: 3,
  },
  {
    sku: "P2045",
    name: "Cordless Screwdriver",
    category: "tools",
    price: 79.99,
    cost: 52.00,
    stock: 15,
    status: "in-stock",
    salesCount: 28,
  },
  {
    sku: "L3021",
    name: "Flashlight LED",
    category: "lighting",
    price: 24.99,
    cost: 16.00,
    stock: 32,
    status: "in-stock",
    salesCount: 15,
  },
  {
    sku: "W2010",
    name: "Wood Screws (Box)",
    category: "hardware",
    price: 12.99,
    cost: 8.50,
    stock: 100,
    status: "in-stock",
    salesCount: 5,
  },
  {
    sku: "T4500",
    name: "Tape Measure",
    category: "hand-tools",
    price: 18.5,
    cost: 12.00,
    stock: 42,
    status: "in-stock",
    salesCount: 22,
  },
  {
    sku: "P3050",
    name: "Exterior Paint",
    category: "paint",
    price: 45.0,
    cost: 30.00,
    stock: 30,
    status: "in-stock",
    salesCount: 18,
  },
];

const getProductStatus = (stock: number): string => {
  if (stock === 0) return "out-of-stock";
  if (stock <= 10) return "low-stock";
  return "in-stock";
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (sku: string, updates: Partial<Product>) => {
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
  };

  const reduceStock = (items: { id: string; quantity: number }[]): boolean => {
    // First, check if all items have sufficient stock
    for (const item of items) {
      const product = products.find((p) => p.sku === item.id);
      if (!product || product.stock < item.quantity) {
        return false; // Insufficient stock
      }
    }

    // If all checks pass, reduce the stock and increment sales count
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const soldItem = items.find((item) => item.id === product.sku);
        if (soldItem) {
          const newStock = product.stock - soldItem.quantity;
          return {
            ...product,
            stock: newStock,
            status: getProductStatus(newStock),
            salesCount: product.salesCount + soldItem.quantity,
          };
        }
        return product;
      })
    );

    return true;
  };

  const getProduct = (sku: string) => {
    return products.find((p) => p.sku === sku);
  };

  return (
    <InventoryContext.Provider
      value={{ products, addProduct, updateProduct, reduceStock, getProduct }}
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
