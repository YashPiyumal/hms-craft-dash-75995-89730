import { DollarSign, TrendingUp, Package, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { LowSellingProducts } from "@/components/dashboard/LowSellingProducts";
import { LowStockItems } from "@/components/dashboard/LowStockItems";
import { LowSalesProducts } from "@/components/dashboard/LowSalesProducts";
import { Layout } from "@/components/Layout";
import { useInventory } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { products } = useInventory();
  const { user } = useAuth();
  const [adminName, setAdminName] = useState("Admin");
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchSalesData();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.full_name) {
      setAdminName(data.full_name);
    }
  };

  const fetchSalesData = async () => {
    const { data } = await supabase
      .from('sales_transactions')
      .select('profit_amount, total_amount');

    if (data) {
      const profit = data.reduce((sum, sale) => sum + parseFloat(sale.profit_amount.toString()), 0);
      const sales = data.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString()), 0);
      setTotalProfit(profit);
      setTotalSales(sales);
    }
  };
  
  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back, {adminName}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Sales"
            value={`$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend={`${totalInventoryCost > 0 ? ((totalSales / totalInventoryCost) * 100).toFixed(1) : 0}% of inventory`}
            trendUp={true}
          />
          <MetricCard
            title="Actual Profit"
            value={`$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            trend={`${totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}% margin`}
            trendUp={true}
          />
          <MetricCard
            title="Low Stock Items"
            value={lowStockCount.toString()}
            icon={Package}
            trend="Needs attention"
            trendUp={false}
          />
          <MetricCard
            title="Total Products"
            value={products.length.toString()}
            icon={Users}
            trend="In catalog"
            trendUp={true}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProducts />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Low Profit Margin</CardTitle>
              <CardDescription>Products with lower profit margins</CardDescription>
            </CardHeader>
            <CardContent>
              <LowSellingProducts />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Sales Volume</CardTitle>
              <CardDescription>Products selling in low quantity</CardDescription>
            </CardHeader>
            <CardContent>
              <LowSalesProducts />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <LowStockItems />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
