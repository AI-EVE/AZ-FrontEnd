import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, SendHorizontal } from "lucide-react";
import { useState } from "react";

interface SubmitCountryFormProps {
  handleAddCountry: (countryName: string, countryImage: File | null) => void;
  closeForm: () => void;
}

export default function SubmitCountryForm({
  handleAddCountry,
  closeForm,
}: SubmitCountryFormProps) {
  const [countryName, setCountryName] = useState("");
  const [countryImage, setCountryImage] = useState<File | null>(null);

  const handleImageUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 1) {
      setCountryImage(e.target.files[0]);
    } else {
      setCountryImage(null);
    }
  };

  return (
    <div
      onClick={(e) => {
        closeForm();
      }}
      className="fixed top-0 left-0 w-full h-full bg-dark-2 bg-opacity-90  flex justify-center"
    >
      <form
        onClick={(e) => {
          e.stopPropagation();
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddCountry(countryName, countryImage);
        }}
        className="flex flex-col gap-2 fixed"
      >
        <div className="flex items-center gap-2">
          <Input
            onChange={(e) => {
              e.preventDefault();
              setCountryName(e.target.value);
            }}
            value={countryName}
            type="text"
            placeholder="Product Maker Name"
            className="mt-2 bg-dark-2 text-white focus:border-amber-500 focus:ring-amber-500 rounded-md px-3 py-2 outline-none"
          />

          <Button
            type="submit"
            className="mt-2 bg-amber-500 text-black hover:bg-amber-600 rounded-md px-3 py-2"
          >
            <SendHorizontal />
          </Button>
        </div>
        <div
          className="flex items-center justify-center h-32 w-full border border-input shadow-sm bg-background rounded-md"
          onClick={(e) =>
            document.getElementById("product-maker-image-upload")?.click()
          }
        >
          {countryImage ? (
            <div
              className="w-full h-full flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                onClick={(_) => setCountryImage(null)}
                src={URL.createObjectURL(countryImage)}
                alt="preview"
                className="h-full object-cover"
              />
            </div>
          ) : (
            <ImagePlus size={80} strokeWidth={1.75} />
          )}

          <input
            onChange={(e) => handleImageUploadInput(e)}
            type="file"
            className="hidden"
            id="product-maker-image-upload"
            accept="image/*"
            multiple={false}
          />
        </div>
      </form>
    </div>
  );
}
