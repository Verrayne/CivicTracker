import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { issueId } = await request.json();
    if (!issueId) throw new Error("issueId is required");

    const { data: issue, error } = await supabase
      .from("issues")
      .select("*, issue_types(name), wards(name), issue_photos(storage_path)")
      .eq("id", issueId)
      .single();
    if (error) throw error;

    const { data: rule } = await supabase
      .from("routing_rules")
      .select("email_address")
      .eq("issue_type_id", issue.issue_type_id)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    const recipient = rule?.email_address || "customercare@tshwane.gov.za";

    const { data: existingCommunication } = await supabase
      .from("communications")
      .select("id,delivery_status")
      .eq("issue_id", issue.id)
      .eq("communication_type", "initial")
      .in("delivery_status", ["pending", "sent"])
      .maybeSingle();
    if (existingCommunication) {
      return new Response(JSON.stringify({ success: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `[${issue.issue_number}] ${issue.issue_types.name}: ${issue.title}`;
    const photoLinks = issue.issue_photos.map((photo: { storage_path: string }) =>
      supabase.storage.from("issue-photos").getPublicUrl(photo.storage_path).data.publicUrl
    );
    const mapsUrl = issue.latitude && issue.longitude
      ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.street_address)}`;
    const html = `
      <h1>New Ward 47 municipal issue</h1>
      <p><strong>Issue:</strong> ${issue.issue_number}</p>
      <p><strong>Type:</strong> ${issue.issue_types.name}</p>
      <p><strong>Title:</strong> ${issue.title}</p>
      <p><strong>Description:</strong><br>${issue.description}</p>
      <p><strong>Address:</strong> ${issue.street_address}</p>
      <p><a href="${mapsUrl}">View location on Google Maps</a></p>
      ${photoLinks.length ? `<p><strong>Photos:</strong><br>${photoLinks.map((url: string) => `<a href="${url}">${url}</a>`).join("<br>")}</p>` : ""}
    `;

    const { data: communication, error: communicationError } = await supabase
      .from("communications")
      .insert({
        issue_id: issue.id,
        communication_type: "initial",
        recipient_email: recipient,
        subject,
        body: html,
        delivery_status: "pending",
      })
      .select("id")
      .single();
    if (communicationError) throw communicationError;

    if (Deno.env.get("EMAIL_DELIVERY_ENABLED") !== "true") {
      console.log(`Email delivery disabled; retained pending communication ${communication.id}`);
      return new Response(JSON.stringify({ success: true, deliveryEnabled: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      await sendEmail({
        apiKey: Deno.env.get("RESEND_API_KEY")!,
        from: Deno.env.get("RESEND_FROM_EMAIL") || "WardWorks <notifications@wardworks.co.za>",
        to: recipient,
        subject,
        html,
      });
      await Promise.all([
        supabase.from("communications").update({ delivery_status: "sent", sent_at: new Date().toISOString() }).eq("id", communication.id),
        supabase.from("issues").update({ status: "Reported" }).eq("id", issue.id).eq("status", "Open"),
      ]);
    } catch (sendError) {
      await supabase.from("communications").update({ delivery_status: "failed" }).eq("id", communication.id);
      throw sendError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
