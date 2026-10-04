import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = "true";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.{ts,tsx}"],
		coverage: {
			reporter: ["text", "lcov"],
			include: ["lib/**", "app/api/**"],
			exclude: ["node_modules/**", ".next/**"],
			thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
		},
	},
	resolve: {
		alias: { "@": resolve(__dirname, ".") },
	},
});
