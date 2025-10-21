export interface GLFProject {
  path: string;
  name: string;
  description: string;
  url: string;
  starred: boolean;
  excluded: boolean;        // Whether project is excluded via config
  archived: boolean;        // Whether project is archived
  member: boolean;          // Whether user is a member of this project
  score?: number;           // Optional: only with --scores flag
  history_score?: number;   // Optional: only with --scores flag
  starred_bonus?: number;   // Optional: only with --scores flag
}

export interface GLFSearchResult {
  query: string;
  results: GLFProject[];
  total: number;
  limit: number;
}

export interface GLFError {
  error: string;
}

export interface GLFPreferences {
  glfPath: string;
  showScores: boolean;
  maxResults: string;
  autoSyncInterval: string;
}
