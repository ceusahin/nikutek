import React from "react";

const Card = ({ img, title, description }) => {
  return (
    <div className="relative rounded-lg -skew-x-6 -translate-y-6 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-[320px] sm:w-[400px] md:w-[480px] h-[280px] sm:h-[320px] md:h-[360px] p-2 bg-neutral-50 card-compact hover:bg-base-200 transition-all [box-shadow:12px_12px] hover:[box-shadow:4px_4px]">
      <figure className="w-full h-full overflow-hidden rounded-lg">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      </figure>
      <div className="absolute text-neutral-50 bottom-4 left-4 right-4 z-10">
        <span className="block text-xl font-bold">{title}</span>
        <p className="text-sm opacity-80 mt-1 line-clamp-2">{description}</p>
      </div>
      <div className="absolute inset-0 bg-black/30 rounded-lg" />
    </div>
  );
};

export default Card;
