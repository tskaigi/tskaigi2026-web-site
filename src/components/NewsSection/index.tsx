import Link from "next/link";

export const NewsSection = () => {
  return (
    <section id="news" className="w-full bg-blue-light-100">
      <div className="bg-white md:rounded-2xl mx-auto grid max-w-[940px] gap-2 p-4 sm:grid-cols-[max-content_1fr] sm:p-6">
        <div>2026.03.26. </div>
        <div>
          <Link
            href="#keynote"
            className="text-link-light underline underline-offset-3 hover:no-underline"
          >
            基調講演
          </Link>
          を公開しました
        </div>
      </div>
    </section>
  );
};
