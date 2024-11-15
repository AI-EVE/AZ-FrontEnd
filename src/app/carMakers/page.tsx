import { Button } from "@/components/ui/button";
import * as React from "react";
import { CarMakerBulk } from "./(types)/CarMakerBulk";
import CarMakerCard from "./(components)/car-maker-card";
import CarMakersHeader from "./(components)/car-makers-header";

async function fetchCarMakers(): Promise<CarMakerBulk[]> {
  const response = await fetch("http://localhost:5055/api/carmakers", {
    cache: "no-store",
  });
  if (!response.ok) {
    console.log(response.json());
    throw new Error("Failed to fetch car makers");
  }
  return response.json();
}

export default async function Page() {
  const carMakers = await fetchCarMakers();
  return (
    <div className="p-3">
      <CarMakersHeader />
      <div className="grid grid-cols-[repeat(auto-fit,150px)] gap-4 justify-center mt-4">
        {carMakers.map((carMaker) => (
          <CarMakerCard
            key={carMaker.id}
            id={carMaker.id}
            name={carMaker.name}
            logoUrl={carMaker.logoUrl}
          />
        ))}
      </div>
    </div>
  );
}
