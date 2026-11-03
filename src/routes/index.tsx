import { createFileRoute } from "@tanstack/react-router";
import { NeoSite } from "@/components/neo-site";

export const Route = createFileRoute("/")({ component: NeoSite });
