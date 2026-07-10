import type { RequestAmenities } from "@/types/customer";

export type RequestRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  introduction: string;
  property_type: string;
  country: string;
  region: string;
  city: string;
  budget_min: number;
  budget_max: number;
  size_min: number | null;
  size_max: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: RequestAmenities;
  additional_notes: string | null;
  pdf_names: string[];
  images: unknown;
  status: "open" | "closed";
  created_at: string;
};

export type ListingRow = {
  id: string;
  agency_id: string;
  agency_name: string;
  title: string;
  description: string;
  city: string;
  country: string;
  price: number;
  property_type: string;
  budget_min: number;
  budget_max: number;
  size_min: number | null;
  size_max: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: RequestAmenities;
  images: unknown;
  created_at: string;
};

export type ChatThreadRow = {
  id: string;
  request_id: string;
  request_title: string;
  customer_id: string;
  customer_name: string;
  agency_id: string;
  agency_name: string;
  last_message: string | null;
  updated_at: string;
  customer_last_read_at: string | null;
  agency_last_read_at: string | null;
  deleted_by_customer: boolean;
  deleted_by_agency: boolean;
};

export type ChatMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "customer" | "agency";
  body: string;
  attachments: unknown;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  status: "sent" | "delivered" | "read";
};

export type ProfileRole = "customer" | "agency";

export type Profile = {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  agency_name: string | null;
  website: string | null;
  office_address: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole | null;
          avatar_url?: string | null;
          phone?: string | null;
          country?: string | null;
          city?: string | null;
          bio?: string | null;
          agency_name?: string | null;
          website?: string | null;
          office_address?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole | null;
          avatar_url?: string | null;
          phone?: string | null;
          country?: string | null;
          city?: string | null;
          bio?: string | null;
          agency_name?: string | null;
          website?: string | null;
          office_address?: string | null;
        };
        Relationships: [];
      };
      requests: {
        Row: RequestRow;
        Insert: {
          id?: string;
          customer_id: string;
          customer_name: string;
          introduction: string;
          property_type: string;
          country: string;
          region?: string;
          city?: string;
          budget_min: number;
          budget_max: number;
          size_min?: number | null;
          size_max?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: RequestAmenities;
          additional_notes?: string | null;
          pdf_names?: string[];
          images?: unknown;
          status?: "open" | "closed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["requests"]["Insert"]>;
        Relationships: [];
      };
      saved_requests: {
        Row: {
          agency_id: string;
          request_id: string;
          saved_at: string;
        };
        Insert: {
          agency_id: string;
          request_id: string;
          saved_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_requests"]["Insert"]>;
        Relationships: [];
      };
      listings: {
        Row: ListingRow;
        Insert: {
          id?: string;
          agency_id: string;
          agency_name: string;
          title: string;
          description: string;
          city?: string;
          country: string;
          price: number;
          property_type?: string;
          budget_min?: number;
          budget_max?: number;
          size_min?: number | null;
          size_max?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          amenities?: RequestAmenities;
          images?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [];
      };
      chat_threads: {
        Row: ChatThreadRow;
        Insert: {
          id?: string;
          request_id: string;
          request_title: string;
          customer_id: string;
          customer_name: string;
          agency_id: string;
          agency_name: string;
          last_message?: string | null;
          updated_at?: string;
          customer_last_read_at?: string | null;
          agency_last_read_at?: string | null;
          deleted_by_customer?: boolean;
          deleted_by_agency?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["chat_threads"]["Insert"]>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          sender_name: string;
          sender_role: "customer" | "agency";
          body?: string;
          attachments?: unknown;
          sent_at?: string;
          delivered_at?: string | null;
          read_at?: string | null;
          status?: "sent" | "delivered" | "read";
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
