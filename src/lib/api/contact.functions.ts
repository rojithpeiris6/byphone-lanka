import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator(contactSchema)
  .handler(async ({ data }) => {
    // In a real application, this would send an email via Resend/SendGrid 
    // or save the message to a Supabase table.
    console.log("Contact Form Submission:", data);
    
    return {
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon!",
    };
  });