import { Progress } from "@/components/ui/progress";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ImageOff,
  Link,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ADMIN_PRODUCTS_PER_PAGE = 20;
import { OrderStatus, type Product } from "@/backend";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import {
  useAddProduct,
  useCancelOrder,
  useDeleteProduct,
  useGetAllOrders,
  useListProducts,
  useUpdateOrderStatus,
  useUpdateProductPrice,
  useUpdateProductStock,
} from "@/hooks/useQueries";

// ─── Order Status Tracker ────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: OrderStatus.pending, label: "Pending" },
  { key: OrderStatus.processing, label: "Processing" },
  { key: OrderStatus.shipped, label: "Shipped" },
  { key: OrderStatus.delivered, label: "Delivered" },
];

function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const isCancelled = status === OrderStatus.cancelled;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
          <X className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-semibold text-destructive">
            Order Cancelled
          </span>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="mt-3 w-full">
      <div className="flex items-center w-full">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-black border-black"
                      : isActive
                        ? "bg-gold border-gold shadow-md shadow-gold/40"
                        : "bg-white border-black/20"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${isPending ? "bg-black/20" : ""}`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap ${
                    isCompleted || isActive ? "text-black" : "text-black/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                    index < currentIndex ? "bg-black" : "bg-black/15"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Product Thumbnail ────────────────────────────────────────────────────────

function ProductThumbnail({
  imageUrl,
  name,
}: { imageUrl: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) {
    return (
      <div
        className="w-12 h-12 rounded-lg border border-black/15 flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "oklch(0.95 0.003 60)" }}
      >
        <ImageOff className="w-5 h-5 text-black/30" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className="w-12 h-12 rounded-lg object-cover border border-black/15 flex-shrink-0"
      onError={() => setImgError(true)}
    />
  );
}

// ─── Admin Content (rendered inside the password gate) ───────────────────────

function AdminContent() {
  const { actor, isFetching: actorLoading } = useActor();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageFile: null as File | null,
    imageUrl: "",
    category: "",
  });
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload",
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<{
    id: bigint;
    value: string;
  } | null>(null);
  const [productPage, setProductPage] = useState(1);

  const { data: products = [], isLoading: productsLoading } = useListProducts();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();
  const updatePriceMutation = useUpdateProductPrice();
  const updateStockMutation = useUpdateProductStock();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  // Build a product lookup map for order items
  const productMap = new Map<string, Product>(
    products.map((p) => [p.id.toString(), p]),
  );

  const totalProductPages = Math.max(
    1,
    Math.ceil(products.length / ADMIN_PRODUCTS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * ADMIN_PRODUCTS_PER_PAGE;
    return products.slice(start, start + ADMIN_PRODUCTS_PER_PAGE);
  }, [products, productPage]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProduct((p) => ({ ...p, imageFile: file, imageUrl: "" }));
    setImagePreview(URL.createObjectURL(file));
  }

  function handleImageUrlChange(url: string) {
    setNewProduct((p) => ({ ...p, imageUrl: url }));
    setImagePreview(url);
  }

  const [categoryError, setCategoryError] = useState(false);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    if (!newProduct.category) {
      setCategoryError(true);
      toast.error("Please select a category before adding the product.");
      return;
    }
    setCategoryError(false);
    setUploadProgress(null);
    try {
      const result = await addProductMutation.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
        price: Number.parseFloat(newProduct.price),
        imageFile: newProduct.imageFile ?? undefined,
        imageUrl: newProduct.imageUrl || undefined,
        category: newProduct.category,
        onUploadProgress: (pct) => setUploadProgress(pct),
      });
      setNewProduct({
        name: "",
        description: "",
        price: "",
        imageFile: null,
        imageUrl: "",
        category: "",
      });
      setImagePreview("");
      setUploadProgress(null);
      if (result.imageUploadFailed) {
        toast.warning(
          "Product saved! Image upload failed — you can add a photo later by re-adding the product.",
        );
      } else {
        toast.success("Product added successfully!");
      }
    } catch (err) {
      console.error("Add product error:", err);
      setUploadProgress(null);
      const errMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast.error(`Failed to add product: ${errMsg}. Please try again.`);
    }
  }

  async function handleDeleteProduct(id: bigint) {
    await deleteProductMutation.mutateAsync(id);
  }

  async function handleSavePrice(id: bigint) {
    if (!editingPrice) return;
    await updatePriceMutation.mutateAsync({
      id,
      newPrice: Number.parseFloat(editingPrice.value),
    });
    setEditingPrice(null);
  }

  async function handleToggleStock(product: Product) {
    await updateStockMutation.mutateAsync({
      id: product.id,
      inStock: !product.inStock,
    });
  }

  async function handleOrderStatusChange(
    orderId: bigint,
    newStatus: OrderStatus,
  ) {
    await updateOrderStatusMutation.mutateAsync({ orderId, newStatus });
  }

  async function handleCancelOrder(orderId: bigint) {
    await cancelOrderMutation.mutateAsync(orderId);
  }

  function getStatusBadgeVariant(
    status: OrderStatus,
  ): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
      case OrderStatus.delivered:
        return "default";
      case OrderStatus.shipped:
        return "secondary";
      case OrderStatus.processing:
        return "outline";
      case OrderStatus.cancelled:
        return "destructive";
      default:
        return "outline";
    }
  }

  function formatOrderStatus(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ── Category counts ───────────────────────────────────────────────────────

  const CATEGORIES = ["Necklace", "Bangle", "Earrings", "Fingering"] as const;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Necklace: 0,
      Bangle: 0,
      Earrings: 0,
      Fingering: 0,
    };
    for (const p of products) {
      const cat = p.category;
      if (cat in counts) counts[cat]++;
    }
    return counts;
  }, [products]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (actorLoading && !actor) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "oklch(0.98 0.003 60)" }}
        data-ocid="admin.backend.loading_state"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-3" />
          <p className="text-black/60 font-semibold">Connecting to backend…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.98 0.003 60)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black font-display">
            Admin Panel
          </h1>
          <p className="text-black/60 mt-1 font-body font-semibold">
            Manage your products and orders
          </p>
        </div>

        {/* Product Count Summary */}
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6"
          data-ocid="admin.product_counts.section"
        >
          {CATEGORIES.map((cat) => (
            <Card
              key={cat}
              className="border-2 border-black/15 bg-white shadow-sm"
            >
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1">
                  {cat}
                </p>
                <p className="text-3xl font-extrabold text-black font-display">
                  {categoryCounts[cat]}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-2 border-black bg-black shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">
                Total
              </p>
              <p className="text-3xl font-extrabold text-white font-display">
                {products.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList
            className="mb-6"
            style={{ backgroundColor: "oklch(0.95 0.003 60)" }}
          >
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="flex items-center gap-2 text-black data-[state=active]:bg-black data-[state=active]:text-white font-semibold"
            >
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders.tab"
              className="flex items-center gap-2 text-black data-[state=active]:bg-black data-[state=active]:text-white font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
              {orders.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs bg-gray-200 text-black font-bold"
                >
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Product Form */}
              <Card className="lg:col-span-1 border-2 border-black/15 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-black font-bold font-display">
                    <Plus className="w-5 h-5 text-gold" />
                    Add Product
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-3">
                    <Input
                      placeholder="Product name *"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, name: e.target.value }))
                      }
                      data-ocid="admin.product.name.input"
                      className="bg-gray-50 border-black/20 text-black placeholder:text-black/40"
                      required
                    />
                    <Input
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      data-ocid="admin.product.description.input"
                      className="bg-gray-50 border-black/20 text-black placeholder:text-black/40"
                    />
                    <Input
                      placeholder="Price (€) *"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, price: e.target.value }))
                      }
                      data-ocid="admin.product.price.input"
                      className="bg-gray-50 border-black/20 text-black placeholder:text-black/40"
                      required
                    />
                    <div className="space-y-1">
                      <Select
                        value={newProduct.category}
                        onValueChange={(val) => {
                          setNewProduct((p) => ({ ...p, category: val }));
                          setCategoryError(false);
                        }}
                      >
                        <SelectTrigger
                          data-ocid="admin.product.category.select"
                          className={`bg-gray-50 text-black transition-colors ${
                            categoryError
                              ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                              : "border-black/20"
                          }`}
                        >
                          <SelectValue placeholder="Select Category *" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-black/20">
                          <SelectItem value="Necklace">Necklace</SelectItem>
                          <SelectItem value="Bangle">Bangle</SelectItem>
                          <SelectItem value="Earrings">Earrings</SelectItem>
                          <SelectItem value="Fingering">Fingering</SelectItem>
                        </SelectContent>
                      </Select>
                      {categoryError && (
                        <p
                          className="text-xs text-red-600 font-semibold"
                          data-ocid="admin.product.category.error_state"
                        >
                          Category is required
                        </p>
                      )}
                    </div>

                    {/* Image input mode toggle */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          imageInputMode === "upload" ? "default" : "outline"
                        }
                        className={
                          imageInputMode === "upload"
                            ? "bg-black text-white hover:bg-neutral-800 font-semibold"
                            : "border-black/30 text-black hover:bg-black/10 font-semibold"
                        }
                        onClick={() => setImageInputMode("upload")}
                        data-ocid="admin.image.upload_button"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          imageInputMode === "url" ? "default" : "outline"
                        }
                        className={
                          imageInputMode === "url"
                            ? "bg-black text-white hover:bg-neutral-800 font-semibold"
                            : "border-black/30 text-black hover:bg-black/10 font-semibold"
                        }
                        onClick={() => setImageInputMode("url")}
                      >
                        <Link className="w-3.5 h-3.5 mr-1" />
                        URL
                      </Button>
                    </div>

                    {imageInputMode === "upload" ? (
                      <div
                        className="border-2 border-dashed border-black/25 rounded-lg p-3 text-center cursor-pointer hover:border-black/50 transition-colors"
                        style={{ backgroundColor: "oklch(0.96 0.03 84)" }}
                        data-ocid="admin.image.dropzone"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="product-image-upload"
                          onChange={handleImageFileChange}
                        />
                        <label
                          htmlFor="product-image-upload"
                          className="cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-black/40 mx-auto mb-1" />
                          <p className="text-xs text-black/55 font-semibold">
                            Tap to upload from photo library
                          </p>
                        </label>
                      </div>
                    ) : (
                      <Input
                        placeholder="Image URL"
                        value={newProduct.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="bg-gray-50 border-black/20 text-black placeholder:text-black/40"
                      />
                    )}

                    {/* Image preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border border-black/15"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => {
                            setImagePreview("");
                            setNewProduct((p) => ({
                              ...p,
                              imageFile: null,
                              imageUrl: "",
                            }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Upload progress */}
                    {uploadProgress !== null && (
                      <div
                        className="space-y-1"
                        data-ocid="admin.product.loading_state"
                      >
                        <p className="text-xs font-semibold text-black/60">
                          Uploading image… {Math.round(uploadProgress)}%
                        </p>
                        <Progress
                          value={uploadProgress}
                          className="h-1.5 bg-black/10 [&>div]:bg-black"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      data-ocid="admin.product.submit_button"
                      className="w-full bg-black text-white hover:bg-neutral-800 font-bold font-display tracking-widest disabled:opacity-50"
                      disabled={
                        addProductMutation.isPending || (!actor && actorLoading)
                      }
                    >
                      {addProductMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {uploadProgress !== null ? "Uploading…" : "Adding…"}
                        </span>
                      ) : !actor && actorLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting…
                        </span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Products List */}
              <div className="lg:col-span-2 space-y-3">
                {productsLoading ? (
                  <div
                    className="flex items-center justify-center py-12"
                    data-ocid="admin.products.loading_state"
                  >
                    <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  </div>
                ) : products.length === 0 ? (
                  <Card className="border-2 border-black/15 bg-white">
                    <CardContent
                      className="py-12 text-center text-black/55 font-semibold"
                      data-ocid="admin.products.empty_state"
                    >
                      No products yet. Add your first product!
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {paginatedProducts.map((product) => (
                      <Card
                        key={product.id.toString()}
                        className="border-2 border-black/15 bg-white shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Product thumbnail */}
                            <ProductThumbnail
                              imageUrl={product.imageUrl}
                              name={product.name}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-black truncate font-display">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-black/55 truncate font-semibold">
                                    {product.category}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`text-xs h-7 px-2 font-bold ${
                                      product.inStock
                                        ? "border-green-600 text-green-800 hover:bg-green-50 bg-green-50"
                                        : "border-red-500 text-red-700 hover:bg-red-50 bg-red-50"
                                    }`}
                                    onClick={() => handleToggleStock(product)}
                                    disabled={updateStockMutation.isPending}
                                  >
                                    {product.inStock
                                      ? "In Stock"
                                      : "Out of Stock"}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-7 h-7 text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    disabled={deleteProductMutation.isPending}
                                    data-ocid="admin.product.delete_button"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Price editing */}
                              <div className="flex items-center gap-2 mt-2">
                                {editingPrice?.id === product.id ? (
                                  <>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editingPrice.value}
                                      onChange={(e) =>
                                        setEditingPrice({
                                          id: product.id,
                                          value: e.target.value,
                                        })
                                      }
                                      className="h-7 w-24 text-sm bg-gray-50 border-black/20 text-black"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-7 h-7 text-green-700 hover:bg-green-50"
                                      onClick={() =>
                                        handleSavePrice(product.id)
                                      }
                                      disabled={updatePriceMutation.isPending}
                                      data-ocid="admin.product.save_button"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-7 h-7 text-black/50 hover:bg-black/10"
                                      onClick={() => setEditingPrice(null)}
                                      data-ocid="admin.product.cancel_button"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-bold text-gold">
                                      €{product.price.toFixed(2)}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-6 h-6 text-black/45 hover:text-black"
                                      onClick={() =>
                                        setEditingPrice({
                                          id: product.id,
                                          value: product.price.toString(),
                                        })
                                      }
                                      data-ocid="admin.product.edit_button"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Admin Products Pagination */}
                    {totalProductPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProductPage((p) => Math.max(1, p - 1))
                          }
                          disabled={productPage === 1}
                          className="border-black/30 hover:bg-black/10 text-black font-semibold"
                          data-ocid="admin.products.pagination_prev"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Prev
                        </Button>
                        <span className="text-sm text-black/60 font-semibold">
                          {productPage} / {totalProductPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProductPage((p) =>
                              Math.min(totalProductPages, p + 1),
                            )
                          }
                          disabled={productPage === totalProductPages}
                          className="border-black/30 hover:bg-black/10 text-black font-semibold"
                          data-ocid="admin.products.pagination_next"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Orders Tab ───────────────────────────────────────────────── */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.orders.loading_state"
              >
                <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-2 border-black/15 bg-white">
                <CardContent
                  className="py-12 text-center text-black/55 font-semibold"
                  data-ocid="admin.orders.empty_state"
                >
                  No orders yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {[...orders]
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map((order) => (
                    <Card
                      key={order.id.toString()}
                      className="border-2 border-black/15 bg-white shadow-sm"
                    >
                      <CardContent className="p-5">
                        {/* Order header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black font-display">
                                Order #{order.id.toString()}
                              </span>
                              <Badge
                                variant={getStatusBadgeVariant(order.status)}
                              >
                                {formatOrderStatus(order.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-black/55 mt-0.5 font-semibold">
                              {new Date(
                                Number(order.timestamp) / 1_000_000,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gold text-lg">
                              €{order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Status tracker */}
                        <OrderStatusTracker status={order.status} />

                        <Separator className="my-4 bg-black/10" />

                        {/* Customer info */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                          <div>
                            <span className="text-black/50 text-xs font-bold uppercase tracking-wide">
                              Customer
                            </span>
                            <p className="font-semibold text-black">
                              {order.customerInfo.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-black/50 text-xs font-bold uppercase tracking-wide">
                              Phone
                            </span>
                            <p className="font-semibold text-black">
                              {order.customerInfo.phone}
                            </p>
                          </div>
                          <div>
                            <span className="text-black/50 text-xs font-bold uppercase tracking-wide">
                              Country
                            </span>
                            <p className="font-semibold text-black">
                              {order.customerInfo.country}
                            </p>
                          </div>
                          <div>
                            <span className="text-black/50 text-xs font-bold uppercase tracking-wide">
                              Address
                            </span>
                            <p className="font-semibold text-black">
                              {order.customerInfo.address}
                            </p>
                          </div>
                        </div>

                        {/* Order items with thumbnails */}
                        <div className="space-y-2 mb-4">
                          <p className="text-xs font-bold text-black/55 uppercase tracking-wide">
                            Items
                          </p>
                          {order.items.map(([productId, quantity], idx) => {
                            const product = productMap.get(
                              productId.toString(),
                            );
                            return (
                              <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: order items have no stable key
                                key={idx}
                                className="flex items-center gap-3 p-2 rounded-lg border border-black/10"
                                style={{
                                  backgroundColor: "oklch(0.96 0.03 84)",
                                }}
                              >
                                <ProductThumbnail
                                  imageUrl={product?.imageUrl ?? ""}
                                  name={
                                    product?.name ?? `Product #${productId}`
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-black truncate">
                                    {product?.name ??
                                      `Product #${productId.toString()}`}
                                  </p>
                                  {product?.category && (
                                    <p className="text-xs text-black/55 font-semibold">
                                      {product.category}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-bold text-gold">
                                    {product
                                      ? `€${product.price.toFixed(2)}`
                                      : ""}
                                  </p>
                                  <p className="text-xs text-black/55 font-semibold">
                                    Qty: {quantity.toString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Status controls */}
                        {order.status !== OrderStatus.cancelled && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(val) =>
                                handleOrderStatusChange(
                                  order.id,
                                  val as OrderStatus,
                                )
                              }
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger
                                data-ocid="admin.order.status.select"
                                className="w-40 h-8 text-sm border-black/25 text-black bg-white font-semibold"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-black/20">
                                <SelectItem value={OrderStatus.pending}>
                                  Pending
                                </SelectItem>
                                <SelectItem value={OrderStatus.processing}>
                                  Processing
                                </SelectItem>
                                <SelectItem value={OrderStatus.shipped}>
                                  Shipped
                                </SelectItem>
                                <SelectItem value={OrderStatus.delivered}>
                                  Delivered
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancelOrderMutation.isPending}
                              data-ocid="admin.order.cancel_button"
                            >
                              {cancelOrderMutation.isPending ? (
                                <div className="w-3 h-3 border border-destructive/30 border-t-destructive rounded-full animate-spin mr-1" />
                              ) : (
                                <X className="w-3 h-3 mr-1" />
                              )}
                              Cancel Order
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Admin Page (wrapped in password gate) ───────────────────────────────────

export default function Admin() {
  return (
    <AdminPasswordGate>
      <AdminContent />
    </AdminPasswordGate>
  );
}
