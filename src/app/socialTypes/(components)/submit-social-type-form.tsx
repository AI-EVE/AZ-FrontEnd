import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, SendHorizontal } from "lucide-react";
import { useState } from "react";

interface SubmitSocialTypeFormProps {
  handleAddSocialType: (
    socialTypeName: string,
    socialTypeImage: File | null
  ) => void;
  closeForm: () => void;
}

export default function SubmitSocialTypeForm({
  handleAddSocialType,
  closeForm,
}: SubmitSocialTypeFormProps) {
  const [socialTypeName, setSocialTypeName] = useState("");
  const [socialTypeImage, setSocialTypeImage] = useState<File | null>(null);

  const handleImageUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 1) {
      setSocialTypeImage(e.target.files[0]);
      e.target.value = "";
    } else {
      setSocialTypeImage(null);
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
          handleAddSocialType(socialTypeName, socialTypeImage);
        }}
        className="flex flex-col gap-2 fixed"
      >
        <div className="flex items-center gap-2">
          <Input
            onChange={(e) => {
              e.preventDefault();
              setSocialTypeName(e.target.value);
            }}
            value={socialTypeName}
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
            document.getElementById("social-type-image-upload")?.click()
          }
        >
          {socialTypeImage ? (
            <div
              className="w-full h-full flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                onClick={(_) => setSocialTypeImage(null)}
                src={URL.createObjectURL(socialTypeImage)}
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
            id="social-type-image-upload"
            accept="image/*"
            multiple={false}
          />
        </div>
      </form>
    </div>
  );
}
