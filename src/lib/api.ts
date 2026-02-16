const LITEAPI_KEY = process.env.LITEAPI_KEY || "";
const BASE = "https://api.liteapi.travel/v3.0";
const BOOK_BASE = "https://book.liteapi.travel/v3.0";

if (!LITEAPI_KEY) {
  console.warn("LITEAPI_KEY is not set");
}

const headers = {
  "X-API-Key": LITEAPI_KEY,
  accept: "application/json",
  "content-type": "application/json",
};

// --- Types ---

export interface SearchPlacesResponse {
  data: Array<{
    id: string;
    name: string;
    // Add other fields as needed based on actual API response
  }>;
}

export interface RateResponse {
  data: Array<any>; // Replace 'any' with actual Rate type when known
  hotels: Array<any>;
}

export interface HotelDetailsResponse {
  data: any; // Replace 'any' with actual HotelDetail type when known
}

export interface BookingResponse {
  data: {
    bookingId: string;
    status: string;
    // Add other fields as needed
  };
  error?: {
    code: string;
    message: string;
  };
}

// --- API Functions ---

export async function searchPlaces(query: string): Promise<SearchPlacesResponse> {
  try {
    const res = await fetch(
      `${BASE}/data/places?textQuery=${encodeURIComponent(query)}`,
      { headers }
    );
    if (!res.ok) throw new Error(`Places API error: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("searchPlaces failed:", error);
    return { data: [] }; // Return empty structure on error to avoid crashes
  }
}

export async function searchRates(body: Record<string, unknown>): Promise<RateResponse> {
  try {
    const res = await fetch(`${BASE}/hotels/rates`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Rates API error body:", errorBody);
      throw new Error(`Rates API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("searchRates failed:", error);
    throw error; // Re-throw to be handled by the caller (likely the route handler)
  }
}

export async function getHotelDetails(hotelId: string): Promise<HotelDetailsResponse> {
  try {
    const res = await fetch(
      `${BASE}/data/hotel?hotelId=${encodeURIComponent(hotelId)}&timeout=4`,
      { headers }
    );
    if (!res.ok) throw new Error(`Hotel Details API error: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error("getHotelDetails failed:", error);
    throw error;
  }
}

export async function prebook(offerId: string): Promise<any> {
  try {
    const res = await fetch(`${BOOK_BASE}/rates/prebook`, {
      method: "POST",
      headers,
      body: JSON.stringify({ usePaymentSdk: true, offerId }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Prebook failed:", errorText);
      throw new Error(`Prebook API error: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("prebook failed:", error);
    throw error;
  }

}

export async function book(body: Record<string, unknown>): Promise<BookingResponse> {
  try {
    const res = await fetch(`${BOOK_BASE}/rates/book`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // Attempt to parse JSON regardless of status to get error details
    const data = await res.json();

    if (!res.ok) {
      console.error("Book API error:", data);
      throw new Error(data?.error?.message || `Booking failed: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("book failed:", error);
    throw error;
  }
}
