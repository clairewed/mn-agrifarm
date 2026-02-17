module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Body safety (sometimes req.body is string)
  let body = req.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
  } catch (e) {}

  const name = body?.name || "";
  const email = body?.email || "";
  const phone = body?.phone || "";
  const message = body?.message || "";
  const position = body?.position || "";
  const availability = body?.availability || "";
  const location = body?.location || "";

  // Env checks (most common issue)
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: "Missing RESEND_API_KEY in Vercel env" });
  }
  if (!process.env.FROM_EMAIL) {
    return res.status(500).json({ success: false, error: "Missing FROM_EMAIL in Vercel env" });
  }
  if (!process.env.TO_EMAIL) {
    return res.status(500).json({ success: false, error: "Missing TO_EMAIL in Vercel env" });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: Bearer ${process.env.RESEND_API_KEY},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MN Agrifarm <${process.env.FROM_EMAIL}>,
        to: [process.env.TO_EMAIL],
        reply_to: email,
        subject: New Application: ${position || "Job"} — ${name || "Unknown"},
        html: `
          <h2>New Application</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Position:</b> ${position}</p>
          <p><b>Availability:</b> ${availability}</p>
          <p><b>Location:</b> ${location}</p>
          <p><b>Message:</b><br/>${String(message).replace(/\n/g, "<br/>")}</p>
        `,
      }),
    });

    const text = await r.text(); // Resend returns useful error text
    if (!r.ok) {
      console.error("Resend error:", r.status, text);
      return res.status(500).json({ success: false, error: Resend ${r.status}: ${text} });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, error: "Server error sending email" });
  }
};