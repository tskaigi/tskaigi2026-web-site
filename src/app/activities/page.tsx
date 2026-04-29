import type { Metadata } from "next";
import { activityList } from "@/constants/activityList";
import ActivityItem from "./_components/ActivityItem";

export const metadata: Metadata = {
  title: "当日企画",
  twitter: {
    title: "当日企画",
    images: ["/ogp.png"],
  },
  openGraph: {
    title: "当日企画",
    images: ["/ogp.png"],
  },
};

const ActivitiesPage = () => {
  return (
    <main className="bg-blue-light-100 pt-16 pb-10 flex-1 md:px-8 md:pb-16">
      <h1 className="text-2xl font-bold text-blue-light-500 text-center py-10 md:py-16 md:text-3xl lg:text-4xl">
        当日企画
      </h1>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto md:gap-6">
        <p className="px-6 md:text-lg md:px-0">
          TSKaigi 2026の当日企画をご紹介します。登壇・スポンサーブース以外にも、様々な企画をご用意しています！
        </p>

        {activityList.map((activity) => (
          <ActivityItem key={activity.name} {...activity} />
        ))}
      </div>
    </main>
  );
};

export default ActivitiesPage;
