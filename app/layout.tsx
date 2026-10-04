import { DM_Mono, Lora, Syne } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const syne = Syne({
	subsets: ["latin"],
	weight: ["700", "800"],
	variable: "--font-syne",
	display: "swap",
});

const dmMono = DM_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
	display: "swap",
});

const lora = Lora({
	subsets: ["latin"],
	weight: ["400"],
	style: ["normal", "italic"],
	variable: "--font-serif",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Changelog — Agentic Workflow",
	description: "Release notes and documentation for Agentic Workflow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${syne.variable} ${dmMono.variable} ${lora.variable}`}>
			<body>
				{/* Skip link — first interactive element, visible on focus */}
				<a href="#main-content" className="skip-link">
					Skip to content
				</a>
				{children}
			</body>
		</html>
	);
}
