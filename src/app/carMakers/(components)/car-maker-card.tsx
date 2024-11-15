"use client";
import { useRouter } from "next/navigation";
import { CarMakerBulk } from "../(types)/CarMakerBulk";

export default function CarMakerCard({ id, name, logoUrl }: CarMakerBulk) {
  const router = useRouter();
  return (
    <>
      <div
        className="bg-[#424242] justify-between shadow-md rounded-lg flex flex-col transition-transform  hover:scale-95 hover:-translate-y-1 cursor-pointer"
        onClick={() => router.push(`/carMakers/${id}`)}
      >
        <div className="w-[100%] h-32">
          <img
            src={logoUrl}
            alt="Car Maker Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-1 text-center ">
          <h3 className="text-base max-w-full font-semibold h-fit whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
          </h3>
        </div>
      </div>
    </>
  );
}
