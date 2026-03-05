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
                      ? "bg-gold border-gold"
                      : isActive
                        ? "bg-gold border-gold shadow-md shadow-gold/40"
                        : "bg-background border-border"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${isPending ? "bg-muted-foreground/30" : ""}`}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    isCompleted || isActive
                      ? "text-gold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                    index < currentIndex ? "bg-gold" : "bg-border"
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
      <div className="w-12 h-12 rounded-lg border border-gold/20 bg-gold/5 flex items-center justify-center flex-shrink-0">
        <ImageOff className="w-5 h-5 text-gold/40" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className="w-12 h-12 rounded-lg object-cover border border-gold/20 flex-shrink-0"
      onError={() => setImgError(true)}
    />
  );
}

// ─── Admin Content (rendered inside the password gate) ───────────────────────

function AdminContent() {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
  });
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload",
  );
  const [imagePreview, setImagePreview] = useState<string>("");
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setNewProduct((p) => ({ ...p, imageUrl: dataUrl }));
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleImageUrlChange(url: string) {
    setNewProduct((p) => ({ ...p, imageUrl: url }));
    setImagePreview(url);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    await addProductMutation.mutateAsync({
      name: newProduct.name,
      description: newProduct.description,
      price: Number.parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl,
      category: newProduct.category,
    });
    setNewProduct({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
    });
    setImagePreview("");
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and orders
          </p>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
              {orders.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Product Form */}
              <Card className="lg:col-span-1 border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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
                    />
                    <Input
                      placeholder="Price (€) *"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, price: e.target.value }))
                      }
                      required
                    />
                    <Input
                      placeholder="Category"
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          category: e.target.value,
                        }))
                      }
                    />

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
                            ? "bg-gold text-white hover:bg-gold/90"
                            : ""
                        }
                        onClick={() => setImageInputMode("upload")}
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
                            ? "bg-gold text-white hover:bg-gold/90"
                            : ""
                        }
                        onClick={() => setImageInputMode("url")}
                      >
                        <Link className="w-3.5 h-3.5 mr-1" />
                        URL
                      </Button>
                    </div>

                    {imageInputMode === "upload" ? (
                      <div className="border-2 border-dashed border-gold/30 rounded-lg p-3 text-center cursor-pointer hover:border-gold/60 transition-colors">
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
                          <Upload className="w-6 h-6 text-gold/50 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">
                            Tap to upload from photo library
                          </p>
                        </label>
                      </div>
                    ) : (
                      <Input
                        placeholder="Image URL"
                        value={newProduct.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                    )}

                    {/* Image preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border border-gold/20"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => {
                            setImagePreview("");
                            setNewProduct((p) => ({ ...p, imageUrl: "" }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gold text-white hover:bg-gold/90"
                      disabled={addProductMutation.isPending}
                    >
                      {addProductMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Adding...
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
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  </div>
                ) : products.length === 0 ? (
                  <Card className="border-gold/20">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No products yet. Add your first product!
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {paginatedProducts.map((product) => (
                      <Card
                        key={product.id.toString()}
                        className="border-gold/20"
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
                                  <h3 className="font-semibold text-foreground truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {product.category}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`text-xs h-7 px-2 ${
                                      product.inStock
                                        ? "border-green-500/50 text-green-600 hover:bg-green-50"
                                        : "border-red-400/50 text-red-500 hover:bg-red-50"
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
                                      className="h-7 w-24 text-sm"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-7 h-7 text-green-600"
                                      onClick={() =>
                                        handleSavePrice(product.id)
                                      }
                                      disabled={updatePriceMutation.isPending}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-7 h-7 text-muted-foreground"
                                      onClick={() => setEditingPrice(null)}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-semibold text-gold">
                                      €{product.price.toFixed(2)}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="w-6 h-6 text-muted-foreground hover:text-gold"
                                      onClick={() =>
                                        setEditingPrice({
                                          id: product.id,
                                          value: product.price.toString(),
                                        })
                                      }
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
                          className="border-gold/30 hover:bg-gold/10"
                          data-ocid="admin.products.pagination_prev"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Prev
                        </Button>
                        <span className="text-sm text-muted-foreground">
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
                          className="border-gold/30 hover:bg-gold/10"
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
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="border-gold/20">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No orders yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {[...orders]
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map((order) => (
                    <Card key={order.id.toString()} className="border-gold/20">
                      <CardContent className="p-5">
                        {/* Order header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">
                                Order #{order.id.toString()}
                              </span>
                              <Badge
                                variant={getStatusBadgeVariant(order.status)}
                              >
                                {formatOrderStatus(order.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
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

                        <Separator className="my-4" />

                        {/* Customer info */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Customer
                            </span>
                            <p className="font-medium">
                              {order.customerInfo.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Phone
                            </span>
                            <p className="font-medium">
                              {order.customerInfo.phone}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Country
                            </span>
                            <p className="font-medium">
                              {order.customerInfo.country}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Address
                            </span>
                            <p className="font-medium">
                              {order.customerInfo.address}
                            </p>
                          </div>
                        </div>

                        {/* Order items with thumbnails */}
                        <div className="space-y-2 mb-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                                className="flex items-center gap-3 p-2 rounded-lg bg-gold/5 border border-gold/10"
                              >
                                <ProductThumbnail
                                  imageUrl={product?.imageUrl ?? ""}
                                  name={
                                    product?.name ?? `Product #${productId}`
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {product?.name ??
                                      `Product #${productId.toString()}`}
                                  </p>
                                  {product?.category && (
                                    <p className="text-xs text-muted-foreground">
                                      {product.category}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-semibold text-gold">
                                    {product
                                      ? `€${product.price.toFixed(2)}`
                                      : ""}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
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
                              <SelectTrigger className="w-40 h-8 text-sm border-gold/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
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
                              className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancelOrderMutation.isPending}
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
