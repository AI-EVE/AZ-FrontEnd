"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "./(components)/page-header";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SubmitSocialTypeForm from "./(components)/submit-social-type-form";

interface SocialType {
  id: string;
  type: string;
  logoUrl: string;
}
interface SocialTypeMapped {
  id: string;
  type: string;
  logoUrl: string;
  isEditing: boolean;
  newType: string;
  newLogo: File | null;
}

export default function Page() {
  const { toast } = useToast();
  const [socialTypes, setSocialTypes] = useState<SocialTypeMapped[]>([]);

  const [loading, setLoading] = useState(false);
  const [toggleAddSocialTypeForm, setToggleAddSocialTypeForm] = useState(false);

  // Load social types
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/socialTypes`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const socialTypesToMap = data.map((socialType: SocialType) => ({
            ...socialType,
            isEditing: false,
            newType: "",
          }));
          setSocialTypes(socialTypesToMap);
          return;
        }

        toast({
          title: "Error",
          description: "An error occurred while loading social types",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while loading social types",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add a new social type
  const handleAddSocialType = (
    socialTypeName: string,
    socialTypeImage: File | null
  ) => {
    if (loading) return;

    if (!socialTypeName || socialTypeName.trim() === "" || !socialTypeImage) {
      toast({
        title: "Empty Fields",
        description: "Make Sure To Enter A Both Fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("type", socialTypeName);
    if (socialTypeImage) {
      formData.append("logo", socialTypeImage);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/socialtypes`, {
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
            description: "Social Type added successfully",
          });

          const newProdcutType = await response.json();

          setSocialTypes((prev) => [
            ...prev,
            {
              ...newProdcutType,
              isEditing: false,
              newType: "",
              newLogo: null,
            },
          ]);

          setToggleAddSocialTypeForm(false);
          return;
        }

        const error = await response.json();
        toast({
          title: "Empty Fields",
          description: error.message || "Make Sure To Enter Both Fields",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while adding the social type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Edit a social type
  const handleEditSocialType = (socialType: SocialTypeMapped) => {
    if (loading) return;

    if (!socialType.newType && !socialType.newLogo) {
      toast({
        title: "Empty Fields",
        description: "Enter at least a new name or a new logo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (socialType.newType) {
      formData.append("type", socialType.newType);
    }
    if (socialType.newLogo) {
      formData.append("logo", socialType.newLogo);
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/socialtypes/${socialType.id}`,
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

          const newSocialType = await response.json();

          setSocialTypes((prev) =>
            prev.map((prevSocialType) => {
              if (prevSocialType.id !== socialType.id) {
                return prevSocialType;
              } else {
                return {
                  ...prevSocialType,
                  type: newSocialType.type,
                  logoUrl: newSocialType.logoUrl,
                  isEditing: true,
                  newType: "",
                  newLogo: null,
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
          description: "An error occurred while editing the social type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Delete a social type
  const handleDeleteSocialType = (socialType: SocialTypeMapped) => {
    if (loading) return;

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/socialtypes/${socialType.id}`,
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

          setSocialTypes((prev) =>
            prev.filter((prevSocialType) => prevSocialType.id !== socialType.id)
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
          description: "An error occurred while deleting the social type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onPageHeaderButtonClick = () => {
    setToggleAddSocialTypeForm(!toggleAddSocialTypeForm);
  };

  const closeAddSocialTypeForm = () => {
    if (loading) return;
    setToggleAddSocialTypeForm(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {toggleAddSocialTypeForm ? (
        <SubmitSocialTypeForm
          handleAddSocialType={handleAddSocialType}
          closeForm={closeAddSocialTypeForm}
        />
      ) : null}

      <div className="p-3 h-[100vh] flex flex-col">
        <PageHeader onButtonClick={onPageHeaderButtonClick} />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col sm:container mx-auto sm:px-4 gap-8">
            {socialTypes.length > 0 ? (
              socialTypes.map((socialType) => (
                <React.Fragment key={socialType.id}>
                  <div className="max-w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-amber-500 font-semibold text-lg cursor-default">
                          {socialType.type}
                        </h3>

                        <img
                          src={socialType.logoUrl}
                          alt={socialType.type}
                          className="w-10 h-10 object-cover rounded-full border border-amber-500"
                        />
                      </div>
                      <Switch
                        onCheckedChange={(value) => {
                          if (loading) return;
                          setSocialTypes((prev) =>
                            prev.map((prevSocialType) => {
                              if (prevSocialType.id !== socialType.id) {
                                return {
                                  ...prevSocialType,
                                  isEditing: false,
                                  newType: "",
                                  newLogo: null,
                                };
                              } else {
                                if (value) {
                                  return {
                                    ...prevSocialType,
                                    isEditing: true,
                                  };
                                } else {
                                  return {
                                    ...prevSocialType,
                                    isEditing: false,
                                  };
                                }
                              }
                            })
                          );
                        }}
                        checked={socialType.isEditing}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                    {socialType.isEditing ? (
                      <>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleEditSocialType(socialType);
                          }}
                          className="flex flex-col  gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              onChange={(e) => {
                                setSocialTypes((prev) =>
                                  prev.map((prevSocialType) => {
                                    if (prevSocialType.id !== socialType.id) {
                                      return prevSocialType;
                                    } else {
                                      return {
                                        ...prevSocialType,
                                        newType: e.target.value,
                                      };
                                    }
                                  })
                                );
                              }}
                              value={socialType.newType}
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
                                handleDeleteSocialType(socialType);
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
                                  `social-type-logo-upload-${socialType.id}`
                                )
                                ?.click()
                            }
                          >
                            {socialType.newLogo ? (
                              <div
                                className="w-full h-full flex justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  onClick={(_) => {
                                    setSocialTypes((prev) =>
                                      prev.map((prevSocialType) => {
                                        if (
                                          prevSocialType.id !== socialType.id
                                        ) {
                                          return prevSocialType;
                                        } else {
                                          return {
                                            ...prevSocialType,
                                            newLogo: null,
                                          };
                                        }
                                      })
                                    );
                                  }}
                                  src={URL.createObjectURL(socialType.newLogo)}
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
                                setSocialTypes((prev) =>
                                  prev.map((prevSocialType) => {
                                    if (prevSocialType.id !== socialType.id) {
                                      return prevSocialType;
                                    } else {
                                      return {
                                        ...prevSocialType,
                                        newLogo: e.target.files
                                          ? e.target.files[0]
                                          : null,
                                      };
                                    }
                                  })
                                );
                              }}
                              type="file"
                              className="hidden"
                              id={`social-type-logo-upload-${socialType.id}`}
                              accept="image/*"
                              multiple={false}
                            />
                          </div>
                        </form>
                      </>
                    ) : null}
                  </div>

                  <div className="w-[25%] h-[1px] mx-auto bg-amber-400 mb-8"></div>
                </React.Fragment>
              ))
            ) : (
              <div className="flex items-center justify-center h-[50vh]">
                <p className="text-amber-500 font-semibold text-lg">
                  No Social Types Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
