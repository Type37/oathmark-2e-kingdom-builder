import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FormLayout,
  TextInput, RadioList, RadioListItem, FileInput, HStack, Button,
} from "@astryxdesign/core";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { saveEmblem } from "../emblem.mjs";

const SIZES = [
  { value: "beginner", label: "Beginner", regions: "Regions 1 & 2" },
  { value: "moderate", label: "Moderate", regions: "Regions 1, 2 & 3" },
  { value: "expert", label: "Expert", regions: "Regions 1, 2, 3 & 4" },
];

// cropperjs needs a real <img> to mount on; square crop for the emblem.
function EmblemCrop({ file, cropperRef }) {
  const imgRef = React.useRef(null);
  const [src, setSrc] = React.useState(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  React.useEffect(() => {
    if (!src || !imgRef.current) return;
    const cropper = new Cropper(imgRef.current, {
      aspectRatio: 1, viewMode: 1, autoCropArea: 1, background: false,
    });
    cropperRef.current = cropper;
    return () => { cropper.destroy(); cropperRef.current = null; };
  }, [src, cropperRef]);

  return src ? <img ref={imgRef} src={src} alt="Emblem" className="om-crop" /> : null;
}

export default function FoundKingdom({ isOpen, onOpenChange, onFound }) {
  const [name, setName] = React.useState("");
  const [ruler, setRuler] = React.useState("");
  const [level, setLevel] = React.useState("moderate");
  const [file, setFile] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const cropperRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) { setName(""); setRuler(""); setLevel("moderate"); setFile(null); setBusy(false); }
  }, [isOpen]);

  async function found() {
    setBusy(true);
    let emblem = null;
    const cropper = cropperRef.current;
    if (file && cropper) {
      const blob = await new Promise((r) =>
        cropper.getCroppedCanvas({ width: 512, height: 512 }).toBlob(r, "image/png"));
      if (blob) emblem = await saveEmblem(blob);
    }
    onFound({ name: name.trim(), ruler: ruler.trim(), level, emblem });
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520} purpose="form">
      <Layout
        header={<DialogHeader title="Found a Kingdom" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <FormLayout>
              <TextInput label="Kingdom Name" value={name}
                         onChange={(e) => setName(e.target?.value ?? e)} />
              <TextInput label="Current Ruler" value={ruler}
                         onChange={(e) => setRuler(e.target?.value ?? e)} />
              <RadioList label="Oathmark Experience" value={level} onChange={setLevel}>
                {SIZES.map((s) => (
                  <RadioListItem key={s.value} value={s.value} label={s.label} description={s.regions} />
                ))}
              </RadioList>
              <FileInput label="Emblem" accept="image/*" mode="dropzone" isOptional
                         value={file} onChange={(f) => setFile(Array.isArray(f) ? f[0] ?? null : f)} />
              {file && <EmblemCrop file={file} cropperRef={cropperRef} />}
            </FormLayout>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
              <Button label="Found a Kingdom" variant="primary" isLoading={busy} onClick={found} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
