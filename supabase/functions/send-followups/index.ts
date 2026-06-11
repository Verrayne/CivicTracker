import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expectedSecret = Deno.env.get("CRON_SECRET");
  if (!expectedSecret) {
    return new Response("CRON_SECRET is not configured", { status: 500, headers: corsHeaders });
  }
  if (request.headers.get("x-cron-secret") !== expectedSecret) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: issues, error } = await supabase
      .from("issues")
      .select("*, issue_types(name)")
      .not("status", "in", '("Resolved","Closed")')
      .or(`last_followup_sent.is.null,last_followup_sent.lt.${cutoff}`)
      .lt("created_at", cutoff);
    if (error) throw error;

    const results = [];
    for (const issue of issues) {
      const { data: rule } = await supabase
        .from("routing_rules")
        .select("email_address")
        .eq("issue_type_id", issue.issue_type_id)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      const recipient = rule?.email_address || "customercare@tshwane.gov.za";
      const subject = `Follow-up: [${issue.issue_number}] ${issue.title}`;
      const html = `
        <h1>Follow-up on unresolved Ward 47 issue</h1>
        <p>Please provide a status update for <strong>${issue.issue_number}</strong>.</p>
        <p><strong>Type:</strong> ${issue.issue_types.name}</p>
        <p><strong>Address:</strong> ${issue.street_address}</p>
        <p><strong>Originally reported:</strong> ${new Date(issue.created_at).toLocaleDateString("en-ZA")}</p>
      `;

      const { data: communication } = await supabase.from("communications").insert({
        issue_id: issue.id,
        communication_type: "followup",
        recipient_email: recipient,
        subject,
        body: html,
        delivery_status: "pending",
      }).select("id").single();

      try {
        await sendEmail({
          apiKey: Deno.env.get("RESEND_API_KEY")!,
          from: Deno.env.get("RESEND_FROM_EMAIL") || "Ward 47 Civic Tracker <reports@example.org>",
          to: recipient,
          subject,
          html,
        });
        await Promise.all([
          supabase.from("communications").update({ delivery_status: "sent", sent_at: new Date().toISOString() }).eq("id", communication.id),
          supabase.from("issues").update({
            followup_count: issue.followup_count + 1,
            last_followup_sent: new Date().toISOString(),
          }).eq("id", issue.id),
        ]);
        results.push({ issue: issue.issue_number, status: "sent" });
      } catch (sendError) {
        await supabase.from("communications").update({ delivery_status: "failed" }).eq("id", communication.id);
        results.push({ issue: issue.issue_number, status: "failed", error: String(sendError) });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
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
