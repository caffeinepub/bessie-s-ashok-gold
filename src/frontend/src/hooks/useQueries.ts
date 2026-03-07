import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Product, backendInterface } from "../backend";
import { OrderStatus } from "../backend";
import { StorageClient } from "../utils/StorageClient";
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

// ─── Image upload via blob storage ───────────────────────────────────────────

const STORAGE_GATEWAY_URL = "https://blob.caffeine.ai";
const BUCKET_NAME = "default-bucket";

async function uploadImageFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  // Load env.json to get canister ID and project ID
  const envBaseUrl = (import.meta.env.BASE_URL as string) || "/";
  const baseUrl = envBaseUrl.endsWith("/") ? envBaseUrl : `${envBaseUrl}/`;
  let canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND as
    | string
    | undefined;
  let projectId = "0000000-0000-0000-0000-00000000000";

  try {
    const res = await fetch(`${baseUrl}env.json`);
    const cfg = (await res.json()) as {
      backend_canister_id?: string;
      project_id?: string;
    };
    if (cfg.backend_canister_id && cfg.backend_canister_id !== "undefined") {
      canisterId = cfg.backend_canister_id;
    }
    if (cfg.project_id && cfg.project_id !== "undefined") {
      projectId = cfg.project_id;
    }
  } catch {
    // fall through with defaults
  }

  if (!canisterId) {
    throw new Error("Backend canister ID not available");
  }

  const { HttpAgent } = await import("@icp-sdk/core/agent");
  const agent = new HttpAgent({ host: undefined });

  const storageClient = new StorageClient(
    BUCKET_NAME,
    STORAGE_GATEWAY_URL,
    canisterId,
    projectId,
    agent,
  );

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const { hash } = await storageClient.putFile(bytes, onProgress);
  return storageClient.getDirectURL(hash);
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

      let finalImageUrl = imageUrl ?? "";
      let imageUploadFailed = false;

      // If a file was provided, upload it to blob storage to get a real URL.
      // On any failure (network, certificate, etc.) fall through and save
      // the product without an image rather than blocking the add entirely.
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageFile(imageFile, onUploadProgress);
        } catch (uploadErr) {
          console.warn(
            "Image upload failed, saving product without image:",
            uploadErr,
          );
          finalImageUrl = "";
          imageUploadFailed = true;
        }
      }

      let newId: Awaited<ReturnType<typeof resolvedActor.addProduct>>;
      try {
        newId = await resolvedActor.addProduct(
          name,
          description,
          price,
          finalImageUrl,
          category,
        );
      } catch (err) {
        rethrowFriendly(err);
      }

      return { id: newId, imageUploadFailed };
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
