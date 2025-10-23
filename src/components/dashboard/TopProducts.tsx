import { Badge } from "@/components/ui/badge";

const products = [
  { name: "Power Drill Kit", sales: 156, trend: "+12%" },
  { name: "LED Bulbs (Pack of 4)", sales: 142, trend: "+8%" },
  { name: "Exterior Paint (1 Gallon)", sales: 128, trend: "+15%" },
  { name: "Hammer (16 oz)", sales: 98, trend: "+5%" },
  { name: "Safety Goggles", sales: 87, trend: "+3%" },
];

export const TopProducts = () => {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sales} sold</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
            {product.trend}
          </Badge>
        </div>
      ))}
    </div>
  );
};
