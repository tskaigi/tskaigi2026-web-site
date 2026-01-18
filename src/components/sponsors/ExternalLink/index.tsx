import { ArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import type { ExternalLinkProps } from "@/constants/sponsorList";

const ExternalLink = ({ title, href }: ExternalLinkProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-link-light underline underline-offset-2 decoration-1 decoration-link-light"
    >
      {title}
      <ArrowUpRightFromSquare size={16} className="inline relative left-2" />
    </Link>
  );
};

export default ExternalLink;
