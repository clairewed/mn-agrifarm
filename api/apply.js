export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { name, email, phone, message } = req.body;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: Bearer ${process.env.RESEND_API_KEY},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MN Agrifarm <${process.env.FROM_EMAIL}>,
        to: [process.env.TO_EMAIL],
        reply_to: email,
        subject: "New Job Application",
        html: `
          <h2>New Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
}