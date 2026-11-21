import { API_ROUTES } from "@wearly/shared/api/routes";
import type {
  CreateRentalInput,
  DeclineRentalInput,
  DisputeInput,
  HandoverAcknowledgeInput,
  HandoverConfirmInput,
  ListRentalsQuery,
  ListRentalsResponse,
  MeetupProposalInput,
  NoShowInput,
  RentalDetail,
  RentalReasonInput,
} from "@wearly/shared/api/types";
import { authClient } from "@/lib/auth-client";

/**
 * The rental endpoints, in one place.
 *
 * Every call is authenticated (`authClient.$fetch` attaches the Better Auth
 * session cookie). The API is the authority for what may happen next; this
 * module never decides a transition, it only asks for one.
 */

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

interface FetchEnvelope<T> {
  data?: T;
  error?: { message?: string } | null;
}

interface RequestOptions {
  body?: unknown;
  method?: "GET" | "POST";
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const result = (await authClient.$fetch(
    `${apiBase}${path}`,
    options
  )) as FetchEnvelope<T>;

  if (result.error || result.data === undefined) {
    throw new Error(
      result.error?.message ??
        "That did not work. Check your connection and try again."
    );
  }

  return result.data;
}

function listPath(query: Partial<ListRentalsQuery>): string {
  const params = new URLSearchParams({
    limit: String(query.limit ?? 20),
    offset: String(query.offset ?? 0),
    role: query.role ?? "all",
  });
  if (query.status) {
    params.set("status", query.status);
  }
  return `${API_ROUTES.RENTALS.BASE}?${params.toString()}`;
}

export const rentalApi = {
  accept: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.ACCEPT(id), { method: "POST" }),

  acceptMeetup: (id: string, proposalId: string) =>
    request<RentalDetail>(
      API_ROUTES.RENTALS.MEETUP_PROPOSAL_ACCEPT(id, proposalId),
      { method: "POST" }
    ),

  acknowledgeHandover: (id: string, body: HandoverAcknowledgeInput = {}) =>
    request<RentalDetail>(API_ROUTES.RENTALS.HANDOVER_ACKNOWLEDGE(id), {
      body,
      method: "POST",
    }),

  cancel: (id: string, body: RentalReasonInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.CANCEL(id), {
      body,
      method: "POST",
    }),

  checkIn: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.CHECK_IN(id), { method: "POST" }),

  confirmHandover: (id: string, body: HandoverConfirmInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.HANDOVER_CONFIRM(id), {
      body,
      method: "POST",
    }),

  confirmReturn: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.RETURN_CONFIRM(id), {
      method: "POST",
    }),

  create: (body: CreateRentalInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.BASE, { body, method: "POST" }),

  decline: (id: string, body: DeclineRentalInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.DECLINE(id), {
      body,
      method: "POST",
    }),

  detail: (id: string) => request<RentalDetail>(API_ROUTES.RENTALS.BY_ID(id)),

  list: (query: Partial<ListRentalsQuery> = {}) =>
    request<ListRentalsResponse>(listPath(query)),

  markReturned: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.RETURN(id), { method: "POST" }),

  openDispute: (id: string, body: DisputeInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.DISPUTES(id), {
      body,
      method: "POST",
    }),

  proposeMeetup: (id: string, body: MeetupProposalInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.MEETUP_PROPOSALS(id), {
      body,
      method: "POST",
    }),

  reportIssue: (id: string, body: DisputeInput) =>
    request<RentalDetail>(API_ROUTES.RENTALS.HANDOVER_ISSUES(id), {
      body,
      method: "POST",
    }),

  reportNoShow: (id: string, body: NoShowInput = {}) =>
    request<RentalDetail>(API_ROUTES.RENTALS.NO_SHOW(id), {
      body,
      method: "POST",
    }),

  retryPayment: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.PAYMENT_RETRY(id), {
      method: "POST",
    }),

  startInspection: (id: string) =>
    request<RentalDetail>(API_ROUTES.RENTALS.HANDOVER_START(id), {
      method: "POST",
    }),
};
