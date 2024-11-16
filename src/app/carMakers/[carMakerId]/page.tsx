"use client";
import ImageView from "@/components/image-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { FileInput, PencilLine, Trash2, Undo2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { CarMakerResponseFull } from "../(types)/CarMakerResponseFull";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Params {
  carMakerId: string;
}

interface Props {
  params: Params;
}

export default function Page({ params: { carMakerId } }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const { toast } = useToast();
  const [carMakerName, setCarMakerName] = useState("");
  const [carMakerLogo, setCarMakerLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [carMakerResponseFull, setCarMakerResponseFull] =
    useState<CarMakerResponseFull | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [modelDrawerOpen, setModelsDrawerOpen] = useState(false);
  const [showCarModelEditDialog, setShowCarModelEditDialog] = useState(false);
  const [showCarModelDeleteDialog, setShowCarModelDeleteDialog] =
    useState(false);
  const [newCarModelName, setNewCarModelName] = useState("");
  const [carModelEditedId, setCarModelEditedId] = useState<number | null>(null);
  const [carModelDeleteId, setCarModelDeleteId] = useState<number | null>(null);
  const [carModelSelectedId, setCarModelSelectedId] = useState<number | null>(
    null
  );
  const [newCarGenerationName, setNewCarGenerationName] = useState("");
  const [newCarGenerationEditName, setNewCarGenerationEditName] = useState("");
  const router = useRouter();

  let generationsCount = 0;
  let carModels = null;

  if (carMakerResponseFull?.carModels) {
    carModels = carMakerResponseFull.carModels.map((ele) => {
      generationsCount += ele.carGenerations.length;
      return {
        id: ele.id,
        name: ele.name,
        generationsCount: ele.carGenerations.length,
      };
    });
  }

  useEffect(() => {
    fetch(`http://localhost:5055/api/carmakers/${carMakerId}`, {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to fetch the car maker.",
            variant: "destructive",
          });

          router.back();
        }
        return response.json();
      })
      .then((data) => {
        setCarMakerResponseFull(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching the car maker.",
          variant: "destructive",
        });
        router.back();
      });
  }, [carMakerId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarMakerName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCarMakerLogo(e.target.files[0]);
      e.target.value = "";
    }
  };

  const removeImage = () => {
    setCarMakerLogo(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!carMakerName && !carMakerLogo) {
      toast({
        title: "Failed",
        description: "Please fill in at least one field.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (carMakerName) {
      formData.append("Name", carMakerName);
    }
    if (carMakerLogo) {
      formData.append("Logo", carMakerLogo);
    }
    try {
      const response = await fetch(
        `http://localhost:5055/api/carmakers/${carMakerId}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Car Maker Edited SUCCESSFULLY.",
        });
        setCarMakerName("");
        setCarMakerLogo(null);
        setCarMakerResponseFull((oldState) => ({ ...oldState, ...result }));

        // router.refresh();
      } else if (response.status === 409) {
        toast({
          title: "Conflict",
          description: "Car maker already exists.",
        });
      } else {
        toast({
          title: "Unknown Error",
          description: "An unknown error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the car maker.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5055/api/carmakers/${carMakerId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        toast({
          title: "Success",
          description: "Car Maker Deleted SUCCESSFULLY.",
        });
        router.replace("/carMakers");
        router.refresh();
      } else if (response.status === 400) {
        toast({
          title: "Failed To Delete",
          description:
            "CarMaker is associated with Either cars or a Generation that is used in a Product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the car maker.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowDeleteAlert = () => {
    setShowDeleteAlert(true);
  };

  const handleHideDeleteAlert = () => {
    if (!loading) {
      setShowDeleteAlert(false);
    }
  };

  const handlePoster = () => {
    setImage(null);
  };

  const handleModelCreation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newModelName) {
      toast({
        title: "Failed",
        description: "Please fill in the model name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(`http://localhost:5055/api/carmodels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newModelName, carMakerId: carMakerId }),
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to create the car model.",
            variant: "destructive",
          });
        }
        return response.json();
      })
      .then((data) => {
        toast({
          title: "Success",
          description: "Car Model Created SUCCESSFULLY.",
        });
        setCarMakerResponseFull((oldState) => {
          if (!oldState) return oldState;
          return {
            ...oldState,
            carModels: [
              ...oldState.carModels,
              { id: data.id, name: data.name, carGenerations: [] },
            ],
          };
        });
        setNewModelName("");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while creating the car model.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleShowCarModelEditDialog = () => {
    if (loading) return;
    setCarModelEditedId(null);
    setShowCarModelEditDialog(!showCarModelEditDialog);
  };

  const handleShowCarModelDeleteDialog = () => {
    if (loading) return;
    setShowCarModelDeleteDialog(!showCarModelDeleteDialog);
  };

  const handleCarModelEdit = () => {
    setLoading(true);

    if (!newCarModelName) {
      toast({
        title: "Failed",
        description: "Please fill in the model name.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5055/api/carmodels/${carModelEditedId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCarModelName }),
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: `${
              response.status === 404
                ? "Car Model Not Found."
                : "Failed to edit the car model."
            }`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Car Model Edited SUCCESSFULLY.",
          });

          setShowCarModelEditDialog(false);
          setCarMakerResponseFull((oldState) => {
            if (!oldState) return oldState;
            return {
              ...oldState,
              carModels: oldState.carModels.map((ele) => {
                if (ele.id === carModelEditedId) {
                  return { ...ele, name: newCarModelName };
                }
                return ele;
              }),
            };
          });
          setNewCarModelName("");
          setCarModelEditedId(null);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while editing the car model.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCarModelDelete = () => {
    setLoading(true);

    fetch(`http://localhost:5055/api/carmodels/${carModelDeleteId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: `${
              response.status === 404
                ? "Car Model Not Found."
                : "Failed to delete the car model."
            }`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Car Model Deleted SUCCESSFULLY.",
          });

          setShowCarModelDeleteDialog(false);
          setCarMakerResponseFull((oldState) => {
            if (!oldState) return oldState;
            return {
              ...oldState,
              carModels: oldState.carModels.filter(
                (ele) => ele.id !== carModelDeleteId
              ),
            };
          });
          setCarModelDeleteId(null);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while deleting the car model.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateCarGeneration = () => {
    if (!newCarGenerationName) {
      toast({
        title: "Failed",
        description: "Please fill in the generation name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    fetch(`http://localhost:5055/api/cargenerations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newCarGenerationName,
        carModelId: carModelSelectedId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to create the car generation.",
            variant: "destructive",
          });
        }
        return response.json();
      })
      .then((data) => {
        toast({
          title: "Success",
          description: "Car Generation Created SUCCESSFULLY.",
        });
        setCarMakerResponseFull((oldState) => {
          if (!oldState) return oldState;
          return {
            ...oldState,
            carModels: oldState.carModels.map((ele) => {
              if (ele.id === carModelSelectedId) {
                return {
                  ...ele,
                  carGenerations: [
                    ...ele.carGenerations,
                    { id: data.id, name: data.name },
                  ],
                };
              }
              return ele;
            }),
          };
        });
        setNewCarGenerationName("");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while creating the car generation.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCarGenerationDelete = (generationId: number) => {
    setLoading(true);

    fetch(`http://localhost:5055/api/cargenerations/${generationId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: `${
              response.status === 404
                ? "Car Generation Not Found."
                : "Failed to delete the car generation."
            }`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Car Generation Deleted SUCCESSFULLY.",
          });

          setCarMakerResponseFull((oldState) => {
            if (!oldState) return oldState;
            return {
              ...oldState,
              carModels: oldState.carModels.map((ele) => {
                if (ele.id === carModelSelectedId) {
                  return {
                    ...ele,
                    carGenerations: ele.carGenerations.filter(
                      (gen) => gen.id !== generationId
                    ),
                  };
                }
                return ele;
              }),
            };
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while deleting the car generation.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCarGenerationEdit = (generationId: number) => {
    setLoading(true);

    if (!newCarGenerationEditName) {
      toast({
        title: "Failed",
        description: "Please fill in the generation name.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5055/api/cargenerations/${generationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCarGenerationEditName }),
    })
      .then((response) => {
        if (!response.ok) {
          toast({
            title: "Error",
            description: `${
              response.status === 404
                ? "Car Generation Not Found."
                : `"Failed to edit the car generation."`
            }`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Car Generation Edited SUCCESSFULLY.",
          });

          setCarMakerResponseFull((oldState) => {
            if (!oldState) return oldState;
            return {
              ...oldState,
              carModels: oldState.carModels.map((ele) => {
                if (ele.id === carModelSelectedId) {
                  return {
                    ...ele,
                    carGenerations: ele.carGenerations.map((gen) => {
                      if (gen.id === generationId) {
                        return { ...gen, name: newCarGenerationEditName };
                      }
                      return gen;
                    }),
                  };
                }
                return ele;
              }),
            };
          });
          setNewCarGenerationEditName("");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An error occurred while editing the car generation.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center z-[100]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}
      {showDeleteAlert && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleHideDeleteAlert}
        >
          <div
            className="bg-[#18181b] p-4 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-bold text-xl">Delete Car Maker</h3>
            <p className="text-center mt-4">
              Are you sure you want to delete this car maker?
            </p>
            <div className="flex justify-between mt-4">
              <Button
                className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold"
                onClick={handleDelete}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
              <Button
                className="bg-[#f56565] hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
                onClick={handleHideDeleteAlert}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className=" p-4 min-h-[100vh] max-w-[100vw]">
        <div className="flex justify-between">
          <div
            className="cursor-pointer w-6 text-center"
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) {
                router.push("/carMakers");
                router.refresh();
              }
            }}
          >
            <Undo2 />
          </div>

          <Button
            className={cn(
              "bg-[#f56565] hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
            )}
            onClick={handleShowDeleteAlert}
          >
            Delete
          </Button>
          <Popover>
            <PopoverTrigger>
              <Button
                className={cn(
                  "bg-amber-500   hover:bg-amber-300 active:bg-amber-300 font-bold"
                )}
              >
                Edit
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center w-full max-w-md p-4  shadow-md rounded-lg bg-[#18181b] border-amber-500 border-spacing-1"
              >
                <Input
                  type="text"
                  placeholder="Enter Car Maker Name"
                  value={carMakerName}
                  onChange={handleNameChange}
                  className={cn(
                    "mb-4 p-2 border border-gray-300 rounded w-full"
                  )}
                />
                <div
                  className={cn(
                    "mb-4 p-2 border border-gray-300 rounded w-full flex items-center justify-center cursor-pointer relative"
                  )}
                  style={{ height: "100px", width: "100px" }}
                  onClick={() =>
                    document.getElementById("carMakerLogoEdit")?.click()
                  }
                >
                  {carMakerLogo ? (
                    <>
                      <img
                        src={URL.createObjectURL(carMakerLogo)}
                        alt="Car Maker"
                        className="h-full w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </>
                  ) : (
                    <FileInput className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <input
                  id="carMakerLogoEdit"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple={false}
                />
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold w-full"
                >
                  {loading ? "Loading..." : "UPDATE"}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>

        <h3 className="text-center font-bold text-xl mt-3">
          {carMakerResponseFull?.name}
        </h3>

        <div
          onClick={() => setImage(carMakerResponseFull?.logoUrl ?? null)}
          className="rounded-lg mx-auto border-[2px] border-amber-400 w-fit h-[20vh] sm:h-[40vh] mt-5 overflow-hidden"
        >
          <img
            src={carMakerResponseFull?.logoUrl}
            alt=""
            className=" object-cover  h-full"
          />
          <ImageView image={image} handleClose={handlePoster} />
        </div>

        <Drawer
          open={modelDrawerOpen}
          onOpenChange={() =>
            loading
              ? setModelsDrawerOpen(true)
              : setModelsDrawerOpen((old) => !old)
          }
        >
          <DrawerTrigger
            onClick={(e) => e.stopPropagation()}
            className={cn("block max-w-[100%] mx-auto w-[380px] sm:w-[450px]")}
          >
            <div className="cursor-pointer border-[2px] rounded-full transition-all duration-500 hover:text-black hover:bg-amber-400 active:text-black active:bg-amber-400 mt-4 border-amber-400 p-3 flex items-start justify-center mx-auto max-w-[380px] sm:max-w-[450px]">
              <p className="w-fit">NEW CAR MODEL</p>
            </div>
          </DrawerTrigger>
          <DrawerContent
            className={cn(
              "border-2 border-amber-400 sm:max-w-[1000px] sm:mx-auto"
            )}
          >
            <DrawerHeader>
              <DrawerTitle className={cn("text-amber-400")}>
                Start Adding a New Car Model to The Collection!..
              </DrawerTitle>
              {/* <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription> */}
            </DrawerHeader>
            <form onSubmit={handleModelCreation} className="p-[16px]">
              <Input
                onChange={(e) => setNewModelName(e.target.value)}
                value={newModelName}
                type="text"
                placeholder="Enter Car Model Name"
                className={cn("mb-4 p-2  rounded w-full")}
              />
              <Button
                className={cn(
                  "bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold w-full"
                )}
              >
                SUBMIT
              </Button>
            </form>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className={cn("text-center")}>
              Show Models
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-[50vh] overflow-y-auto">
                <Table>
                  {showCarModelDeleteDialog && (
                    <div
                      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                      onClick={handleShowCarModelDeleteDialog}
                    >
                      <div
                        className="bg-[#18181b] p-4 rounded-lg w-full max-w-md mx-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-amber-400 text-center font-bold text-xl mb-3">
                          Delete Car Model
                        </h3>
                        <p className="text-center mt-4">
                          Are you sure you want to delete this car model?
                        </p>
                        <div className="flex justify-between mt-4">
                          <Button
                            className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              if (carModelDeleteId) {
                                handleCarModelDelete();
                              }
                            }}
                          >
                            {loading ? "Deleting..." : "Delete"}
                          </Button>
                          <Button
                            className="bg-[#f56565] hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
                            onClick={handleShowCarModelDeleteDialog}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {showCarModelEditDialog && (
                    <div
                      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                      onClick={handleShowCarModelEditDialog}
                    >
                      <form
                        className="bg-[#18181b] p-4 rounded-lg w-full max-w-md mx-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-amber-400 text-center font-bold text-xl mb-3">
                          Edit Car Model
                        </h3>
                        <Input
                          type="text"
                          placeholder="Enter Car Model Name"
                          value={newCarModelName}
                          onChange={(e) => setNewCarModelName(e.target.value)}
                          className={cn(
                            "mb-4 p-2 border border-gray-300 rounded w-full text-white"
                          )}
                        />
                        <div className="flex justify-between mt-4">
                          <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold"
                            onClick={(e) => {
                              e.preventDefault();

                              if (carModelEditedId) {
                                handleCarModelEdit();
                              }
                            }}
                          >
                            {loading ? "Editing..." : "Edit"}
                          </Button>
                          <Button
                            type="button"
                            className="bg-[#f56565] hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
                            onClick={handleShowCarModelEditDialog}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                  <TableCaption>A list of Models For This Maker.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">M. ID</TableHead>
                      <TableHead>M. Name</TableHead>
                      <TableHead className="text-center">M. Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[#c12c69] ">
                    {carModelSelectedId && (
                      <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={() => {
                          if (carModelSelectedId && !loading) {
                            setCarModelSelectedId(null);
                          }
                        }}
                      >
                        <div
                          className="bg-[#18181b] flex flex-col p-4 rounded-lg w-full max-h-[600px]  max-w-md mx-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="text-amber-400 text-center font-bold text-xl mb-3">
                            Car Model Generations
                          </h3>
                          <form
                            className="flex justify-center flex-col"
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              handleCreateCarGeneration();
                            }}
                          >
                            <Input
                              onChange={(e) =>
                                setNewCarGenerationName(e.target.value)
                              }
                              value={newCarGenerationName}
                              type="text"
                              placeholder="Enter Generation Name"
                              className={cn(
                                "mb-4 p-2 border border-gray-300 rounded w-full text-white"
                              )}
                            />
                            <Button
                              className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold"
                              type="submit"
                            >
                              Add Generation
                            </Button>
                          </form>
                          <div className="flex flex-col gap-1 mt-4 overflow-y-auto flex-1">
                            {carMakerResponseFull?.carModels
                              ?.find((ele) => ele.id === carModelSelectedId)
                              ?.carGenerations.map((ele) => (
                                <form
                                  key={ele.id}
                                  className="bg-[#18181b] p-2 rounded-lg border border-amber-400 w-full"
                                >
                                  <p className="text-center text-white">
                                    {ele.name}
                                  </p>

                                  <div className="flex flex-col gap-2 items-center mt-4">
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCarGenerationDelete(ele.id);
                                      }}
                                      type="button"
                                      className="bg-[#f56565] hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
                                    >
                                      Delete
                                    </Button>
                                    <div>
                                      <Accordion
                                        onValueChange={(_) => {
                                          setNewCarGenerationEditName("");
                                        }}
                                        type="single"
                                        collapsible
                                      >
                                        <AccordionItem value="item-1">
                                          <AccordionTrigger
                                            className={cn("text-white")}
                                          >
                                            <p>{`Wanna edit? :)`}</p>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <div>
                                              <Input
                                                onChange={(e) =>
                                                  setNewCarGenerationEditName(
                                                    e.target.value
                                                  )
                                                }
                                                value={newCarGenerationEditName}
                                                type="text"
                                                placeholder="Enter Generation Name"
                                                className={cn(
                                                  "mb-4 p-2 border border-gray-300 rounded w-full text-white"
                                                )}
                                              />
                                              <div className=" mt-4">
                                                <Button
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleCarGenerationEdit(
                                                      ele.id
                                                    );
                                                  }}
                                                  className="bg-amber-500 hover:bg-amber-300 active:bg-amber-300 font-bold block w-full text-center"
                                                  type="button"
                                                >
                                                  Change
                                                </Button>
                                              </div>
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </Accordion>
                                    </div>
                                  </div>
                                </form>
                              ))}
                          </div>

                          <div className="text-center mt-3">
                            <Button
                              className="bg-amber-400 hover:bg-[#893d3d] active:bg-[#893d3d] font-bold"
                              onClick={() => {
                                if (carModelSelectedId && !loading) {
                                  setCarModelSelectedId(null);
                                }
                              }}
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {carModels?.map((ele) => (
                      <TableRow
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarModelSelectedId(ele.id);
                        }}
                        key={ele.id}
                      >
                        <TableCell className="font-medium">{ele.id}</TableCell>
                        <TableCell className="font-medium text-lg">
                          {ele.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {ele.generationsCount}
                        </TableCell>
                        <TableCell className="">
                          <div className="flex flex-row justify-end">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowCarModelEditDialog();
                                setCarModelEditedId(ele.id);
                              }}
                              variant="outline"
                              className="text-amber-400 hover:bg-black active:bg-black active:text-amber-300 font-bold"
                            >
                              <PencilLine />
                            </Button>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowCarModelDeleteDialog();
                                setCarModelDeleteId(ele.id);
                              }}
                              variant="outline"
                              className="text-[#c12c69] hover:bg-black active:bg-black active:text-[#c12c69] font-bold"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="text-[#ffbb49] font-medium ">
                      <TableCell className="text-lg " colSpan={3}>
                        Total Generations Count
                      </TableCell>
                      <TableCell className="text-right text-lg">
                        {generationsCount}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
