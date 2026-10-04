"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface FilterBarProps {
	q: string;
	tag: string;
	date: string;
	allTags: { name: string; slug: string }[];
	allDates: { value: string; label: string }[];
}

const controlStyle: React.CSSProperties = {
	background: "#0e0e0e",
	border: "1px solid rgba(255,255,255,0.08)",
	borderRadius: "3px",
	color: "var(--fg)",
	fontFamily: "var(--font-mono)",
	fontSize: "0.75rem",
	padding: "8px 12px",
	outline: "none",
	minHeight: "40px",
	transition: "border-color 0.15s",
	width: "100%",
};

export function FilterBar({ q, tag, date, allTags, allDates }: FilterBarProps) {
	const router = useRouter();
	const [inputValue, setInputValue] = useState(q);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Keep input in sync if URL changes externally (e.g. back button)
	useEffect(() => { setInputValue(q); }, [q]);

	function pushParam(key: string, value: string) {
		// Read current URL params fresh each call — avoids stale closures
		const params = new URLSearchParams(window.location.search);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		// Reset to page 1 whenever a filter changes
		params.delete("page");
		const qs = params.toString();
		router.push(qs ? `/?${qs}` : "/");
	}

	function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;
		setInputValue(val);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => pushParam("q", val.trim()), 400);
	}

	const hasFilters = !!(q || tag || date);

	return (
		<div
			role="search"
			aria-label="Filter posts"
			style={{ marginBottom: "24px" }}
		>
			<div style={{
				display: "flex",
				gap: "10px",
				flexWrap: "wrap",
				alignItems: "flex-end",
			}}>

				{/* Name search */}
				<div style={{ flex: "1 1 180px" }}>
					<label
						htmlFor="filter-q"
						style={{
							display: "block",
							fontFamily: "var(--font-mono)",
							fontSize: "0.625rem",
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							color: "var(--fg-muted)",
							marginBottom: "6px",
						}}
					>
						Search
					</label>
					<input
						id="filter-q"
						type="search"
						placeholder="Filter by title…"
						value={inputValue}
						onChange={handleQueryChange}
						autoComplete="off"
						style={controlStyle}
						onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
						onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
					/>
				</div>

				{/* Tag select */}
				{allTags.length > 0 && (
					<div style={{ flex: "1 1 140px" }}>
						<label
							htmlFor="filter-tag"
							style={{
								display: "block",
								fontFamily: "var(--font-mono)",
								fontSize: "0.625rem",
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								color: "var(--fg-muted)",
								marginBottom: "6px",
							}}
						>
							Tag
						</label>
						<select
							id="filter-tag"
							value={tag}
							onChange={e => pushParam("tag", e.target.value)}
							style={{ ...controlStyle, cursor: "pointer", paddingRight: "8px" }}
							onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
							onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
						>
							<option value="">All tags</option>
							{allTags.map(t => (
								<option key={t.slug} value={t.slug}>{t.name}</option>
							))}
						</select>
					</div>
				)}

				{/* Date select */}
				{allDates.length > 0 && (
					<div style={{ flex: "1 1 140px" }}>
						<label
							htmlFor="filter-date"
							style={{
								display: "block",
								fontFamily: "var(--font-mono)",
								fontSize: "0.625rem",
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								color: "var(--fg-muted)",
								marginBottom: "6px",
							}}
						>
							Month
						</label>
						<select
							id="filter-date"
							value={date}
							onChange={e => pushParam("date", e.target.value)}
							style={{ ...controlStyle, cursor: "pointer", paddingRight: "8px" }}
							onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
							onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
						>
							<option value="">All time</option>
							{allDates.map(d => (
								<option key={d.value} value={d.value}>{d.label}</option>
							))}
						</select>
					</div>
				)}

				{/* Clear all — only shown when a filter is active */}
				{hasFilters && (
					<div style={{ flex: "0 0 auto", paddingBottom: "1px" }}>
						<button
							type="button"
							aria-label="Clear all filters"
							onClick={() => {
								setInputValue("");
								router.push("/");
							}}
							style={{
								background: "none",
								border: "1px solid rgba(184,255,87,0.25)",
								borderRadius: "3px",
								color: "var(--accent)",
								fontFamily: "var(--font-mono)",
								fontSize: "0.625rem",
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								padding: "8px 14px",
								minHeight: "40px",
								cursor: "pointer",
								marginTop: "22px",
								transition: "border-color 0.15s, background 0.15s",
							}}
							onMouseEnter={e => {
								e.currentTarget.style.background = "rgba(184,255,87,0.08)";
								e.currentTarget.style.borderColor = "rgba(184,255,87,0.5)";
							}}
							onMouseLeave={e => {
								e.currentTarget.style.background = "none";
								e.currentTarget.style.borderColor = "rgba(184,255,87,0.25)";
							}}
						>
							Clear ×
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
