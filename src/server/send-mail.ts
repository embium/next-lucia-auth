import { env } from "@/env";
import { z } from "zod";

const resendErrorSchema = z.union([
  z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  z.object({
    name: z.literal("UnknownError"),
    message: z.literal("Unknown Error"),
    statusCode: z.literal(500),
    cause: z.any(),
  }),
]);

type ResendError = z.infer<typeof resendErrorSchema>;

const resendSuccessSchema = z.object({
  id: z.string(),
});

export type MessageInfo = {
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail({
  ...options
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = "hello@conspiracy-expert.online";

  const email = {
    from,
    ...options,
  };

  // feel free to remove this condition once you've set up resend
  /*
	if (!process.env.RESEND_API_KEY && !process.env.MOCKS) {
		console.error(`RESEND_API_KEY not set and we're not in mocks mode.`)
		console.error(
			`To send emails, set the RESEND_API_KEY environment variable.`,
		)
		console.error(`Would have sent the following email:`, JSON.stringify(email))
		return {
			status: 'success',
			data: { id: 'mocked' },
		} as const
	}
	*/

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    body: JSON.stringify(email),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as
    | typeof resendErrorSchema
    | typeof resendSuccessSchema;
  const parsedData = resendSuccessSchema.safeParse(data);

  if (response.ok && parsedData.success) {
    return {
      status: "success",
      data: parsedData,
    } as const;
  } else {
    const parseResult = resendErrorSchema.safeParse(data);
    if (parseResult.success) {
      return {
        status: "error",
        error: parseResult.data,
      } as const;
    } else {
      return {
        status: "error",
        error: {
          name: "UnknownError",
          message: "Unknown Error",
          statusCode: 500,
          cause: data,
        } satisfies ResendError,
      } as const;
    }
  }
}
