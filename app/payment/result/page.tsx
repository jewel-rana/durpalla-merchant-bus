import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPaymentStatus, authed } from "@/lib/account";
import { StateMessage } from "@/components/StateMessage";

export const metadata: Metadata = { title: "Payment" };

/** Gateway return: `/payment/result?bookingId=&status=` (set by the API callback). Verified via GET payments/{id}/status. */
export default async function PaymentResult({ searchParams }: { searchParams: Promise<{ bookingId?: string; status?: string }> }) {
  const { bookingId, status } = await searchParams;
  if (!bookingId) return <StateMessage tone="error" title="Missing booking" body="We could not tell which booking this payment was for." action={{ href: "/account/bookings", label: "My bookings" }} />;
  const s = await authed(() => getPaymentStatus(bookingId), `/payment/result?bookingId=${bookingId}`).catch(() => null);
  if (s?.paid) redirect(`/booking/${bookingId}/confirmation`);
  const failed = s ? /(fail|cancel)/i.test(s.status) : /(fail|cancel)/i.test(status ?? "");
  return failed
    ? <StateMessage tone="error" title="Payment not completed" body="No money was taken, or it will be returned by your bank/wallet. You can try paying again from your booking." action={{ href: `/account/bookings/${bookingId}`, label: "View booking" }} />
    : <StateMessage title="Payment is being confirmed" body="This can take a minute. Refresh this page, or check your booking shortly." action={{ href: `/account/bookings/${bookingId}`, label: "View booking" }} />;
}
