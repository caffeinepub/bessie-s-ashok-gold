import { useState } from 'react';
import { Trash2, Pencil, Check, X, Plus, Package, ShoppingBag, Loader2, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useListProducts,
  useAddProduct,
  useDeleteProduct,
  useUpdateProductPrice,
  useUpdateProductStock,
  useGetAllOrders,
  useUpdateOrderStatus,
  useCancelOrder,
  OrderStatus,
} from '@/hooks/useQueries';
import type { Product, Order } from '@/backend';
import AdminPasswordGate from '@/components/AdminPasswordGate';

// ─── Add Product Form ─────────────────────────────────────────────────────────

function AddProductForm() {
  const addProduct = useAddProduct();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name || !form.description || isNaN(price) || !form.category) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: form.name,
        description: form.description,
        price,
        imageUrl: form.imageUrl,
        category: form.category,
      });
      toast.success('Product added successfully!');
      setForm({ name: '', description: '', price: '', imageUrl: '', category: '' });
    } catch {
      toast.error('Failed to add product. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-gold/80 font-display text-xs tracking-widest uppercase">
            Product Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Gold Necklace"
            className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-gold/80 font-display text-xs tracking-widest uppercase">
            Category *
          </Label>
          <Input
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Jewelry"
            className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-gold/80 font-display text-xs tracking-widest uppercase">
          Description *
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description..."
          rows={3}
          className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price" className="text-gold/80 font-display text-xs tracking-widest uppercase">
            Price (€) *
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl" className="text-gold/80 font-display text-xs tracking-widest uppercase">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={addProduct.isPending}
        className="bg-gold hover:bg-gold-dark text-white font-display tracking-widest uppercase text-xs"
      >
        {addProduct.isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add Product
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product }: { product: Product }) {
  const deleteProduct = useDeleteProduct();
  const updatePrice = useUpdateProductPrice();
  const updateStock = useUpdateProductStock();

  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(product.price.toFixed(2));

  const handlePriceSave = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Enter a valid price.');
      return;
    }
    try {
      await updatePrice.mutateAsync({ id: product.id, newPrice: price });
      toast.success('Price updated.');
      setEditingPrice(false);
    } catch {
      toast.error('Failed to update price.');
    }
  };

  const handleStockToggle = async (checked: boolean) => {
    try {
      await updateStock.mutateAsync({ id: product.id, inStock: checked });
      toast.success(`Stock status updated.`);
    } catch {
      toast.error('Failed to update stock status.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Product deleted.');
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <TableRow className="border-gold/10 hover:bg-secondary/50">
      <TableCell className="font-body text-sm text-foreground font-medium">{product.name}</TableCell>
      <TableCell className="font-body text-xs text-muted-foreground">{product.category}</TableCell>
      <TableCell>
        {editingPrice ? (
          <div className="flex items-center gap-1.5">
            <span className="text-gold text-sm font-body">€</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-24 h-7 text-xs bg-background border-gold/30 focus:border-gold text-foreground"
              autoFocus
            />
            <button
              onClick={handlePriceSave}
              disabled={updatePrice.isPending}
              className="p-1 text-gold hover:text-gold-dark transition-colors"
            >
              {updatePrice.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => { setEditingPrice(false); setNewPrice(product.price.toFixed(2)); }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-gold font-semibold">€{product.price.toFixed(2)}</span>
            <button
              onClick={() => setEditingPrice(true)}
              className="p-1 text-muted-foreground hover:text-gold transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={product.inStock}
            onCheckedChange={handleStockToggle}
            disabled={updateStock.isPending}
            className="data-[state=checked]:bg-gold"
          />
          <span className={`text-xs font-body ${product.inStock ? 'text-gold' : 'text-muted-foreground'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={deleteProduct.isPending}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              {deleteProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-gold/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">Delete Product?</AlertDialogTitle>
              <AlertDialogDescription className="font-body text-muted-foreground">
                This will permanently delete <strong className="text-foreground">{product.name}</strong>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-body border-gold/20 text-foreground hover:bg-secondary">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-body"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.pending, label: 'Pending' },
  { value: OrderStatus.processing, label: 'Processing' },
  { value: OrderStatus.shipped, label: 'Shipped' },
  { value: OrderStatus.delivered, label: 'Delivered' },
];

function OrderRow({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();

  const isCancelled = order.status === OrderStatus.cancelled;

  const handleStatusChange = async (value: string) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, newStatus: value as OrderStatus });
      toast.success('Order status updated.');
    } catch {
      toast.error('Failed to update order status.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(order.id);
      toast.success('Order cancelled.');
    } catch {
      toast.error('Failed to cancel order.');
    }
  };

  const statusColors: Record<string, string> = {
    [OrderStatus.pending]: 'bg-amber-100 text-amber-700 border-amber-200',
    [OrderStatus.processing]: 'bg-blue-100 text-blue-700 border-blue-200',
    [OrderStatus.shipped]: 'bg-purple-100 text-purple-700 border-purple-200',
    [OrderStatus.delivered]: 'bg-green-100 text-green-700 border-green-200',
    [OrderStatus.cancelled]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <TableRow className="border-gold/10 hover:bg-secondary/50">
      <TableCell className="font-display text-xs text-gold tracking-wider">#{order.id.toString()}</TableCell>
      <TableCell className="font-body text-sm text-foreground">{order.customerInfo.name}</TableCell>
      <TableCell className="font-body text-xs text-muted-foreground">{order.customerInfo.country}</TableCell>
      <TableCell className="font-body text-xs text-muted-foreground">{order.customerInfo.phone}</TableCell>
      <TableCell className="font-body text-xs text-muted-foreground max-w-[140px] truncate">{order.customerInfo.address}</TableCell>
      <TableCell className="font-serif text-sm text-gold font-semibold">€{order.total.toFixed(2)}</TableCell>
      <TableCell>
        {isCancelled ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-body font-medium border ${statusColors[OrderStatus.cancelled]}`}>
            Cancelled
          </span>
        ) : (
          <Select value={order.status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
            <SelectTrigger className="w-32 h-7 text-xs bg-background border-gold/20 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-gold/20">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs font-body">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell>
        {!isCancelled && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={cancelOrder.isPending}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-body text-destructive border border-destructive/30 rounded hover:bg-destructive/10 transition-colors"
              >
                {cancelOrder.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                Cancel
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-gold/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-foreground">Cancel Order #{order.id.toString()}?</AlertDialogTitle>
                <AlertDialogDescription className="font-body text-muted-foreground">
                  This will cancel the order for <strong className="text-foreground">{order.customerInfo.name}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-body border-gold/20 text-foreground hover:bg-secondary">Keep Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-body"
                >
                  Cancel Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function AdminContent() {
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-1">Dashboard</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
          Admin <span className="gold-text">Panel</span>
        </h1>
        <div className="mt-3 w-16 h-px bg-gold/40" />
      </div>

      <Tabs defaultValue="products">
        <TabsList className="bg-secondary border border-gold/15 mb-6">
          <TabsTrigger
            value="products"
            className="font-display text-xs tracking-widest uppercase data-[state=active]:bg-gold data-[state=active]:text-white text-foreground/60"
          >
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="font-display text-xs tracking-widest uppercase data-[state=active]:bg-gold data-[state=active]:text-white text-foreground/60"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Add Product */}
          <div className="card-dark rounded-lg p-6">
            <h2 className="font-display text-sm tracking-widest uppercase text-foreground mb-5 flex items-center gap-2">
              <Plus className="h-4 w-4 text-gold" />
              Add New Product
            </h2>
            <AddProductForm />
          </div>

          {/* Product List */}
          <div className="card-dark rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gold/10">
              <h2 className="font-display text-sm tracking-widest uppercase text-foreground">
                Product Inventory ({products?.length ?? 0})
              </h2>
            </div>
            {productsLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-secondary" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Name</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Category</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Price (€)</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Stock</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <ProductRow key={product.id.toString()} product={product} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Package className="h-10 w-10 text-gold/20 mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No products yet. Add your first product above.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="card-dark rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gold/10">
              <h2 className="font-display text-sm tracking-widest uppercase text-foreground">
                Orders ({orders?.length ?? 0})
              </h2>
            </div>
            {ordersLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-secondary" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Order ID</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Customer</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Country</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Phone</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Address</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Total (€)</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Status</TableHead>
                      <TableHead className="font-display text-[10px] tracking-widest uppercase text-gold/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <OrderRow key={order.id.toString()} order={order} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <ShoppingBag className="h-10 w-10 text-gold/20 mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function Admin() {
  return (
    <AdminPasswordGate>
      <AdminContent />
    </AdminPasswordGate>
  );
}
