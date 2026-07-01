export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "land"
  | "commercial"
  | "vacation_home";

export interface Customer {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  city?: string;
  bio?: string;
  profilePicture?: string;
  profileComplete: boolean;
  createdAt: string;
}

export interface RequestAmenities {
  garden: boolean;
  swimmingPool: boolean;
  fireplace: boolean;
  parking: boolean;
  balcony: boolean;
  seaView: boolean;
  mountainView: boolean;
  nearTheSea: boolean;
  furnished: boolean;
  newConstruction: boolean;
  renovationNeeded: boolean;
}

export interface CustomerRequest {
  id: string;
  customerId: string;
  customerName: string;
  introduction: string;
  propertyType: PropertyType;
  country: string;
  region: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  sizeMin?: number;
  sizeMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: RequestAmenities;
  additionalNotes?: string;
  imageNames: string[];
  pdfNames: string[];
  status: "open" | "closed";
  createdAt: string;
}

export interface CustomerAppData {
  customers: Customer[];
  requests: CustomerRequest[];
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  land: "Land",
  commercial: "Commercial",
  vacation_home: "Vacation home",
};

export const AMENITY_LABELS: Record<keyof RequestAmenities, string> = {
  garden: "Garden",
  swimmingPool: "Swimming pool",
  fireplace: "Fireplace",
  parking: "Parking",
  balcony: "Balcony",
  seaView: "Sea view",
  mountainView: "Mountain view",
  nearTheSea: "Near the sea",
  furnished: "Furnished",
  newConstruction: "New construction",
  renovationNeeded: "Renovation needed",
};

export const EMPTY_AMENITIES: RequestAmenities = {
  garden: false,
  swimmingPool: false,
  fireplace: false,
  parking: false,
  balcony: false,
  seaView: false,
  mountainView: false,
  nearTheSea: false,
  furnished: false,
  newConstruction: false,
  renovationNeeded: false,
};
