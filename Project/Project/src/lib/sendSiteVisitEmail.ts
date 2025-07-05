// Helper to call Supabase Edge Function for site visit email
export async function sendSiteVisitEmail(details: {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  additionalNotes: string;
  productSku: string;
  productName: string;
  productPower: number;
}) {
  // Using your actual Supabase project ref
  const projectRef = "dtuoyawpebjcmfesgwwn";
  const url = `https://${projectRef}.functions.supabase.co/send-sitevisit-email`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });
  if (!res.ok) {
    throw new Error("Failed to send site visit email");
  }
  return res.json();
}
