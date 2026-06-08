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
