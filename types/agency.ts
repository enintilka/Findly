export interface Agency {
  id: string;
  contactName: string;
  email: string;
  password: string;
  agencyName?: string;
  logoName?: string;
  profilePicture?: string;
  description?: string;
  website?: string;
  phone?: string;
  officeAddress?: string;
  profileComplete: boolean;
  createdAt: string;
}

export interface AgencyListing {
  id: string;
  agencyId: string;
  agencyName: string;
  title: string;
  description: string;
  city: string;
  country: string;
  price: number;
  createdAt: string;
}

export interface SavedRequest {
  agencyId: string;
  requestId: string;
  savedAt: string;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface ChatThread {
  id: string;
  requestId: string;
  requestTitle: string;
  customerId: string;
  customerName: string;
  agencyId: string;
  agencyName: string;
  lastMessage?: string;
  updatedAt: string;
  customerLastReadAt?: string;
  agencyLastReadAt?: string;
  deletedByCustomer?: boolean;
  deletedByAgency?: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "agency";
  body: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: MessageStatus;
  /** @deprecated use sentAt */
  createdAt?: string;
}

export interface RequestFilters {
  search: string;
  country: string;
  city: string;
  propertyType: string;
  budgetMin: string;
  budgetMax: string;
}

export const EMPTY_REQUEST_FILTERS: RequestFilters = {
  search: "",
  country: "",
  city: "",
  propertyType: "",
  budgetMin: "",
  budgetMax: "",
};
