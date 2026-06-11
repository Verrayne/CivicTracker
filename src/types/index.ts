export const ISSUE_STATUSES = ["Open", "Reported", "In Progress", "Resolved", "Closed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface Municipality {
  id: string;
  name: string;
  province: string;
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
