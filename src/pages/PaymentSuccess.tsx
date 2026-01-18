import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { paymentApi } from "@/db/api";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("No payment session found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const result = await paymentApi.verifyPayment(sessionId);

        if (result.verified && result.status === "paid") {
          setStatus("success");
          setMessage("Your payment was successful!");
          clearCart();
        } else {
          setStatus("error");
          setMessage("Payment verification failed. Please contact support.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify payment.");
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {status === "loading" && (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment...
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle2 className="h-16 w-16 mx-auto text-success mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/orders">View Orders</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/cart">Return to Cart</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/">Go Home</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
