import { supabase } from "../lib/supabase";
import type { CreateIssueInput, Issue, IssuePhoto, IssueStatus, IssueType, PublicCommunication, Ward } from "../types";

export interface IssueFilters {
  status?: IssueStatus | "All";
  search?: string;
  sort?: "newest" | "oldest" | "followups";
}

function withPhotoUrls<T extends Issue>(issue: T): T {
  return {
    ...issue,
    issue_photos: (issue.issue_photos || []).map((photo: IssuePhoto) => ({
      ...photo,
      public_url: supabase.storage.from("issue-photos").getPublicUrl(photo.storage_path).data.publicUrl,
    })),
  };
}

export async function getWards(): Promise<Ward[]> {
  const { data, error } = await supabase.from("wards").select("id,name,councillor_name,councillor_email").order("name");
  if (error) throw error;
  return data;
}

export async function getIssueTypes(): Promise<IssueType[]> {
  const { data, error } = await supabase.from("issue_types").select("id,name").order("name");
  if (error) throw error;
  return data;
}

export async function getIssues(filters: IssueFilters): Promise<Issue[]> {
  let query = supabase
    .from("issues")
    .select(`
      id, issue_number, title, description, street_address, nearest_intersection,
      latitude, longitude, status, reference_number, followup_count, created_at, updated_at,
      issue_types(id,name), wards(name), issue_photos(id,storage_path)
    `);

  if (filters.status && filters.status !== "All") query = query.eq("status", filters.status);
  if (filters.search?.trim()) {
    const term = filters.search.trim().replaceAll(",", " ");
    query = query.or(
      `issue_number.ilike.%${term}%,title.ilike.%${term}%,description.ilike.%${term}%,street_address.ilike.%${term}%`,
    );
  }

  if (filters.sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (filters.sort === "followups") query = query.order("followup_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Issue[]).map(withPhotoUrls);
}

export async function getLatestIssue(): Promise<Issue | null> {
  const { data, error } = await supabase
    .from("issues")
    .select(`
      id, issue_number, title, description, street_address, nearest_intersection,
      latitude, longitude, status, reference_number, followup_count, created_at, updated_at,
      issue_types(id,name), wards(name), issue_photos(id,storage_path)
    `)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? withPhotoUrls(data as unknown as Issue) : null;
}

export async function getIssue(issueNumber: string): Promise<Issue> {
  const [issueResult, communicationsResult] = await Promise.all([
    supabase
      .from("issues")
      .select(`
        id, issue_number, title, description, street_address, nearest_intersection,
        latitude, longitude, status, reference_number, followup_count, created_at, updated_at,
        issue_types(id,name), wards(name), issue_photos(id,storage_path)
      `)
      .eq("issue_number", issueNumber)
      .single(),
    supabase
      .from("public_issue_communications")
      .select("id,communication_type,recipient_email,subject,body,delivery_status,sent_at,created_at")
      .eq("issue_number", issueNumber)
      .order("created_at", { ascending: false }),
  ]);

  if (issueResult.error) throw issueResult.error;
  if (communicationsResult.error) throw communicationsResult.error;
  return withPhotoUrls({
    ...(issueResult.data as unknown as Issue),
    communications: communicationsResult.data as PublicCommunication[],
  });
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const { data: issue, error } = await supabase
    .from("issues")
    .insert({
      ward_id: input.wardId,
      issue_type_id: input.issueTypeId,
      title: input.title,
      description: input.description,
      street_address: input.streetAddress,
      nearest_intersection: input.nearestIntersection || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      reporter_name: input.reporterName || null,
      reporter_email: input.reporterEmail || null,
    })
    .select("id,issue_number")
    .single();

  if (error) throw error;

  if (input.photos.length) {
    const photoRows: { issue_id: string; storage_path: string }[] = [];

    for (const [index, photo] of input.photos.entries()) {
      const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const safePath = `${issue.issue_number}/${crypto.randomUUID()}-${index + 1}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(safePath, photo, { contentType: photo.type, upsert: false });

      if (uploadError) throw new Error(`Issue saved, but a photo upload failed: ${uploadError.message}`);
      photoRows.push({ issue_id: issue.id, storage_path: safePath });
    }

    const { error: photoError } = await supabase.from("issue_photos").insert(photoRows);
    if (photoError) throw new Error(`Issue saved, but photo records failed: ${photoError.message}`);
  }

  // Notification failure is intentionally non-blocking.
  void supabase.functions.invoke("send-issue-notification", { body: { issueId: issue.id } });

  return getIssue(issue.issue_number);
}
