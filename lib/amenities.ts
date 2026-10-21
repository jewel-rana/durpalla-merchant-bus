/** Human label for an amenity code from `vehicles.amenities`. */
export const amenityLabel: Record<string, string> = {
  ac: "❄️ Full AC", wifi: "📶 Free Wi-Fi", usb: "🔌 USB charging", blanket: "🧺 Blanket", water: "💧 Water", snacks: "🥪 Snacks",
  cctv: "🎥 CCTV", gps: "🛰️ Live tracking", tv: "📺 TV", toilet: "🚻 Toilet", reclining: "💺 Reclining seats", sleeper: "🛏️ Sleeper berths",
};
export const amenityText = (code: string) => amenityLabel[code] ?? code.replace(/[_-]/g, " ").replace(/^./, (x) => x.toUpperCase());
