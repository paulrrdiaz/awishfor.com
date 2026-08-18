"use client";

import { type ComponentProps, useRef } from "react";
import { useMotifTilt } from "@/lib/gsap/use-motif-tilt";

export function MotifTiltSection(props: ComponentProps<"section">) {
	const ref = useRef<HTMLElement>(null);
	useMotifTilt(ref);
	return <section ref={ref} {...props} />;
}

export function MotifTiltHeader(props: ComponentProps<"header">) {
	const ref = useRef<HTMLElement>(null);
	useMotifTilt(ref);
	return <header ref={ref} {...props} />;
}
