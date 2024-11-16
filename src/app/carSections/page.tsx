"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "./(components)/page-header";
import SubmitCarSectionForm from "./(components)/submit-car-section-form";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CarSection {
  id: string;
  name: string;
}
interface CarSectionMapped {
  id: string;
  name: string;
  isEditing: boolean;
  newName: string;
}

export default function Page() {
  const { toast } = useToast();
  const [carSections, setCarSections] = useState<CarSectionMapped[]>([]);

  const [loading, setLoading] = useState(false);
  const [toggleAddCarSectionForm, setToggleAddCarSectionForm] = useState(false);

  // Load car sections
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/carsections`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const carSectionsToMap = data.map((carSection: CarSection) => ({
            ...carSection,
            isEditing: false,
            newName: "",
          }));
          setCarSections(carSectionsToMap);
          return;
        }

        toast({
          title: "Error",
          description: "An error occurred while loading car sections",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while loading car sections",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add a new car section
  const handleAddCarSection = (carSectionName: string) => {
    if (loading) return;

    if (!carSectionName) {
      toast({
        title: "Empty Name",
        description: "Make Sure To Enter A Name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/carsections`, {
      method: "POST",
      body: JSON.stringify({ name: carSectionName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Car section added successfully",
          });

          const newCarSection = await response.json();

          setCarSections((prev) => [
            ...prev,
            { ...newCarSection, isEditing: false, newName: "" },
          ]);

          setToggleAddCarSectionForm(false);
          return;
        }

        const error = await response.json();
        toast({
          title: "Empty Name",
          description: error.message || "Make Sure To Enter A Name",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while adding the car section",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Edit a car section
  const handleEditCarSection = (carSection: CarSectionMapped) => {
    if (loading) return;

    if (!carSection.newName) {
      toast({
        title: "Empty Name",
        description: "Make Sure To Enter A Name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/carsections/${carSection.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: carSection.newName }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Car section edited successfully",
          });

          setCarSections((prev) =>
            prev.map((prevCarSection) => {
              if (prevCarSection.id !== carSection.id) {
                return prevCarSection;
              } else {
                return {
                  ...prevCarSection,
                  name: carSection.newName,
                  isEditing: true,
                  newName: "",
                };
              }
            })
          );
          return;
        }

        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "An error occurred while editing",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while editing the car section",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Delete a car section
  const handleDeleteCarSection = (carSection: CarSectionMapped) => {
    if (loading) return;

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/carsections/${carSection.id}`,
      {
        method: "DELETE",
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Car section deleted successfully",
          });

          setCarSections((prev) =>
            prev.filter((prevCarSection) => prevCarSection.id !== carSection.id)
          );
          return;
        }

        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "An error occurred while deleting",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while deleting the car section",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onPageHeaderButtonClick = () => {
    setToggleAddCarSectionForm(!toggleAddCarSectionForm);
  };

  const closeAddSectionForm = () => {
    if (loading) return;
    setToggleAddCarSectionForm(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {toggleAddCarSectionForm ? (
        <SubmitCarSectionForm
          handleAddCarSection={handleAddCarSection}
          closeForm={closeAddSectionForm}
        />
      ) : null}

      <div className="p-3 h-[100vh] flex flex-col">
        <PageHeader onButtonClick={onPageHeaderButtonClick} />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col sm:container mx-auto sm:px-4 gap-8">
            {carSections.length > 0 ? (
              carSections.map((carSection) => (
                <React.Fragment key={carSection.id}>
                  <div className="">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-amber-500 font-semibold text-lg cursor-default">
                        {carSection.name}
                      </h3>
                      <Switch
                        onCheckedChange={(value) => {
                          if (loading) return;
                          setCarSections((prev) =>
                            prev.map((prevCarSection) => {
                              if (prevCarSection.id !== carSection.id) {
                                return {
                                  ...prevCarSection,
                                  isEditing: false,
                                  newName: "",
                                };
                              } else {
                                if (value) {
                                  return {
                                    ...prevCarSection,
                                    isEditing: true,
                                  };
                                } else {
                                  return {
                                    ...prevCarSection,
                                    isEditing: false,
                                  };
                                }
                              }
                            })
                          );
                        }}
                        checked={carSection.isEditing}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                    {carSection.isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditCarSection(carSection);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          onChange={(e) => {
                            setCarSections((prev) =>
                              prev.map((prevCarSection) => {
                                if (prevCarSection.id !== carSection.id) {
                                  return prevCarSection;
                                } else {
                                  return {
                                    ...prevCarSection,
                                    newName: e.target.value,
                                  };
                                }
                              })
                            );
                          }}
                          value={carSection.newName}
                          type="text"
                          placeholder="New Name?"
                          className="mt-2 bg-dark-2 text-white md:max-w-[70%] mr-auto focus:border-amber-500 focus:ring-amber-500 rounded-md px-3 py-2 outline-none"
                        />
                        <Button
                          type="submit"
                          className="mt-2 bg-amber-500 hover:bg-amber-600 rounded-md px-3 py-2"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteCarSection(carSection);
                          }}
                          className="mt-2 bg-red-500  hover:bg-red-600 rounded-md px-3 py-2"
                        >
                          <Trash2 />
                        </Button>
                      </form>
                    ) : null}
                  </div>
                  <div className="w-[25%] h-[1px] mx-auto bg-amber-400 mb-8"></div>
                </React.Fragment>
              ))
            ) : (
              <div className="flex items-center justify-center h-[50vh]">
                <p className="text-amber-500 font-semibold text-lg">
                  No Car Sections Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
