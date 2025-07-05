import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
  }

  const body = await req.json();
  const {
    fullName, phoneNumber, address, city, state, zipCode,
    additionalNotes, productSku, productName, productPower
  } = body;

  const client = new SmtpClient();
  try {
    await client.connectTLS({
      hostname: "smtp.zoho.in",
      port: 465,
      username: Deno.env.get("ZOHO_USERNAME"),
      password: Deno.env.get("ZOHO_PASSWORD"),
    });

    await client.send({
      from: "inquire@type3solar.in",
      to: "saksham@type3solar.in",
      subject: "New Site Visit Request",
      content: `
        Name: ${fullName}
        Phone: ${phoneNumber}
        Address: ${address}, ${city}, ${state}, ${zipCode}
        Product: ${productName} (${productSku}, ${productPower} kW)
        Notes: ${additionalNotes}
      `,
    });
    await client.close();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders() });
  }
});
