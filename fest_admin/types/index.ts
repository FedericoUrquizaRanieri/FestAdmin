export interface Event {
  id: string;
  name: string | null;
  location: string | null;
  date: string | null;
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


