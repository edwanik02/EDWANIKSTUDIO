"use client";
import { useEffect, useState } from "react";
import { api, getParams, navigate, useAuth, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";
import { formatINR } from "../product-card";

const statusFlow = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderDetailView() {
  const id = getParams().id;
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api<{ order: any }>(`/api/orders/${id}`).then((d) => setOrder(d.order)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-20"><Skeleton className="h-40 w-full" /></div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center"><p>Order not found.</p><Button className="mt-4" onClick={() => navigate({ view: "account", sub: "orders" })}>My Orders</Button></div>;

  const currentStep = statusFlow.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <Badge className={order.status === "DELIVERED" ? "bg-green-500" : order.status === "CANCELLED" ? "bg-red-500" : "bg-primary"}>{order.status}</Badge>
      </div>

      {/* Tracking */}
      {order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
        <Card className="p-6 mb-4">
          <h2 className="font-bold mb-4">Order Tracking</h2>
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
            <div className="absolute top-5 left-5 h-0.5 bg-primary transition-all" style={{ width: `calc(${(currentStep / (statusFlow.length - 1)) * 100}% - 1.25rem)` }} />
            {statusFlow.map((s, i) => {
              const done = i <= currentStep;
              const icon = i === 0 ? Clock : i === statusFlow.length - 1 ? CheckCircle2 : i === statusFlow.length - 2 ? Truck : Package;
              const Icon = icon;
              return (
                <div key={s} className="flex flex-col items-center gap-1 z-10 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs text-center ${done ? "font-medium" : "text-muted-foreground"}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <Card className="p-4">
            <h2 className="font-bold mb-3">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((it: any) => (
                <div key={it.id} className="flex gap-3">
                  <div className="h-16 w-16 rounded bg-muted overflow-hidden shrink-0">
                    {it.productImage && <img src={it.productImage} alt={it.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{it.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {it.quantity} × {formatINR(it.price)}</p>
                  </div>
                  <span className="font-semibold">{formatINR(it.total)}</span>
                </div>
              ))}
            </div>
          </Card>

          {order.history?.length > 0 && (
            <Card className="p-4">
              <h2 className="font-bold mb-3">Status History</h2>
              <div className="space-y-2">
                {order.history.map((h: any) => (
                  <div key={h.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                    <span className="font-medium">{h.status}</span>
                    <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="p-4">
            <h2 className="font-bold mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-primary">{formatINR(order.total)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1"><span>Payment</span><span>{order.paymentMethod} · {order.paymentStatus}</span></div>
            </div>
          </Card>

          {order.address && (
            <Card className="p-4">
              <h2 className="font-bold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Delivery Address</h2>
              <p className="text-sm text-muted-foreground">{order.address.label}</p>
              <p className="text-sm">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
              <p className="text-sm">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
