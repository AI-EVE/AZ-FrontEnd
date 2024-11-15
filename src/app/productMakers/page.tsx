"use client";

import { useEffect, useState } from "react";
import PageHeader from "./(components)/page-header";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SubmitProductMakerForm from "./(components)/submit-product-maker-form";

interface ProductMaker {
  id: string;
  name: string;
  logoUrl: string;
}
interface ProductMakerMapped {
  id: string;
  name: string;
  logoUrl: string;
  isEditing: boolean;
  newName: string;
  newImage: File | null;
}

export default function Page() {
  const { toast } = useToast();
  const [productMakers, setProductMakers] = useState<ProductMakerMapped[]>([]);

  const [loading, setLoading] = useState(false);
  const [toggleAddProductMakerForm, setToggleAddProductMakerForm] =
    useState(false);

  // Load product makers
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/productMakers`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const productMakersToMap = data.map((productMaker: ProductMaker) => ({
            ...productMaker,
            isEditing: false,
            newName: "",
          }));
          setProductMakers(productMakersToMap);
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
  const handleAddProductMaker = (
    productMakerName: string,
    productMakerImage: File | null
  ) => {
    if (loading) return;

    if (!productMakerName) {
      toast({
        title: "Empty Name",
        description: "Make Sure To Enter A Name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", productMakerName);
    if (productMakerImage) {
      formData.append("logo", productMakerImage);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/productmakers`, {
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

          setProductMakers((prev) => [
            ...prev,
            { ...newProdcutType, isEditing: false, newName: "" },
          ]);

          setToggleAddProductMakerForm(false);
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
          description: "An error occurred while adding the product maker",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Edit a product maker
  const handleEditProductMaker = (productMaker: ProductMakerMapped) => {
    if (loading) return;

    if (!productMaker.newName && !productMaker.newImage) {
      toast({
        title: "Empty Name",
        description: "Enter at least a new name or a new image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (productMaker.newName) {
      formData.append("name", productMaker.newName);
    }
    if (productMaker.newImage) {
      formData.append("logo", productMaker.newImage);
    }

    console.log(productMaker.newImage);
    console.log(productMaker.newName);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/productmakers/${productMaker.id}`,
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

          const newProductMaker = await response.json();

          setProductMakers((prev) =>
            prev.map((prevProductMaker) => {
              if (prevProductMaker.id !== productMaker.id) {
                return prevProductMaker;
              } else {
                return {
                  ...prevProductMaker,
                  name: newProductMaker.name,
                  logoUrl: newProductMaker.logoUrl,
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
  const handleDeleteProductMaker = (productMaker: ProductMakerMapped) => {
    if (loading) return;

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/productmakers/${productMaker.id}`,
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

          setProductMakers((prev) =>
            prev.filter(
              (prevProductMaker) => prevProductMaker.id !== productMaker.id
            )
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
    setToggleAddProductMakerForm(!toggleAddProductMakerForm);
  };

  const closeAddProductMakerForm = () => {
    if (loading) return;
    setToggleAddProductMakerForm(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {toggleAddProductMakerForm ? (
        <SubmitProductMakerForm
          handleAddProductMaker={handleAddProductMaker}
          closeForm={closeAddProductMakerForm}
        />
      ) : null}

      <div className="p-3 h-[100vh] flex flex-col">
        <PageHeader onButtonClick={onPageHeaderButtonClick} />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col sm:container mx-auto sm:px-4 gap-8">
            {productMakers.length > 0 ? (
              productMakers.map((productMaker) => (
                <>
                  <div key={productMaker.id} className="max-w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-amber-500 font-semibold text-lg cursor-default">
                          {productMaker.name}
                        </h3>

                        <img
                          src={productMaker.logoUrl}
                          alt={productMaker.name}
                          className="w-10 h-10 object-cover rounded-full border border-amber-500"
                        />
                      </div>
                      <Switch
                        onCheckedChange={(value) => {
                          if (loading) return;
                          setProductMakers((prev) =>
                            prev.map((prevProductMaker) => {
                              if (prevProductMaker.id !== productMaker.id) {
                                return {
                                  ...prevProductMaker,
                                  isEditing: false,
                                  newName: "",
                                  newImage: null,
                                };
                              } else {
                                if (value) {
                                  return {
                                    ...prevProductMaker,
                                    isEditing: true,
                                  };
                                } else {
                                  return {
                                    ...prevProductMaker,
                                    isEditing: false,
                                  };
                                }
                              }
                            })
                          );
                        }}
                        checked={productMaker.isEditing}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                    {productMaker.isEditing ? (
                      <>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleEditProductMaker(productMaker);
                          }}
                          className="flex flex-col  gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              onChange={(e) => {
                                setProductMakers((prev) =>
                                  prev.map((prevProductMaker) => {
                                    if (
                                      prevProductMaker.id !== productMaker.id
                                    ) {
                                      return prevProductMaker;
                                    } else {
                                      return {
                                        ...prevProductMaker,
                                        newName: e.target.value,
                                      };
                                    }
                                  })
                                );
                              }}
                              value={productMaker.newName}
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
                                handleDeleteProductMaker(productMaker);
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
                                .getElementById("product-maker-image-upload")
                                ?.click()
                            }
                          >
                            {productMaker.newImage ? (
                              <div
                                className="w-full h-full flex justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  onClick={(_) => {
                                    setProductMakers((prev) =>
                                      prev.map((prevProductMaker) => {
                                        if (
                                          prevProductMaker.id !==
                                          productMaker.id
                                        ) {
                                          return prevProductMaker;
                                        } else {
                                          return {
                                            ...prevProductMaker,
                                            newImage: null,
                                          };
                                        }
                                      })
                                    );
                                  }}
                                  src={URL.createObjectURL(
                                    productMaker.newImage
                                  )}
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
                                setProductMakers((prev) =>
                                  prev.map((prevProductMaker) => {
                                    if (
                                      prevProductMaker.id !== productMaker.id
                                    ) {
                                      return prevProductMaker;
                                    } else {
                                      return {
                                        ...prevProductMaker,
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
                              id="product-maker-image-upload"
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
                  No Product Maker Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
