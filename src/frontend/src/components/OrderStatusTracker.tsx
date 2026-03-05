import { OrderStatus } from "@/backend";
import { Check, X } from "lucide-react";

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.pending, label: "Pending" },
  { status: OrderStatus.processing, label: "Processing" },
  { status: OrderStatus.shipped, label: "Shipped" },
  { status: OrderStatus.delivered, label: "Delivered" },
];

function getStepIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.status === status);
}

export default function OrderStatusTracker({
  currentStatus,
}: OrderStatusTrackerProps) {
  const isCancelled = currentStatus === OrderStatus.cancelled;
  const currentIndex = isCancelled ? -1 : getStepIndex(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 border-2 border-destructive">
          <X className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-display text-sm tracking-widest uppercase text-destructive">
            Order Cancelled
          </p>
          <p className="text-xs font-body text-muted-foreground">
            This order has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gold/15 z-0" />
        {/* Progress line fill */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gold z-0 transition-all duration-500"
          style={{
            width:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center gap-2 z-10 flex-1"
            >
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isCompleted ? "bg-gold border-gold" : ""}
                  ${isActive ? "bg-gold/15 border-gold shadow-gold" : ""}
                  ${isPending ? "bg-background border-gold/20" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span
                    className={`text-xs font-display font-semibold ${
                      isActive ? "text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-display tracking-widest uppercase text-center leading-tight ${
                  isActive
                    ? "text-gold"
                    : isCompleted
                      ? "text-gold/70"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
