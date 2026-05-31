import { useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  label?: string;
};

export function ImageUpload({ value, onChange, bucket = "shop", label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">{label}</label>}

      {value ? (
        <div className="relative group aspect-video sm:aspect-square w-full max-w-[200px] rounded-xl overflow-hidden border border-border bg-muted">
          <img src={value} alt="Uploaded" className="size-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 size-8 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center aspect-video sm:aspect-square w-full max-w-[200px] rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
          {uploading ? (
            <Loader2 className="size-6 text-primary animate-spin" />
          ) : (
            <>
              <Upload className="size-6 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Upload Image</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}