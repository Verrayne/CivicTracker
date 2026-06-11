export const ISSUE_STATUSES = ["Open", "Reported", "In Progress", "Resolved", "Closed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface Ward {
  id: string;
  name: string;
  councillor_name: string | null;
  councillor_email: string | null;
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

export interface Issue {
  id: string;
  issue_number: string;
  title: string;
  description: string;
  street_address: string;
  nearest_intersection: string | null;
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
}

export interface CreateIssueInput {
  wardId: string;
  issueTypeId: string;
  title: string;
  description: string;
  streetAddress: string;
  nearestIntersection?: string;
  latitude?: number;
  longitude?: number;
  reporterName?: string;
  reporterEmail?: string;
  reporterMobile?: string;
  photos: File[];
}
