export interface Event {
  id: string;
  name: string | null;
  location: string | null;
  date: string | null;
  ticket_price?: number | null;
  transfer_link?: string | null;
}

export interface DashboardData {
  activeConversationsCount: number;
  conversationsWithSalesCount: number;
  totalTicketsCount: number;
  genderStats: {
    male: number;
    female: number;
  };
  purchasesPendingApprovalCount: number;
  totalTicketEarnings: number;
  totalExpenses: number;
}

export interface Ticket {
  id: string | number;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  number_assoc: string | null;
  payment_state: boolean | null;
  gender: "MALE" | "FEMALE" | null;
  price: number | null;
  checked_in: string | null;
}

export interface Expense {
  id: string | number;
  created_at: string;
  description: string | null;
  amount: number | null;
  event_id: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  phone_number: string;
  buffer: string | null;
  summary: string | null;
  state: "IDLE" | "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "COMPLETED" | null;
  last_message: string | null;
  pending: boolean | null;
  control_over: "AI" | "HUMAN" | null;
}

export interface TransferAuth {
  id: string | number;
  created_at: string;
  phone_number: string | null;
  storage_path: string | null;
  state: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | null;
  purchase_id: string | null;
}

export interface Purchase {
  id: string;
  created_at: string;
  buyer_phone: string | null;
  total_amount: number | null;
  paid_amount: number | null;
  state: "PENDING" | "PAID" | "PARTIALLY_PAID" | "CANCELLED" | "REFUNDED" | null;
  conversation_id: string | null;
  event_id: string | null;
  transfer_auth?: TransferAuth[];
  conversations?: {
    phone_number: string;
  } | null;
}



