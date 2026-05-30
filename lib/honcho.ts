import {
  conclusionListOptionsSchema,
  countProbePaginationSchema,
  type FilteredListOptions,
  type ListOptions,
  filteredListOptionsSchema,
  listOptionsSchema,
} from "@/lib/api-schemas";
import type {
  ConclusionFilters,
  DashboardConclusion,
  DashboardMessage,
  DashboardPeer,
  DashboardSession,
  DashboardWorkspace,
  DashboardWorkspaceTableRow,
  PaginatedResult,
  WorkspaceStats,
} from "@/lib/dashboard-types";
import { HonchoAppError, normalizeHonchoError } from "@/lib/honcho-errors";
import type {
  ConclusionResponse,
  Message,
  PageResponse,
  Peer,
  WorkspaceResponse,
} from "@honcho-ai/sdk";
import { Honcho, type Session } from "@honcho-ai/sdk";
import "server-only";

const API_PREFIX = "/v3";

function workspacePath(workspaceId: string): string {
  return `${API_PREFIX}/workspaces/${encodeURIComponent(workspaceId)}`;
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

function serializePeer(peer: Peer): DashboardPeer {
  const metadata = requireSdkField(peer.metadata, "peer", "metadata");
  const configuration = requireSdkField(
    peer.configuration,
    "peer",
    "configuration",
  );
  const createdAt = requireSdkField(peer.createdAt, "peer", "createdAt");

  return {
    id: peer.id,
    workspaceId: peer.workspaceId,
    metadata,
    configuration,
    createdAt,
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

function serializeSession(session: Session): DashboardSession {
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
    configuration,
    createdAt,
  };
}

function serializeMessage(message: Message): DashboardMessage {
  return {
    id: message.id,
    content: message.content,
    peerId: message.peerId,
    sessionId: message.sessionId,
    workspaceId: message.workspaceId,
    metadata: message.metadata,
    createdAt: message.createdAt,
    tokenCount: message.tokenCount,
  };
}

function serializeConclusionResponse(
  response: ConclusionResponse,
): DashboardConclusion {
  return {
    id: response.id,
    content: response.content,
    observerId: response.observer_id,
    observedId: response.observed_id,
    sessionId: response.session_id,
    createdAt: response.created_at,
  };
}

function buildPaginatedResult<TRaw, TMapped>(
  response: PageResponse<TRaw>,
  mapper: (item: TRaw) => TMapped,
): PaginatedResult<TMapped> {
  return {
    items: response.items.map(mapper),
    page: response.page,
    pages: response.pages,
    size: response.size,
    total: response.total,
  };
}

export async function listWorkspacesPaginated(
  options: FilteredListOptions = {},
): Promise<PaginatedResult<DashboardWorkspace>> {
  const { filters, page, reverse, size } =
    filteredListOptionsSchema.parse(options);
  const client = createClient();
  const response = await runHonchoRequest(() =>
    pagePost<WorkspaceResponse>(client, `${API_PREFIX}/workspaces/list`, {
      body: filters ? { filters } : {},
      query: { page, reverse, size },
    }),
  );

  return buildPaginatedResult(response, mapWorkspace);
}

export async function listWorkspaceTableRowsPaginated(
  options: ListOptions = {},
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
  const workspaces = await listWorkspacesPaginated({
    filters: { id: workspaceId },
    size: 1,
  });
  return workspaces.items.find(({ id }) => id === workspaceId) ?? null;
}

export async function listPeers(workspaceId: string): Promise<DashboardPeer[]> {
  const client = createClient(workspaceId);
  const peers = await runHonchoRequest(() => client.peers());
  const items = await runHonchoRequest(() => peers.toArray());

  return items.map(serializePeer);
}

export async function listPeersPaginated(
  workspaceId: string,
  options: ListOptions = {},
): Promise<PaginatedResult<DashboardPeer>> {
  const { page, reverse, size } = listOptionsSchema.parse(options);
  const client = createClient(workspaceId);
  const response = await runHonchoRequest(() =>
    client.peers({ page, reverse, size }),
  );

  return buildPaginatedResult(response, serializePeer);
}

export async function getPeer(
  workspaceId: string,
  peerId: string,
): Promise<DashboardPeer | null> {
  const client = createClient(workspaceId);
  const peer = await runHonchoRequest(() => client.peer(peerId));

  return peer ? serializePeer(peer) : null;
}

export async function listSessions(
  workspaceId: string,
): Promise<DashboardSession[]> {
  const client = createClient(workspaceId);
  const sessions = await runHonchoRequest(() => client.sessions());
  const all = await runHonchoRequest(() => sessions.toArray());
  return all.map(serializeSession);
}

export async function listSessionsPaginated(
  workspaceId: string,
  options: ListOptions = {},
): Promise<PaginatedResult<DashboardSession>> {
  const { page, reverse, size } = listOptionsSchema.parse(options);
  const client = createClient(workspaceId);
  const sessionsPage = await runHonchoRequest(() =>
    client.sessions({ page, reverse, size }),
  );

  return buildPaginatedResult(sessionsPage, serializeSession);
}

export async function listPeerSessions(
  workspaceId: string,
  peerId: string,
): Promise<DashboardSession[]> {
  const client = createClient(workspaceId);
  const peer = await runHonchoRequest(() => client.peer(peerId));
  const sessions = await runHonchoRequest(() => peer.sessions());
  const items = await runHonchoRequest(() => sessions.toArray());

  return items.map(serializeSession);
}

export async function listPeerSessionsPaginated(
  workspaceId: string,
  peerId: string,
  options: ListOptions = {},
): Promise<PaginatedResult<DashboardSession>> {
  const { page, reverse, size } = listOptionsSchema.parse(options);
  const client = createClient(workspaceId);
  const peer = await runHonchoRequest(() => client.peer(peerId));
  const response = await runHonchoRequest(() =>
    peer.sessions({ page, reverse, size }),
  );

  return buildPaginatedResult(response, serializeSession);
}

export async function getPeerCard(
  workspaceId: string,
  peerId: string,
): Promise<string[] | null> {
  const client = createClient(workspaceId);
  const peer = await runHonchoRequest(() => client.peer(peerId));

  return runHonchoRequest(() => peer.getCard());
}

export async function setPeerCard(
  workspaceId: string,
  peerId: string,
  peerCard: string[] | null,
): Promise<string[] | null> {
  const client = createClient(workspaceId);
  const peer = await runHonchoRequest(() => client.peer(peerId));

  return runHonchoRequest(() => peer.setCard(peerCard ?? []));
}

export async function getSession(
  workspaceId: string,
  sessionId: string,
): Promise<DashboardSession | null> {
  const client = createClient(workspaceId);
  const session = await runHonchoRequest(() => client.session(sessionId));

  return session ? serializeSession(session) : null;
}

export type MessageFilters = Record<string, unknown>;

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
  const { filters, page, size, reverse } =
    filteredListOptionsSchema.parse(options);

  const client = createClient(workspaceId);
  const session = await runHonchoRequest(() => client.session(sessionId));
  const response = await runHonchoRequest(() =>
    session.messages({
      page,
      size,
      reverse,
      ...(filters && Object.keys(filters).length > 0 ? { filters } : {}),
    }),
  );

  return buildPaginatedResult(response, serializeMessage);
}

export async function getSessionPeers(
  workspaceId: string,
  sessionId: string,
): Promise<DashboardPeer[]> {
  const client = createClient(workspaceId);
  const session = await runHonchoRequest(() => client.session(sessionId));
  const peers = await runHonchoRequest(() => session.peers());

  return peers.map(serializePeer);
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
  const { filters, page, size, reverse } =
    conclusionListOptionsSchema.parse(options);
  const bodyFilters: Record<string, unknown> = {};
  if (filters?.observer_id) bodyFilters.observer_id = filters.observer_id;
  if (filters?.observed_id) bodyFilters.observed_id = filters.observed_id;
  if (filters?.session_id) bodyFilters.session_id = filters.session_id;

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

  return buildPaginatedResult(response, serializeConclusionResponse);
}

export async function getWorkspaceStats(
  workspaceId: string,
): Promise<WorkspaceStats> {
  const client = createClient(workspaceId);
  const countProbePagination = countProbePaginationSchema.parse({ size: 1 });

  const [peersPage, sessionsPage, conclusionsPage] = await runHonchoRequest(
    () =>
      Promise.all([
        client.peers(countProbePagination),
        client.sessions(countProbePagination),
        pagePost<ConclusionResponse>(
          client,
          `${conclusionsPath(workspaceId)}/list`,
          { query: countProbePagination },
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
  await runHonchoRequest(() => client.deleteWorkspace(workspaceId));
}

export async function deleteSession(
  workspaceId: string,
  sessionId: string,
): Promise<void> {
  const client = createClient(workspaceId);
  const session = await runHonchoRequest(() => client.session(sessionId));
  await runHonchoRequest(() => session.delete());
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
