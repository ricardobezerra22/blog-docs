import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().min(1),
	BLOG_API_KEY: z.string().min(1),
});

const result = schema.safeParse(process.env);

if (!result.success) {
	const missing = result.error.issues
		.map((i) => `  ${i.path.join(".")}: ${i.message}`)
		.join("\n");
	throw new Error(`Invalid environment variables:\n${missing}`);
}

export const env = result.data;
