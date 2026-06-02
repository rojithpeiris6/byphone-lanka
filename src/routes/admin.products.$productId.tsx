import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/products/$productId")({
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate({ to: "/admin/products" });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleClose}
          className="p-2 rounded-xl hover:bg-accent border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground mt-1">Update product details and variations.</p>
        </div>
      </div>

      <ProductForm 
        productId={productId}
        onClose={handleClose}
        onSuccess={handleClose}
      />
    </div>
  );
}
