export type UserRole = "vendor" | "agency";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  bio?: string;
  companyName?: string;
  licenseNumber?: string;
  city?: string;
  profileComplete: boolean;
  createdAt: string;
}

export interface PropertyRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  city: string;
  propertyType: "apartment" | "house" | "land" | "commercial";
  price: number;
  bedrooms?: number;
  area?: number;
  status: "open" | "in_progress" | "closed";
  createdAt: string;
}

export interface AgencyListing {
  id: string;
  agencyId: string;
  agencyName: string;
  title: string;
  description: string;
  city: string;
  propertyType: "apartment" | "house" | "land" | "commercial";
  price: number;
  bedrooms?: number;
  area?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  requestId: string;
  requestTitle: string;
  vendorId: string;
  vendorName: string;
  agencyId: string;
  agencyName: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface AppData {
  users: User[];
  requests: PropertyRequest[];
  agencyListings: AgencyListing[];
  threads: ChatThread[];
  messages: ChatMessage[];
}
