import { supabase } from "../lib/supabase";
import type { Issue, Ward } from "../types";

export interface AdminSettings {
  email_delivery_enabled: boolean;
  updated_at: string;
}

export interface WardInput {
  name: string;
  councillor_name: string;
  councillor_email: string;
  councillor_mobile: string;
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
      councillor_name: input.councillor_name.trim() || null,
      councillor_email: input.councillor_email.trim() || null,
      councillor_mobile: input.councillor_mobile.trim() || null,
    })
    .select("id,name,councillor_name,councillor_email,councillor_mobile")
    .single();
  if (error) throw error;
  return data;
}

export async function updateWard(id: string, input: WardInput): Promise<Ward> {
  const { data, error } = await supabase
    .from("wards")
    .update({
      name: input.name.trim(),
      councillor_name: input.councillor_name.trim() || null,
      councillor_email: input.councillor_email.trim() || null,
      councillor_mobile: input.councillor_mobile.trim() || null,
    })
    .eq("id", id)
    .select("id,name,councillor_name,councillor_email,councillor_mobile")
    .single();
  if (error) throw error;
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
