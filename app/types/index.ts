// ─── Domain Types ───

export const DOMAINS = [
  { id: "info", label: "Informatique", icon: "⌘", desc: "Dev, IA, Réseaux, Cybersécurité" },
  { id: "marketing", label: "Marketing", icon: "◈", desc: "Digital, Stratégie, Communication" },
  { id: "rh", label: "Ressources Humaines", icon: "◉", desc: "Management, Formation, GPEC" },
  { id: "finance", label: "Finance", icon: "◆", desc: "Audit, Contrôle, Marchés" },
  { id: "droit", label: "Droit", icon: "§", desc: "Juridique, Compliance, Contrats" },
  { id: "other", label: "Autre", icon: "✦", desc: "Tout autre champ d'études" },
] as const;

export type DomainId = (typeof DOMAINS)[number]["id"];

export interface Step {
  label: string;
}

export interface Task {
  id: string;
  title: string;
  steps: Step[];
  tip?: string;
}

export interface Quest {
  id: number;
  phase: string;
  title: string;
  emoji: string;
  desc: string;
  tasks: Task[];
}

export interface Analysis {
  subject: string;
  keywords?: string[];
  domain_specific?: string;
  difficulty?: string;
  estimated_weeks?: number;
}

export interface RequirementsSummary {
  title?: string;
  main_objective?: string;
  deliverables?: string[];
  constraints?: string[];
  evaluation_criteria?: string[];
}

export type CompletedSteps = Record<string, boolean>;

export type SaveStatus = "saving" | "saved" | "error" | null;

export type AnalysisSource = "ai" | "fallback" | null;

export type Page = "landing" | "onboard" | "dashboard";

export type ThemeMode = "dark" | "light";

// ─── App State ───

export interface AppState {
  page: Page;
  domain: DomainId | null;
  quests: Quest[];
  analysis: Analysis | null;
  requirementsSummary: RequirementsSummary | null;
  analysisSource: AnalysisSource;
  completedSteps: CompletedSteps;
  activeQuest: number;
  activeTask: string | null;
  hasSavedData: boolean;
  saveStatus: SaveStatus;
}

export type AppAction =
  | { type: "SET_PAGE"; payload: Page }
  | { type: "SET_DOMAIN"; payload: DomainId | null }
  | { type: "SET_QUESTS"; payload: Quest[] }
  | { type: "SET_ANALYSIS"; payload: Analysis | null }
  | { type: "SET_REQUIREMENTS_SUMMARY"; payload: RequirementsSummary | null }
  | { type: "SET_ANALYSIS_SOURCE"; payload: AnalysisSource }
  | { type: "TOGGLE_STEP"; payload: string }
  | { type: "SET_ACTIVE_QUEST"; payload: number }
  | { type: "SET_ACTIVE_TASK"; payload: string | null }
  | { type: "SET_HAS_SAVED_DATA"; payload: boolean }
  | { type: "SET_SAVE_STATUS"; payload: SaveStatus }
  | { type: "LOAD_USER_DATA"; payload: Partial<AppState> }
  | { type: "RESET" };

// ─── API Types ───

export interface AnalyzeRequest {
  text?: string | null;
  domain: DomainId;
  fileBase64?: string | null;
  fileType?: string | null;
}

export interface AnalyzeResponse {
  quests?: Quest[];
  analysis?: Analysis;
  requirements_summary?: RequirementsSummary;
  error?: string;
}

// ─── User Progress (Supabase) ───

export interface UserProgress {
  user_id: string;
  quests: Quest[];
  completed_steps: CompletedSteps;
  analysis: Analysis | null;
  requirements_summary: RequirementsSummary | null;
  domain: DomainId | null;
  active_quest: number;
  updated_at: string;
  version: number;
}
