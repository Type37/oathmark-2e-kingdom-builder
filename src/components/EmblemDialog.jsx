import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FileInput, HStack, Button,
} from "@astryxdesign/core";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

// Pick an image, crop it square, hand back a 512px PNG blob.
export default function EmblemDialog({ isOpen, onOpenChange, onDone }) {
  const [file, setFile] = React.useState(null);
  const [src, setSrc] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const imgRef = React.useRef(null);
  const cropperRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) { setFile(null); setBusy(false); }
  }, [isOpen]);

  React.useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  React.useEffect(() => {
    if (!src || !imgRef.current) return;
    const cropper = new Cropper(imgRef.current, {
      aspectRatio: 1, viewMode: 1, dragMode: "move", autoCropArea: 0.9,
      background: false, guides: false, toggleDragModeOnDblclick: false,
    });
    cropperRef.current = cropper;
    return () => { cropper.destroy(); cropperRef.current = null; };
  }, [src]);

  async function done() {
    const cropper = cropperRef.current;
    if (!cropper) return;
    setBusy(true);
    const blob = await new Promise((r) =>
      cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingQuality: "high" })
        .toBlob(r, "image/png"));
    setBusy(false);
    if (blob) onDone(blob);
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={560} purpose="form">
      <Layout
        header={<DialogHeader title="Emblem" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {src ? (
              <AspectRatio ratio={4 / 3}>
                <div className="om-crop-stage">
                  <img ref={imgRef} src={src} alt="Emblem source" />
                </div>
              </AspectRatio>
            ) : (
              <FileInput label="Emblem" isLabelHidden accept="image/*" mode="dropzone"
                         value={file} onChange={(f) => setFile(Array.isArray(f) ? f[0] ?? null : f)} />
            )}
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="between">
              {src ? <Button label="Change Image" variant="secondary" onClick={() => setFile(null)} /> : <span />}
              <HStack gap={2}>
                <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
                <Button label="Done" variant="primary" isDisabled={!src} isLoading={busy} onClick={done} />
              </HStack>
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
