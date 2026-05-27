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
  configuration: Record<string, unknown>;
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
  configuration: Record<string, unknown>;
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
