import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CustomerInfo {
    country: string;
    name: string;
    address: string;
    phone: string;
}
export interface Order {
    id: bigint;
    customerInfo: CustomerInfo;
    status: OrderStatus;
    total: number;
    timestamp: bigint;
    items: Array<[bigint, bigint]>;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: number;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: number, image: ExternalBlob, category: string): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    cancelOrder(orderId: bigint): Promise<boolean>;
    deleteProduct(id: bigint): Promise<boolean>;
    getAllOrders(): Promise<Array<Order>>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    listProducts(): Promise<Array<Product>>;
    placeOrder(name: string, country: string, phone: string, address: string): Promise<bigint | null>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<boolean>;
    updateProductPrice(id: bigint, newPrice: number): Promise<boolean>;
    updateProductStock(id: bigint, inStock: boolean): Promise<boolean>;
}
