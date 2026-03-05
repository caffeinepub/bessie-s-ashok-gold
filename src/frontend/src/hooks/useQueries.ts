import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Product } from "../backend";
import { OrderStatus } from "../backend";
import { useActor } from "./useActor";

// ─── Products ────────────────────────────────────────────────────────────────

export function useListProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useAddToCart() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addToCart(productId, quantity);
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      country,
      phone,
      address,
    }: {
      name: string;
      country: string;
      phone: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.placeOrder(name, country, phone, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin: Product Management ───────────────────────────────────────────────

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      imageUrl,
      category,
    }: {
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addProduct(name, description, price, imageUrl, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newPrice }: { id: bigint; newPrice: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProductPrice(id, newPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, inStock }: { id: bigint; inStock: boolean }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProductStock(id, inStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Admin: All Orders ────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Re-export OrderStatus for convenience
export { OrderStatus };
