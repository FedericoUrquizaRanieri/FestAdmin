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

