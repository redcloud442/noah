import axios from "axios";

export const emailSevice = {
  sendEmail: async (params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => {
    const { to, subject, text, html } = params;

    const res = await axios.post("/api/v1/email/send-email", {
      to,
      subject,
      text,
      html,
    });

    if (res.status !== 200) {
      throw new Error("Failed to send email");
    }

    return res.data;
  },
};
