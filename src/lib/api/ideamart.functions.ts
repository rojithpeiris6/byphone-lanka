import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const IDEAMART_APP_ID_MOBITEL = "APP_007258";
const IDEAMART_APP_ID_DEFAULT = "APP_067841";

function getIdeamartAppId(phoneNumber: string): string {
  const prefixes = ["9471", "9470", "071", "070"];
  for (const prefix of prefixes) {
    if (phoneNumber.startsWith(prefix)) {
      return IDEAMART_APP_ID_MOBITEL;
    }
  }
  return IDEAMART_APP_ID_DEFAULT;
}

const requestOtpSchema = z.object({
  subscriberId: z.string().min(9, "Phone number too short"),
});

export const requestOtpFn = createServerFn({ method: "POST" })
  .inputValidator(requestOtpSchema)
  .handler(async ({ data }) => {
    const { subscriberId } = data;
    const applicationId = getIdeamartAppId(subscriberId);

    const payload = {
      client: "MOBILEAPP",
      device: "web",
      os: "web",
      appCode: "op",
      applicationId,
      subscriberId,
    };

    try {
      const response = await fetch("https://appzone.lk/api/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.statusCode !== "S1000") {
        throw new Error(result.message || "Failed to request OTP");
      }

      return {
        success: true,
        referenceNo: result.referenceNo,
        applicationId,
        message: result.message,
      };
    } catch (error: any) {
      console.error("OTP Request Error:", error);
      throw new Error(error.message || "An error occurred while requesting OTP");
    }
  });

const verifyOtpSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits"),
  applicationId: z.string(),
  referenceNo: z.string(),
  productId: z.string().optional(),
  phone: z.string().optional(),
});

export const verifyOtpFn = createServerFn({ method: "POST" })
  .inputValidator(verifyOtpSchema)
  .handler(async ({ data }) => {
    const { otp, applicationId, referenceNo } = data;

    const payload = {
      otp,
      applicationId,
      referenceNo,
    };

    try {
      const response = await fetch("https://appzone.lk/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.statusCode !== "S1000") {
        throw new Error(result.message || "Failed to verify OTP");
      }

      return {
        success: true,
        message: result.message,
      };
    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      throw new Error(error.message || "An error occurred while verifying OTP");
    }
  });
