import Image from "next/image";
import { personalSponsorList } from "@/constants/personalSponsorList";

type SponsorContainerProps = {
  link: string;
  children: React.ReactNode;
};

const SponsorContainer = ({ link, children }: SponsorContainerProps) => {
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2"
      >
        {children}
      </a>
    );
  }

  return <div className="flex flex-col items-center gap-2">{children}</div>;
};

type ImageCardProps = {
  name: string;
  imgSrc: string;
};
const ImageCard = ({ name, imgSrc }: ImageCardProps) => {
  return (
    <div className="flex justify-center items-center w-full h-full aspect-square rounded-full overflow-hidden">
      <Image
        src={imgSrc}
        alt={name}
        className="w-full h-auto"
        width={144}
        height={144}
      />
    </div>
  );
};

const PersonalSponsorsSection = () => {
  return (
    <section className="w-full py-10 md:py-20 md:px-10 bg-blue-light-100">
      <h2 className="text-[24px] md:text-[32px] leading-normal md:leading-12 text-center font-bold pb-8 md:pb-10">
        個人スポンサー
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fit,120px)] md:grid-cols-[repeat(3,144px)] lg:grid-cols-[repeat(5,144px)] justify-center gap-x-14 gap-y-8 px-4">
        {personalSponsorList.map(({ name, link, imgSrc }) => (
          <li key={name}>
            <SponsorContainer link={link}>
              <ImageCard name={name} imgSrc={imgSrc} />
              <p className="text-lg font-bold text-center">{name}</p>
            </SponsorContainer>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PersonalSponsorsSection;
