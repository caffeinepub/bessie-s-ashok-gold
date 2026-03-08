import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Product, backendInterface } from "../backend";
import { ExternalBlob, OrderStatus } from "../backend";
import { useActor } from "./useActor";

// ─── IC0537 / "no wasm module" error helper ───────────────────────────────────

const WASM_ERROR_PATTERNS = ["IC0537", "no wasm module", "Requested canister"];
const FRIENDLY_WASM_MSG =
  "The server is starting up. Please wait 30 seconds and try again, or refresh the page.";

function isWasmError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : JSON.stringify(err);
  return WASM_ERROR_PATTERNS.some((p) => msg.includes(p));
}

function rethrowFriendly(err: unknown): never {
  if (isWasmError(err)) {
    throw new Error(FRIENDLY_WASM_MSG);
  }
  throw err;
}

// ─── Actor retry helper ──────────────────────────────────────────────────────

/**
 * Polls the query cache for a ready actor, waiting up to `timeoutMs`.
 * Falls back to the inline `actorSnapshot` if available immediately.
 */
async function waitForActorReady(
  actorSnapshot: backendInterface | null,
  getFromCache: () => backendInterface | null,
  timeoutMs = 10000,
): Promise<backendInterface> {
  if (actorSnapshot) return actorSnapshot;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cached = getFromCache();
    if (cached) return cached;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    "Backend connection timed out. Please refresh the page and try again.",
  );
}

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
    staleTime: 0,
  });
}

export function useGetProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (id === null || !actor) return null;
      return actor.getProduct(id);
    },
    enabled: id !== null && !!actor && !isFetching,
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
      try {
        return await actor.placeOrder(name, country, phone, address);
      } catch (err) {
        rethrowFriendly(err);
      }
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
      imageFile,
      imageUrl,
      category,
      onUploadProgress,
    }: {
      name: string;
      description: string;
      price: number;
      imageFile?: File;
      imageUrl?: string;
      category: string;
      onUploadProgress?: (pct: number) => void;
    }) => {
      // Wait for actor — poll query cache if the closure snapshot is stale
      const getFromCache = (): backendInterface | null => {
        const allQueries = queryClient.getQueriesData<backendInterface>({
          queryKey: ["actor"],
        });
        for (const [, data] of allQueries) {
          if (data) return data;
        }
        return null;
      };

      const resolvedActor = await waitForActorReady(actor, getFromCache);

      // Build an ExternalBlob from the provided file or URL
      let image: ExternalBlob;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes);
        if (onUploadProgress) {
          image = image.withUploadProgress(onUploadProgress);
        }
      } else if (imageUrl) {
        image = ExternalBlob.fromURL(imageUrl);
      } else {
        image = ExternalBlob.fromURL("");
      }

      let newId: Awaited<ReturnType<typeof resolvedActor.addProduct>>;
      try {
        newId = await resolvedActor.addProduct(
          name,
          description,
          price,
          image,
          category,
        );
      } catch (err) {
        rethrowFriendly(err);
      }

      return { id: newId, imageUploadFailed: false };
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
      try {
        await actor.deleteProduct(id);
      } catch (err) {
        rethrowFriendly(err);
      }
      return true;
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
      try {
        await actor.updateProductPrice(id, newPrice);
      } catch (err) {
        rethrowFriendly(err);
      }
      return true;
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
      try {
        await actor.updateProductStock(id, inStock);
      } catch (err) {
        rethrowFriendly(err);
      }
      return true;
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
      try {
        return await actor.updateOrderStatus(orderId, newStatus);
      } catch (err) {
        rethrowFriendly(err);
      }
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
      try {
        return await actor.cancelOrder(orderId);
      } catch (err) {
        rethrowFriendly(err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Re-export OrderStatus for convenience
export { OrderStatus };
