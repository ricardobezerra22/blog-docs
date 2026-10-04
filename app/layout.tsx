import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Docs | Agentic Workflow",
	description: "Release notes and documentation for Agentic Workflow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<div className="mx-auto max-w-3xl px-4 py-12">{children}</div>
			</body>
		</html>
	);
}
