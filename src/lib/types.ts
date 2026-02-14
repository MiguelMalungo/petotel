export interface Place {
  placeId: string;
  displayName: string;
  formattedAddress: string;
}

export interface RateTotal {
  amount: number;
  currency: string;
}

export interface Rate {
  name: string;
  mappedRoomId: number;
  boardName: string;
  retailRate: {
    total: RateTotal[];
    taxesAndFees?: { included: boolean; amount?: number }[];
  };
  cancellationPolicies: {
    refundableTag: string;
    cancelPolicyInfos?: { cancelTime: string }[];
  };
}

export interface RoomType {
  offerId: string;
  rates: Rate[];
}

export interface HotelRateData {
  hotelId: string;
  roomTypes: RoomType[];
}

export interface HotelBrief {
  id: string;
  name: string;
  main_photo: string;
  address: string;
  rating: number;
  tags?: string[];
  persona?: string;
  style?: string;
  location_type?: string;
  story?: string;
}

export interface HotelPolicy {
  name: string;
  description: string;
}

export interface HotelRoom {
  id: number;
  roomName: string;
  photos: { url: string }[];
}

export interface HotelDetail {
  id: string;
  name: string;
  hotelDescription: string;
  hotelImages: { url: string; defaultImage?: boolean }[];
  hotelImportantInformation?: string;
  main_photo: string;
  videoUrl?: string;
  city: string;
  country: string;
  address: string;
  hotelFacilities: string[];
  starRating: number;
  location: { latitude: number; longitude: number };
  rooms: HotelRoom[];
  policies: HotelPolicy[];
  sentiment_analysis?: { pros: string[]; cons: string[] };
}

export interface PrebookData {
  prebookId: string;
  offerId: string;
  hotelId: string;
  price: number;
  commission: number;
  currency: string;
  transactionId: string;
  secretKey: string;
  paymentTypes: string[];
  roomTypes: {
    rates: {
      rateId: string;
      retailRate: {
        total: RateTotal[];
        taxesAndFees?: { included: boolean; amount?: number }[];
      };
      cancellationPolicies: {
        refundableTag: string;
        cancelPolicyInfos?: { cancelTime: string }[];
      };
    }[];
  }[];
}

export interface BookingData {
  bookingId: string;
  status: string;
  hotelConfirmationCode: string;
  checkin: string;
  checkout: string;
  hotel: {
    hotelId: string;
    name: string;
  };
  price: number;
  currency: string;
  cancellationPolicies?: {
    refundableTag: string;
    cancelPolicyInfos?: { cancelTime: string }[];
  };
}

export interface SearchParams {
  checkin: string;
  checkout: string;
  adults: number;
  placeId?: string;
  placeName?: string;
  vibeQuery?: string;
  petType?: string;
  petCount?: number;
}
