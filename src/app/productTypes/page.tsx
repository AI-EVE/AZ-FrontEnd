"use client";

import { useEffect, useState } from "react";
import PageHeader from "./(components)/page-header";

import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SubmitProductTypeForm from "./(components)/submit-product-type-form";
import React from "react";

interface ProductType {
  id: string;
  name: string;
}
interface ProductTypeMapped {
  id: string;
  name: string;
  isEditing: boolean;
  newName: string;
}

export default function Page() {
  const { toast } = useToast();
  const [productTypes, setProductTypes] = useState<ProductTypeMapped[]>([]);

  const [loading, setLoading] = useState(false);
  const [toggleAddProductTypeForm, setToggleAddProductTypeForm] =
    useState(false);

  // Load product types
  useEffect(() => {
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/productTypes`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const productTypesToMap = data.map((productType: ProductType) => ({
            ...productType,
            isEditing: false,
            newName: "",
          }));
          setProductTypes(productTypesToMap);
          return;
        }

        toast({
          title: "Error",
          description: "An error occurred while loading product types",
          variant: "destructive",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An error occurred while loading product types",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add a new product type
  const handleAddProductType = (productTypeName: string) => {
    if (loading) return;

    if (!productTypeName) {
      toast({
        title: "Empty Name",
        description: "Make Sure To Enter A Name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL_BACKEND}/producttypes`, {
      method: "POST",
      body: JSON.stringify({ name: productTypeName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Type added successfully",
          });

          const newProdcutType = await response.json();

          setProductTypes((prev) => [
            ...prev,
            { ...newProdcutType, isEditing: false, newName: "" },
          ]);

          setToggleAddProductTypeForm(false);
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
          description: "An error occurred while adding the product type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Edit a product type
  const handleEditProductType = (productType: ProductTypeMapped) => {
    if (loading) return;

    if (!productType.newName) {
      toast({
        title: "Empty Name",
        description: "Make Sure To Enter A Name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/producttypes/${productType.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: productType.newName }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Type edited successfully",
          });

          setProductTypes((prev) =>
            prev.map((prevProductType) => {
              if (prevProductType.id !== productType.id) {
                return prevProductType;
              } else {
                return {
                  ...prevProductType,
                  name: productType.newName,
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
          description: "An error occurred while editing the product type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Delete a product type
  const handleDeleteProductType = (productType: ProductTypeMapped) => {
    if (loading) return;

    setLoading(true);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BACKEND}/producttypes/${productType.id}`,
      {
        method: "DELETE",
      }
    )
      .then(async (response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product Type deleted successfully",
          });

          setProductTypes((prev) =>
            prev.filter(
              (prevProductType) => prevProductType.id !== productType.id
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
          description: "An error occurred while deleting the product type",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onPageHeaderButtonClick = () => {
    setToggleAddProductTypeForm(!toggleAddProductTypeForm);
  };

  const closeAddProductTypeForm = () => {
    if (loading) return;
    setToggleAddProductTypeForm(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {toggleAddProductTypeForm ? (
        <SubmitProductTypeForm
          handleAddProductType={handleAddProductType}
          closeForm={closeAddProductTypeForm}
        />
      ) : null}

      <div className="p-3 h-[100vh] flex flex-col">
        <PageHeader onButtonClick={onPageHeaderButtonClick} />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col sm:container mx-auto sm:px-4 gap-8">
            {productTypes.length > 0 ? (
              productTypes.map((productType) => (
                <React.Fragment key={productType.id}>
                  <div className="max-w-full">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-amber-500 font-semibold text-lg cursor-default">
                        {productType.name}
                      </h3>
                      <Switch
                        onCheckedChange={(value) => {
                          if (loading) return;
                          setProductTypes((prev) =>
                            prev.map((prevProductType) => {
                              if (prevProductType.id !== productType.id) {
                                return {
                                  ...prevProductType,
                                  isEditing: false,
                                  newName: "",
                                };
                              } else {
                                if (value) {
                                  return {
                                    ...prevProductType,
                                    isEditing: true,
                                  };
                                } else {
                                  return {
                                    ...prevProductType,
                                    isEditing: false,
                                  };
                                }
                              }
                            })
                          );
                        }}
                        checked={productType.isEditing}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </div>
                    {productType.isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditProductType(productType);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          onChange={(e) => {
                            setProductTypes((prev) =>
                              prev.map((prevProductType) => {
                                if (prevProductType.id !== productType.id) {
                                  return prevProductType;
                                } else {
                                  return {
                                    ...prevProductType,
                                    newName: e.target.value,
                                  };
                                }
                              })
                            );
                          }}
                          value={productType.newName}
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
                            handleDeleteProductType(productType);
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
                  No Product Type Found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
