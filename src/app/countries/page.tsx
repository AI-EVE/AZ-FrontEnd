"use client";

import { useEffect, useState } from "react";
import PageHeader from "./(components)/page-header";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SubmitCountryForm from "./(components)/submit-country-form";

interface Country {
  id: string;
  name: string;
  flagUrl: string;
}
interface CountryMapped {
  id: string;
  name: string;
  flagUrl: string;
  isEditing: boolean;
  newName: string;
  newImage: File | null;
}

export default function Page() {
  const { toast } = useToast();
  const [countries, setCountries] = useState<CountryMapped[]>([]);

  const [loading, setLoading] = useState(false);
  const [toggleAddCountryForm, setToggleAddCountryForm] = useState(false);

  // Load product makers
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/countries`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const countriesToMap = data.map((country: Country) => ({
            ...country,
            isEditing: false,
            newName: "",
          }));
          setCountries(countriesToMap);
          return;
        }

        toast({
          title: "Error",
          description: "An error occurred while loading product makers",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while loading product makers",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add a new product maker
  const handleAddCountry = (countryName: string, countryImage: File | null) => {
    if (loading) return;

    if (!countryName || countryName.trim() === "" || !countryImage) {
      toast({
        title: "Empty Fields",
        description: "Make Sure To Enter A Both Fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", countryName);
    if (countryImage) {
      formData.append("flag", countryImage);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/countries`, {
      method: "POST",
      body: formData,
      headers: {
        ContentType: "multipart/form-data",
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Maker added successfully",
          });

          const newProdcutType = await response.json();

          setCountries((prev) => [
            ...prev,
            {
              ...newProdcutType,
              isEditing: false,
              newName: "",
              newImage: null,
            },
          ]);

          setToggleAddCountryForm(false);
          return;
        }

        const error = await response.json();
        toast({
          title: "Empty Name",
          description: error.message || "Make Sure To Enter Both Fields",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while adding the product maker",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Edit a product maker
  const handleEditCountry = (country: CountryMapped) => {
    if (loading) return;

    if (!country.newName && !country.newImage) {
      toast({
        title: "Empty Name",
        description: "Enter at least a new name or a new image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (country.newName) {
      formData.append("name", country.newName);
    }
    if (country.newImage) {
      formData.append("flag", country.newImage);
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/countries/${country.id}`,
      {
        method: "PUT",
        body: formData,
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Maker edited successfully",
          });

          const newCountry = await response.json();

          setCountries((prev) =>
            prev.map((prevCountry) => {
              if (prevCountry.id !== country.id) {
                return prevCountry;
              } else {
                return {
                  ...prevCountry,
                  name: newCountry.name,
                  flagUrl: newCountry.flagUrl,
                  isEditing: true,
                  newName: "",
                  newImage: null,
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
          description: "An error occurred while editing the product maker",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Delete a product maker
  const handleDeleteCountry = (country: CountryMapped) => {
    if (loading) return;

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/countries/${country.id}`,
      {
        method: "DELETE",
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Maker deleted successfully",
          });

          setCountries((prev) =>
            prev.filter((prevCountry) => prevCountry.id !== country.id)
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
          description: "An error occurred while deleting the product maker",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onPageHeaderButtonClick = () => {
    setToggleAddCountryForm(!toggleAddCountryForm);
  };

  const closeAddCountryForm = () => {
    if (loading) return;
    setToggleAddCountryForm(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {toggleAddCountryForm ? (
        <SubmitCountryForm
          handleAddCountry={handleAddCountry}
          closeForm={closeAddCountryForm}
        />
      ) : null}

      <div className="p-3 h-[100vh] flex flex-col">
        <PageHeader onButtonClick={onPageHeaderButtonClick} />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col sm:container mx-auto sm:px-4 gap-8">
            {countries.length > 0 ? (
              countries.map((country) => (
                <>
                  <div key={country.id} className="max-w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-amber-500 font-semibold text-lg cursor-default">
                          {country.name}
                        </h3>

                        <img
                          src={country.flagUrl}
                          alt={country.name}
                          className="w-10 h-10 object-cover rounded-full border border-amber-500"
                        />
                      </div>
                      <Switch
                        onCheckedChange={(value) => {
                          if (loading) return;
                          setCountries((prev) =>
                            prev.map((prevCountry) => {
                              if (prevCountry.id !== country.id) {
                                return {
                                  ...prevCountry,
                                  isEditing: false,
                                  newName: "",
                                  newImage: null,
                                };
                              } else {
                                if (value) {
                                  return {
                                    ...prevCountry,
                                    isEditing: true,
                                  };
                                } else {
                                  return {
                                    ...prevCountry,
                                    isEditing: false,
                                  };
                                }
                              }
                            })
                          );
                        }}
                        checked={country.isEditing}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                    {country.isEditing ? (
                      <>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleEditCountry(country);
                          }}
                          className="flex flex-col  gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              onChange={(e) => {
                                setCountries((prev) =>
                                  prev.map((prevCountry) => {
                                    if (prevCountry.id !== country.id) {
                                      return prevCountry;
                                    } else {
                                      return {
                                        ...prevCountry,
                                        newName: e.target.value,
                                      };
                                    }
                                  })
                                );
                              }}
                              value={country.newName}
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
                                handleDeleteCountry(country);
                              }}
                              className="mt-2 bg-red-500  hover:bg-red-600 rounded-md px-3 py-2"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          <div
                            className="flex items-center justify-center h-32 w-72 border border-input shadow-sm bg-background rounded-md"
                            onClick={(e) =>
                              document
                                .getElementById(
                                  `country-image-upload-${country.id}`
                                )
                                ?.click()
                            }
                          >
                            {country.newImage ? (
                              <div
                                className="w-full h-full flex justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  onClick={(_) => {
                                    setCountries((prev) =>
                                      prev.map((prevCountry) => {
                                        if (prevCountry.id !== country.id) {
                                          return prevCountry;
                                        } else {
                                          return {
                                            ...prevCountry,
                                            newImage: null,
                                          };
                                        }
                                      })
                                    );
                                  }}
                                  src={URL.createObjectURL(country.newImage)}
                                  alt="preview"
                                  className="h-full object-cover"
                                />
                              </div>
                            ) : (
                              <ImagePlus size={80} strokeWidth={1.75} />
                            )}

                            <input
                              onChange={(e) => {
                                if (!e.target.files) return;
                                setCountries((prev) =>
                                  prev.map((prevCountry) => {
                                    if (prevCountry.id !== country.id) {
                                      return prevCountry;
                                    } else {
                                      return {
                                        ...prevCountry,
                                        newImage: e.target.files
                                          ? e.target.files[0]
                                          : null,
                                      };
                                    }
                                  })
                                );
                              }}
                              type="file"
                              className="hidden"
                              id={`country-image-upload-${country.id}`}
                              accept="image/*"
                              multiple={false}
                            />
                          </div>
                        </form>
                      </>
                    ) : null}
                  </div>

                  <div className="w-[25%] h-[1px] mx-auto bg-amber-400 mb-8"></div>
                </>
              ))
            ) : (
              <div className="flex items-center justify-center h-[50vh]">
                <p className="text-amber-500 font-semibold text-lg">
                  No Counties Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
