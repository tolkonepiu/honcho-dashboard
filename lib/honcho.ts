import "server-only";

import type {
  ConclusionResponse,
  MessageResponse,
  PageResponse,
  PeerResponse,
  SessionResponse,
  WorkspaceResponse,
} from "@honcho-ai/sdk";
import { Honcho, type Session } from "@honcho-ai/sdk";
import { HonchoAppError, normalizeHonchoError } from "@/lib/honcho-errors";

const API_PREFIX = "/v3";
const PAGE_SIZE = 100;
const MAX_LIST_PAGE_SIZE = 100;

export type DashboardPeer = {
  id: string;
  workspaceId: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
  createdAt: string;
};

export type DashboardWorkspace = {
  id: string;
  metadata: Record<string, unknown>;
  configuration: WorkspaceResponse["configuration"];
  createdAt: string;
};

export type DashboardWorkspaceTableRow = DashboardWorkspace & {
  peerCount: number;
  sessionCount: number;
};

export type DashboardSession = {
  id: string;
  workspaceId: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
  configuration: SessionResponse["configuration"];
  createdAt: string;
};

export type DashboardMessage = {
  id: string;
  content: string;
  peerId: string;
  sessionId: string;
  workspaceId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  tokenCount: number;
};

export type DashboardConclusion = {
  id: string;
  content: string;
  observerId: string;
  observedId: string;
  sessionId: string | null;
  createdAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

export type WorkspaceStats = {
  peerCount: number;
  sessionCount: number;
  conclusionCount: number;
};

export type ConclusionFilters = {
  observer_id?: string;
  observed_id?: string;
  session_id?: string;
};

const MAX_CONCLUSION_PAGE_SIZE = 50;

type PaginationOptions = {
  page?: number;
  size?: number;
};

function workspacePath(workspaceId: string): string {
  return `${API_PREFIX}/workspaces/${encodeURIComponent(workspaceId)}`;
}

function peersPath(workspaceId: string): string {
  return `${workspacePath(workspaceId)}/peers`;
}

function peerPath(workspaceId: string, peerId: string): string {
  return `${peersPath(workspaceId)}/${encodeURIComponent(peerId)}`;
}

function sessionsPath(workspaceId: string): string {
  return `${workspacePath(workspaceId)}/sessions`;
}

function sessionPath(workspaceId: string, sessionId: string): string {
  return `${sessionsPath(workspaceId)}/${encodeURIComponent(sessionId)}`;
}

function conclusionsPath(workspaceId: string): string {
  return `${workspacePath(workspaceId)}/conclusions`;
}

function conclusionPath(workspaceId: string, conclusionId: string): string {
  return `${conclusionsPath(workspaceId)}/${encodeURIComponent(conclusionId)}`;
}

function pagePost<T>(
  client: Honcho,
  path: string,
  options: {
    body?: Record<string, unknown>;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<PageResponse<T>> {
  return client.http.post<PageResponse<T>>(path, {
    body: options.body ?? {},
    query: options.query,
  });
}

function createClient(workspaceId = "default"): Honcho {
  if (!process.env.HONCHO_BASE_URL) {
    throw new HonchoAppError(
      "Honcho base URL is not configured. Set HONCHO_BASE_URL to continue.",
      500,
      "honcho_base_url_missing",
    );
  }

  return new Honcho({
    baseURL: process.env.HONCHO_BASE_URL,
    workspaceId,
    ...(process.env.HONCHO_API_KEY
      ? { apiKey: process.env.HONCHO_API_KEY }
      : {}),
  });
}

async function runHonchoRequest<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw normalizeHonchoError(error);
  }
}

function mapPeer(response: PeerResponse): DashboardPeer {
  return {
    id: response.id,
    workspaceId: response.workspace_id,
    metadata: response.metadata,
    configuration: response.configuration,
    createdAt: response.created_at,
  };
}

function mapWorkspace(response: WorkspaceResponse): DashboardWorkspace {
  return {
    id: response.id,
    metadata: response.metadata,
    configuration: response.configuration,
    createdAt: response.created_at,
  };
}

function mapSession(response: SessionResponse): DashboardSession {
  return {
    id: response.id,
    workspaceId: response.workspace_id,
    isActive: response.is_active,
    metadata: response.metadata,
    configuration: response.configuration,
    createdAt: response.created_at,
  };
}

function requireSdkField<T>(
  value: T | undefined,
  entity: string,
  field: string,
): T {
  if (value === undefined) {
    throw new HonchoAppError(
      `Honcho SDK returned ${entity} without ${field}.`,
      502,
      "honcho_sdk_incomplete_response",
    );
  }

  return value;
}

function mapSessionConfigurationToApi(
  configuration: NonNullable<Session["configuration"]>,
): SessionResponse["configuration"] {
  return {
    ...(configuration.reasoning
      ? {
          reasoning: {
            ...(Object.hasOwn(configuration.reasoning, "enabled")
              ? { enabled: configuration.reasoning.enabled }
              : {}),
            ...(Object.hasOwn(configuration.reasoning, "customInstructions")
              ? {
                  custom_instructions:
                    configuration.reasoning.customInstructions,
                }
              : {}),
          },
        }
      : {}),
    ...(configuration.peerCard
      ? {
          peer_card: {
            ...(Object.hasOwn(configuration.peerCard, "use")
              ? { use: configuration.peerCard.use }
              : {}),
            ...(Object.hasOwn(configuration.peerCard, "create")
              ? { create: configuration.peerCard.create }
              : {}),
          },
        }
      : {}),
    ...(configuration.summary
      ? {
          summary: {
            ...(Object.hasOwn(configuration.summary, "enabled")
              ? { enabled: configuration.summary.enabled }
              : {}),
            ...(Object.hasOwn(configuration.summary, "messagesPerShortSummary")
              ? {
                  messages_per_short_summary:
                    configuration.summary.messagesPerShortSummary,
                }
              : {}),
            ...(Object.hasOwn(configuration.summary, "messagesPerLongSummary")
              ? {
                  messages_per_long_summary:
                    configuration.summary.messagesPerLongSummary,
                }
              : {}),
          },
        }
      : {}),
    ...(configuration.dream
      ? {
          dream: {
            ...(Object.hasOwn(configuration.dream, "enabled")
              ? { enabled: configuration.dream.enabled }
              : {}),
          },
        }
      : {}),
  };
}

function mapSdkSession(session: Session): DashboardSession {
  const isActive = requireSdkField(session.isActive, "session", "isActive");
  const metadata = requireSdkField(session.metadata, "session", "metadata");
  const configuration = requireSdkField(
    session.configuration,
    "session",
    "configuration",
  );
  const createdAt = requireSdkField(session.createdAt, "session", "createdAt");

  return {
    id: session.id,
    workspaceId: session.workspaceId,
    isActive,
    metadata,
    configuration: mapSessionConfigurationToApi(configuration),
    createdAt,
  };
}

function mapMessage(response: MessageResponse): DashboardMessage {
  return {
    id: response.id,
    content: response.content,
    peerId: response.peer_id,
    sessionId: response.session_id,
    workspaceId: response.workspace_id,
    metadata: response.metadata,
    createdAt: response.created_at,
    tokenCount: response.token_count,
  };
}

function mapConclusion(response: ConclusionResponse): DashboardConclusion {
  return {
    id: response.id,
    content: response.content,
    observerId: response.observer_id,
    observedId: response.observed_id,
    sessionId: response.session_id,
    createdAt: response.created_at,
  };
}

async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PageResponse<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  while (pageNumber <= totalPages) {
    const response = await runHonchoRequest(() =>
      fetchPage(pageNumber, PAGE_SIZE),
    );
    items.push(...response.items);

    totalPages = response.pages;
    if (totalPages === 0) {
      break;
    }

    pageNumber += 1;
  }

  return items;
}

function resolvePage(page: number | undefined) {
  if (!page || !Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildPaginatedResult<TRaw, TMapped>(
  response: PageResponse<TRaw>,
  mapper: (item: TRaw) => TMapped,
  overrides?: { page?: number; size?: number },
): PaginatedResult<TMapped> {
  return {
    items: response.items.map(mapper),
    page: overrides?.page ?? response.page,
    pages: response.pages,
    size: overrides?.size ?? response.size,
    total: response.total,
  };
}

function resolvePageSize(size: number | undefined, maxSize: number) {
  if (!size || !Number.isFinite(size) || size < 1) {
    return 10;
  }

  return Math.min(maxSize, Math.floor(size));
}

export async function listWorkspaces(): Promise<DashboardWorkspace[]> {
  const client = createClient();
  const items = await fetchAllPages<WorkspaceResponse>((page, size) =>
    pagePost<WorkspaceResponse>(client, `${API_PREFIX}/workspaces/list`, {
      query: { page, size },
    }),
  );

  return items.map(mapWorkspace);
}

export async function listWorkspacesPaginated(
  options: PaginationOptions = {},
): Promise<PaginatedResult<DashboardWorkspace>> {
  const page = resolvePage(options.page);
  const size = resolvePageSize(options.size, MAX_LIST_PAGE_SIZE);
  const client = createClient();
  const response = await runHonchoRequest(() =>
    pagePost<WorkspaceResponse>(client, `${API_PREFIX}/workspaces/list`, {
      query: { page, size },
    }),
  );

  return buildPaginatedResult(response, mapWorkspace, { page, size });
}

export async function listWorkspaceTableRowsPaginated(
  options: PaginationOptions = {},
): Promise<PaginatedResult<DashboardWorkspaceTableRow>> {
  const pageResult = await listWorkspacesPaginated(options);
  const items = await Promise.all(
    pageResult.items.map(async (workspace) => {
      const stats = await getWorkspaceStats(workspace.id);

      return {
        ...workspace,
        peerCount: stats.peerCount,
        sessionCount: stats.sessionCount,
      };
    }),
  );

  return {
    ...pageResult,
    items,
  };
}

export async function getWorkspace(
  workspaceId: string,
): Promise<DashboardWorkspace | null> {
  const workspaces = await listWorkspaces();
  return workspaces.find((workspace) => workspace.id === workspaceId) ?? null;
}

export async function listPeers(workspaceId: string): Promise<DashboardPeer[]> {
  const client = createClient(workspaceId);
  const items = await fetchAllPages<PeerResponse>((page, size) =>
    pagePost<PeerResponse>(client, `${peersPath(workspaceId)}/list`, {
      query: { page, size },
    }),
  );

  return items.map(mapPeer);
}

export async function listPeersPaginated(
  workspaceId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResult<DashboardPeer>> {
  const page = resolvePage(options.page);
  const size = resolvePageSize(options.size, MAX_LIST_PAGE_SIZE);
  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    pagePost<PeerResponse>(client, `${peersPath(workspaceId)}/list`, {
      query: { page, size },
    }),
  );

  return buildPaginatedResult(response, mapPeer, { page, size });
}

export async function getPeer(
  workspaceId: string,
  peerId: string,
): Promise<DashboardPeer | null> {
  if (!(await getWorkspace(workspaceId))) {
    return null;
  }

  const peers = await listPeers(workspaceId);
  return peers.find((peer) => peer.id === peerId) ?? null;
}

export async function listSessions(
  workspaceId: string,
): Promise<DashboardSession[]> {
  const client = createClient(workspaceId);
  const sessions = await runHonchoRequest(() =>
    client.sessions({ size: PAGE_SIZE }),
  );
  const all = await runHonchoRequest(() => sessions.toArray());
  return all.map(mapSdkSession);
}

export async function listSessionsPaginated(
  workspaceId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResult<DashboardSession>> {
  const page = resolvePage(options.page);
  const size = resolvePageSize(options.size, MAX_LIST_PAGE_SIZE);
  const client = createClient(workspaceId);
  const sessionsPage = await runHonchoRequest(() =>
    client.sessions({ page, size }),
  );

  return buildPaginatedResult(sessionsPage, mapSdkSession);
}

export async function listPeerSessions(
  workspaceId: string,
  peerId: string,
): Promise<DashboardSession[]> {
  const client = createClient(workspaceId);
  const items = await fetchAllPages<SessionResponse>((page, size) =>
    pagePost<SessionResponse>(
      client,
      `${peerPath(workspaceId, peerId)}/sessions`,
      {
        query: { page, size },
      },
    ),
  );

  return items.map(mapSession);
}

export async function listPeerSessionsPaginated(
  workspaceId: string,
  peerId: string,
  options: PaginationOptions = {},
): Promise<PaginatedResult<DashboardSession>> {
  const page = resolvePage(options.page);
  const size = resolvePageSize(options.size, MAX_LIST_PAGE_SIZE);
  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    pagePost<SessionResponse>(
      client,
      `${peerPath(workspaceId, peerId)}/sessions`,
      { query: { page, size } },
    ),
  );

  return buildPaginatedResult(response, mapSession, { page, size });
}

export async function getPeerCard(
  workspaceId: string,
  peerId: string,
): Promise<string[] | null> {
  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    client.http.get<{ peer_card: string[] | null }>(
      `${peerPath(workspaceId, peerId)}/card`,
    ),
  );

  return response.peer_card;
}

export async function setPeerCard(
  workspaceId: string,
  peerId: string,
  peerCard: string[] | null,
): Promise<string[] | null> {
  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    client.http.put<{ peer_card: string[] | null }>(
      `${peerPath(workspaceId, peerId)}/card`,
      {
        body: { peer_card: peerCard },
      },
    ),
  );

  return response.peer_card;
}

export async function getSession(
  workspaceId: string,
  sessionId: string,
): Promise<DashboardSession | null> {
  if (!(await getWorkspace(workspaceId))) {
    return null;
  }

  const sessions = await listSessions(workspaceId);
  return sessions.find((session) => session.id === sessionId) ?? null;
}

export async function listMessages(
  workspaceId: string,
  sessionId: string,
): Promise<DashboardMessage[]> {
  if (!(await getSession(workspaceId, sessionId))) {
    throw new HonchoAppError(
      `Session ${sessionId} was not found in workspace ${workspaceId}.`,
      404,
      "honcho_session_not_found",
    );
  }

  const client = createClient(workspaceId);
  const items = await fetchAllPages<MessageResponse>((page, size) =>
    pagePost<MessageResponse>(
      client,
      `${sessionPath(workspaceId, sessionId)}/messages/list`,
      {
        query: { page, size },
      },
    ),
  );

  return items.map(mapMessage);
}

export type MessageFilters = Record<string, unknown>;

const MAX_MESSAGE_PAGE_SIZE = 100;

export async function listMessagesPaginated(
  workspaceId: string,
  sessionId: string,
  options: {
    page?: number;
    size?: number;
    reverse?: boolean;
    filters?: MessageFilters;
  } = {},
): Promise<PaginatedResult<DashboardMessage>> {
  const page = resolvePage(options.page);
  const size = resolvePageSize(options.size, MAX_MESSAGE_PAGE_SIZE);
  const reverse = options.reverse ?? false;

  const body: Record<string, unknown> = {};
  if (options.filters && Object.keys(options.filters).length > 0) {
    body.filters = options.filters;
  }

  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    pagePost<MessageResponse>(
      client,
      `${sessionPath(workspaceId, sessionId)}/messages/list`,
      {
        body,
        query: { page, size, reverse: reverse ? "true" : undefined },
      },
    ),
  );

  return buildPaginatedResult(response, mapMessage, { page, size });
}

export async function getSessionPeers(
  workspaceId: string,
  sessionId: string,
): Promise<DashboardPeer[]> {
  if (!(await getSession(workspaceId, sessionId))) {
    throw new HonchoAppError(
      `Session ${sessionId} was not found in workspace ${workspaceId}.`,
      404,
      "honcho_session_not_found",
    );
  }

  const client = createClient(workspaceId);
  const peersPage = await runHonchoRequest(() =>
    client.http.get<PageResponse<PeerResponse>>(
      `${sessionPath(workspaceId, sessionId)}/peers`,
    ),
  );

  return peersPage.items.map(mapPeer);
}

export async function listConclusions(
  workspaceId: string,
  options: {
    page?: number;
    size?: number;
    reverse?: boolean;
    filters?: ConclusionFilters;
  } = {},
): Promise<PaginatedResult<DashboardConclusion>> {
  const page = Math.max(1, options.page ?? 1);
  const size = Math.min(
    MAX_CONCLUSION_PAGE_SIZE,
    Math.max(1, options.size ?? 20),
  );
  const reverse = options.reverse ?? false;

  const bodyFilters: Record<string, unknown> = {};
  if (options.filters?.observer_id)
    bodyFilters.observer_id = options.filters.observer_id;
  if (options.filters?.observed_id)
    bodyFilters.observed_id = options.filters.observed_id;
  if (options.filters?.session_id)
    bodyFilters.session_id = options.filters.session_id;

  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    pagePost<ConclusionResponse>(
      client,
      `${conclusionsPath(workspaceId)}/list`,
      {
        body: {
          filters:
            Object.keys(bodyFilters).length > 0 ? bodyFilters : undefined,
        },
        query: { page, size, reverse: reverse ? "true" : undefined },
      },
    ),
  );

  return buildPaginatedResult(response, mapConclusion, { page, size });
}

export async function getWorkspaceStats(
  workspaceId: string,
): Promise<WorkspaceStats> {
  const client = createClient(workspaceId);

  const [peersPage, sessionsPage, conclusionsPage] = await runHonchoRequest(
    () =>
      Promise.all([
        pagePost<PeerResponse>(client, `${peersPath(workspaceId)}/list`, {
          query: { page: 1, size: 1 },
        }),
        pagePost<SessionResponse>(client, `${sessionsPath(workspaceId)}/list`, {
          query: { page: 1, size: 1 },
        }),
        pagePost<ConclusionResponse>(
          client,
          `${conclusionsPath(workspaceId)}/list`,
          { query: { page: 1, size: 1 } },
        ),
      ]),
  );

  return {
    peerCount: peersPage.total,
    sessionCount: sessionsPage.total,
    conclusionCount: conclusionsPage.total,
  };
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const client = createClient();
  await runHonchoRequest(() => client.http.delete(workspacePath(workspaceId)));
}

export async function deleteSession(
  workspaceId: string,
  sessionId: string,
): Promise<void> {
  const client = createClient(workspaceId);
  await runHonchoRequest(() =>
    client.http.delete(sessionPath(workspaceId, sessionId)),
  );
}

export async function deleteConclusion(
  workspaceId: string,
  conclusionId: string,
): Promise<void> {
  const client = createClient(workspaceId);
  await runHonchoRequest(() =>
    client.http.delete(conclusionPath(workspaceId, conclusionId)),
  );
}
