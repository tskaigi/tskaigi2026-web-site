import Image from "next/image";
import type { Activity } from "@/constants/activityList";

type ActivityItemProps = Activity;

const ActivityItem = ({ name, description, location, image }: ActivityItemProps) => {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col gap-4 md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2 md:text-xl">
          <span className="text-blue-light-500 text-xl leading-none">●</span>
          {name}
        </h2>
        {location && (
          <span className="self-start shrink-0 bg-blue-light-500 text-white text-xs font-bold px-3 py-1 rounded-md">
            {location}
          </span>
        )}
      </div>
      <hr className="border-black-200" />
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        {image && (
          <div className="shrink-0 md:w-[45%]">
            <Image
              src={image}
              alt={name}
              width={800}
              height={600}
              className="w-full rounded-md"
            />
          </div>
        )}
        <p className="leading-7 md:text-base md:leading-8 whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
