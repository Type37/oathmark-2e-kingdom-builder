import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FileInput,
  HStack, Button, Slider, Text,
} from "@astryxdesign/core";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import Cropper from "react-easy-crop";

// Draw the chosen crop onto a 512px square.
async function cropToBlob(src, area) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, 512, 512);
  return new Promise((r) => canvas.toBlob(r, "image/png"));
}

// Pick an image, drag to move, scroll or pinch to zoom, hand back a 512px PNG.
export default function EmblemDialog({ isOpen, onOpenChange, onDone }) {
  const [file, setFile] = React.useState(null);
  const [src, setSrc] = React.useState(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [area, setArea] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) { setFile(null); setBusy(false); }
  }, [isOpen]);

  React.useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function done() {
    if (!src || !area) return;
    setBusy(true);
    const blob = await cropToBlob(src, area);
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
              <>
                <AspectRatio ratio={4 / 3}>
                  <div className="om-crop-stage">
                    <Cropper
                      image={src}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      minZoom={0.5}
                      maxZoom={8}
                      restrictPosition={false}
                      zoomSpeed={0.25}
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                      onCropComplete={(_, pixels) => setArea(pixels)}
                    />
                  </div>
                </AspectRatio>
                <HStack gap={4} align="center">
                  <Text type="label">Zoom</Text>
                  <Slider label="Zoom" isLabelHidden value={zoom} min={0.5} max={8} step={0.05}
                          onChange={setZoom} />
                  <Button label="Rotate" size="sm" variant="secondary"
                          onClick={() => setRotation((r) => (r + 90) % 360)} />
                </HStack>
              </>
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
