import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { AdminCommunication, Issue, IssueType, Municipality, Ward } from "../types";

export interface AdminSettings {
  email_delivery_enabled: boolean;
  updated_at: string;
}

export interface WardInput {
  name: string;
  municipality_id: string;
  councillor_name: string;
  councillor_email: string;
  councillor_mobile: string;
  councillor_website_url: string;
  councillor_instagram_url: string;
  councillor_tiktok_url: string;
  councillor_facebook_url: string;
}

export interface MunicipalityInput {
  name: string;
  province: string;
  routing_emails: Record<string, string>;
}

export interface RoutingRule {
  id: string | null;
  municipality_id: string;
  issue_type_id: string;
  email_address: string;
  active: boolean;
  issue_type: IssueType;
}

export async function signInAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    await supabase.auth.signOut();
    throw new Error("This account does not have administrator access.");
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("email_delivery_enabled,updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmailDelivery(enabled: boolean): Promise<AdminSettings> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("app_settings")
    .update({
      email_delivery_enabled: enabled,
      updated_at: new Date().toISOString(),
      updated_by: userData.user?.id,
    })
    .eq("singleton", true)
    .select("email_delivery_enabled,updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function createWard(input: WardInput): Promise<Ward> {
  const { data, error } = await supabase
    .from("wards")
    .insert({
      name: input.name.trim(),
      municipality_id: input.municipality_id,
      councillor_name: input.councillor_name.trim() || null,
      councillor_email: input.councillor_email.trim() || null,
      councillor_mobile: input.councillor_mobile.trim() || null,
      councillor_website_url: input.councillor_website_url.trim() || null,
      councillor_instagram_url: input.councillor_instagram_url.trim() || null,
      councillor_tiktok_url: input.councillor_tiktok_url.trim() || null,
      councillor_facebook_url: input.councillor_facebook_url.trim() || null,
    })
    .select(`
      id,name,municipality_id,councillor_name,councillor_email,councillor_mobile,
      councillor_website_url,councillor_instagram_url,councillor_tiktok_url,councillor_facebook_url,
      municipalities(id,name,province)
    `)
    .single();
  if (error) throw error;
  return data as unknown as Ward;
}

export async function updateWard(id: string, input: WardInput): Promise<Ward> {
  const { data, error } = await supabase
    .from("wards")
    .update({
      name: input.name.trim(),
      municipality_id: input.municipality_id,
      councillor_name: input.councillor_name.trim() || null,
      councillor_email: input.councillor_email.trim() || null,
      councillor_mobile: input.councillor_mobile.trim() || null,
      councillor_website_url: input.councillor_website_url.trim() || null,
      councillor_instagram_url: input.councillor_instagram_url.trim() || null,
      councillor_tiktok_url: input.councillor_tiktok_url.trim() || null,
      councillor_facebook_url: input.councillor_facebook_url.trim() || null,
    })
    .eq("id", id)
    .select(`
      id,name,municipality_id,councillor_name,councillor_email,councillor_mobile,
      councillor_website_url,councillor_instagram_url,councillor_tiktok_url,councillor_facebook_url,
      municipalities(id,name,province)
    `)
    .single();
  if (error) throw error;
  return data as unknown as Ward;
}

export async function createMunicipality(input: MunicipalityInput): Promise<Municipality> {
  const { data, error } = await supabase
    .from("municipalities")
    .insert({ name: input.name.trim(), province: input.province.trim() })
    .select("id,name,province")
    .single();
  if (error) throw error;
  await saveMunicipalityRoutingRules(data.id, input.routing_emails);
  return data;
}

export async function updateMunicipality(id: string, input: MunicipalityInput): Promise<Municipality> {
  const { data, error } = await supabase
    .from("municipalities")
    .update({ name: input.name.trim(), province: input.province.trim() })
    .eq("id", id)
    .select("id,name,province")
    .single();
  if (error) throw error;
  await saveMunicipalityRoutingRules(id, input.routing_emails);
  return data;
}

export async function getAdminIssues(): Promise<Issue[]> {
  const { data, error } = await supabase
    .from("issues")
    .select(`
      id, issue_number, title, description, street_address, nearest_intersection,
      latitude, longitude, status, reference_number, followup_count, created_at, updated_at,
      issue_types(id,name), wards(name), issue_photos(id,storage_path)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Issue[];
}

export async function deleteIssue(issue: Issue) {
  const storagePaths = issue.issue_photos.map((photo) => photo.storage_path);
  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage.from("issue-photos").remove(storagePaths);
    if (storageError) throw new Error(`Could not remove issue photos: ${storageError.message}`);
  }

  const { error } = await supabase.from("issues").delete().eq("id", issue.id);
  if (error) throw error;
}

export async function getAdminCommunications(): Promise<AdminCommunication[]> {
  const { data, error } = await supabase
    .from("communications")
    .select(`
      id,issue_id,communication_type,recipient_email,subject,body,delivery_status,sent_at,created_at,
      issues(issue_number,title,issue_types(id,name))
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as AdminCommunication[];
}

export async function resendCommunication(communicationId: string) {
  const { data, error } = await supabase.functions.invoke("send-issue-notification", {
    body: { communicationId, resend: true },
  });
  if (error instanceof FunctionsHttpError) {
    try {
      const response = await error.context.json();
      throw new Error(response.error || error.message);
    } catch (responseError) {
      if (responseError instanceof Error && responseError.message !== "Unexpected end of JSON input") {
        throw responseError;
      }
    }
  }
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getRoutingRules(): Promise<RoutingRule[]> {
  const { data, error } = await supabase
    .from("routing_rules")
    .select("id,municipality_id,issue_type_id,email_address,active,issue_types(id,name)")
    .eq("active", true);
  if (error) throw error;
  return data?.map((rule) => ({
    ...rule,
    issue_type: Array.isArray(rule.issue_types) ? rule.issue_types[0] : rule.issue_types,
  })) as unknown as RoutingRule[];
}

async function saveMunicipalityRoutingRules(municipalityId: string, routingEmails: Record<string, string>) {
  const rows = Object.entries(routingEmails).map(([issueTypeId, emailAddress]) => ({
    municipality_id: municipalityId,
    issue_type_id: issueTypeId,
    email_address: emailAddress.trim(),
    active: true,
  }));
  const { error } = await supabase
    .from("routing_rules")
    .upsert(rows, { onConflict: "municipality_id,issue_type_id" });
  if (error) throw error;
}
