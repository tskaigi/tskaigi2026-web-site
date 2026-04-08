import { ArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import type { ExternalLinkProps } from "@/types/sponsor-api";

const ExternalLink = ({ label, url }: ExternalLinkProps) => {
  return (
    <Link
      href={url}
      target="_blank"
      className="text-link-light underline underline-offset-2 decoration-1 decoration-link-light"
    >
      {label}
      <ArrowUpRightFromSquare size={16} className="inline relative left-2" />
    </Link>
  );
};

export default ExternalLink;
