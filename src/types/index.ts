export const ISSUE_STATUSES = ["Open", "Reported", "In Progress", "Resolved", "Closed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface Municipality {
  id: string;
  name: string;
  province: string;
  website: string | null;
  employee_count: number | null;
}

export interface Ward {
  id: string;
  name: string;
  municipality_id: string;
  councillor_name: string | null;
  councillor_email: string | null;
  councillor_mobile: string | null;
  councillor_website_url: string | null;
  councillor_instagram_url: string | null;
  councillor_tiktok_url: string | null;
  councillor_facebook_url: string | null;
  municipalities?: Municipality | null;
}

export interface IssueType {
  id: string;
  name: string;
}

export interface IssuePhoto {
  id: string;
  storage_path: string;
  public_url?: string;
}

export interface PublicCommunication {
  id: string;
  communication_type: "initial" | "followup";
  recipient_email: string;
  subject: string;
  body: string;
  delivery_status: "pending" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

export interface AdminCommunication extends PublicCommunication {
  issue_id: string;
  issues: {
    issue_number: string;
    title: string;
    issue_types: IssueType | null;
  } | null;
}

export interface Issue {
  id: string;
  issue_number: string;
  title: string;
  description: string;
  street_address: string;
  nearest_intersection: string | null;
  lamp_pole_number: string | null;
  latitude: number | null;
  longitude: number | null;
  status: IssueStatus;
  reference_number: string | null;
  followup_count: number;
  created_at: string;
  updated_at: string;
  issue_types: IssueType | null;
  wards?: Pick<Ward, "name"> | null;
  issue_photos: IssuePhoto[];
  communications?: PublicCommunication[];
}

export interface CreateIssueInput {
  wardId: string;
  issueTypeId: string;
  title: string;
  description: string;
  streetAddress: string;
  nearestIntersection?: string;
  lampPoleNumber?: string;
  latitude?: number;
  longitude?: number;
  reporterName?: string;
  reporterEmail?: string;
  photos: File[];
}

export interface MunicipalBudgetSummary {
  id: string;
  municipality_id: string;
  financial_year: string;
  total_revenue: number;
  total_expenditure: number;
  capital_budget: number;
  operating_budget: number;
  is_sample_data: boolean;
}

export interface MunicipalBudgetAllocation {
  id: string;
  budget_summary_id: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface MunicipalBudgetDocument {
  id: string;
  municipality_id: string;
  financial_year: string;
  title: string;
  document_url: string;
}

export interface MunicipalDepartment {
  id: string;
  municipality_id: string;
  name: string;
  description: string | null;
}

export interface MunicipalOfficial {
  id: string;
  department_id: string;
  full_name: string;
  position: string;
  email: string | null;
  profile_image_url: string | null;
  bio: string | null;
  responsibilities: string | null;
  manager_id: string | null;
  display_order: number;
  municipal_departments?: Pick<MunicipalDepartment, "id" | "name"> | null;
}

export interface MunicipalKpi {
  id: string;
  municipality_id: string;
  department_name: string;
  kpi_name: string;
  target_value: number;
  actual_value: number;
  achievement_percentage: number;
  reporting_period: string;
  is_sample_data: boolean;
}

export interface MunicipalityIssueMetrics {
  total: number;
  resolved: number;
  open: number;
  resolutionRate: number;
  averageResolutionDays: number;
}

export interface MunicipalityOverviewData {
  municipality: Municipality;
  latestBudget: MunicipalBudgetSummary | null;
  departmentCount: number;
  municipalManager: MunicipalOfficial | null;
  issueMetrics: MunicipalityIssueMetrics;
}

export interface MunicipalityBudgetData {
  summaries: MunicipalBudgetSummary[];
  currentSummary: MunicipalBudgetSummary | null;
  allocations: MunicipalBudgetAllocation[];
  documents: MunicipalBudgetDocument[];
}

export interface MunicipalityManagementData {
  departments: MunicipalDepartment[];
  officials: MunicipalOfficial[];
}

export interface MunicipalityMonthlyTrend {
  month: string;
  newIssues: number;
  resolvedIssues: number;
  averageResolutionDays: number;
}

export interface MunicipalityPerformanceData {
  issueMetrics: MunicipalityIssueMetrics;
  serviceMetrics: Record<string, number>;
  monthlyTrends: MunicipalityMonthlyTrend[];
  kpis: MunicipalKpi[];
}
