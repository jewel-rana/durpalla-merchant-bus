import { getBooking, listBookings, type BookingStatus } from "@/lib/account";
import { toView, type BookingView } from "@/lib/booking-view";

/**
 * GET bookings?status=… returns summaries only (id, pnr, status, travelDate, total), so the
 * first `detail` rows are enriched with GET bookings/{id} to show route/room and seats.
 */
export async function loadBookings(status: BookingStatus, detail = 10): Promise<BookingView[]> {
  const list = await listBookings(status);
  return Promise.all(list.map(async (b, i) => (i < detail ? toView(await getBooking(b.id).catch(() => b)) : toView(b))));
}
