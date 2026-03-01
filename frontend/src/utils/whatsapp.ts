export interface WhatsAppOrderPayload {
  orderId: string;
  customerName: string;
  customerCountry: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  total: number;
  timestamp: Date;
}

export function buildWhatsAppNotificationURL(payload: WhatsAppOrderPayload): string {
  const {
    orderId,
    customerName,
    customerCountry,
    customerPhone,
    customerAddress,
    items,
    total,
    timestamp,
  } = payload;

  const dateStr = timestamp.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const itemLines = items
    .map((item, idx) => `  ${idx + 1}. ${item.productName} × ${item.quantity} — €${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = [
    '🛒 *NEW ORDER RECEIVED!*',
    '━━━━━━━━━━━━━━━━━━━━',
    `📦 *Order ID:* #${orderId}`,
    `🕐 *Date & Time:* ${dateStr}`,
    '',
    '👤 *Customer Details*',
    `   Name: ${customerName}`,
    `   Country: ${customerCountry}`,
    `   Phone: ${customerPhone}`,
    `   Address: ${customerAddress}`,
    '',
    '🛍️ *Items Ordered*',
    itemLines,
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    `💰 *Order Total: €${total.toFixed(2)}*`,
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    'Please process this order at the earliest. Thank you!',
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/919137202881?text=${encodedMessage}`;
}

export function sendWhatsAppNotification(payload: WhatsAppOrderPayload): void {
  const url = buildWhatsAppNotificationURL(payload);
  window.open(url, '_blank', 'noopener,noreferrer');
}
