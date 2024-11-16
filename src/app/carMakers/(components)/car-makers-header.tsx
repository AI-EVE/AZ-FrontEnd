"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FileInput, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CarMakersHeader() {
  const { toast } = useToast();
  const [carMakerName, setCarMakerName] = useState("");
  const [carMakerLogo, setCarMakerLogo] = useState<File | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarMakerName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCarMakerLogo(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!carMakerName || !carMakerLogo) {
      toast({
        title: "Failed",
        description: "Please fill in all fields.",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("Name", carMakerName);
    formData.append("Logo", carMakerLogo);
    try {
      const response = await fetch("http://localhost:5055/api/carmakers", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Car maker added successfully.",
        });
        setCarMakerName("");
        setCarMakerLogo(null);
        setIsFormVisible(false);
        router.refresh();
        console.log("Success:", result);
      } else if (response.status === 400) {
        toast({
          title: "Conflict",
          description: `${(await response.json()).message}`,
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

  const showForm = () => {
    setIsFormVisible(true);
  };

  const hideForm = () => {
    if (!loading) {
      setIsFormVisible(false);
    }
  };

  const removeImage = () => {
    setCarMakerLogo(null);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90 flex justify-center items-center z-[100]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}
      <div className="flex justify-center mb-4">
        <Button
          className="bg-amber-500   hover:bg-amber-300 active:bg-amber-300 font-bold "
          onClick={showForm}
        >
          Add Car Maker
        </Button>
      </div>
      {isFormVisible && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={hideForm}
        >
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center w-full max-w-md p-4  shadow-md rounded-lg bg-[#18181b] border-amber-500 border-spacing-1"
            >
              <Input
                type="text"
                placeholder="Enter Car Maker Name"
                value={carMakerName}
                onChange={handleNameChange}
                className={cn("mb-4 p-2 border border-gray-300 rounded w-full")}
              />
              <div
                className={cn(
                  "mb-4 p-2 border border-gray-300 rounded w-full flex items-center justify-center cursor-pointer relative"
                )}
                style={{ height: "100px", width: "100px" }}
                onClick={() => document.getElementById("fileInput")?.click()}
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
                id="fileInput"
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
                {loading ? "Loading..." : "Add Car Maker"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
