import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FileInput,
  HStack, VStack, Button, Slider,
} from "@astryxdesign/core";
import AvatarEditor from "react-avatar-editor";
import { GAP } from "../layout.mjs";

const SIZE = 512;   // what gets saved
const STAGE = 360;  // what you drag on

// Big photographs make the canvas crawl, so the source is scaled down first.
function downscale(file, max = 1600) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      if (scale === 1) { resolve(url); return; }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

// Drag the picture, scroll or drag the slider to zoom, turn it if it needs it.
export default function EmblemDialog({ isOpen, onOpenChange, onDone }) {
  const [file, setFile] = React.useState(null);
  const [src, setSrc] = React.useState(null);
  const [scale, setScale] = React.useState(1.2);
  const [rotate, setRotate] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const editor = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) { setFile(null); setBusy(false); }
  }, [isOpen]);

  React.useEffect(() => {
    let dead = false;
    setScale(1.2);
    setRotate(0);
    if (!file) { setSrc(null); return undefined; }
    downscale(file).then((url) => { if (!dead) setSrc(url); });
    return () => { dead = true; };
  }, [file]);

  async function done() {
    if (!editor.current) return;
    setBusy(true);
    const canvas = editor.current.getImageScaledToCanvas();
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    setBusy(false);
    if (blob) onDone(blob);
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={STAGE + 40 + 64} purpose="form">
      <Layout
        header={<DialogHeader title="Emblem" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {src ? (
              <VStack gap={GAP.group} align="center">
                <div className="om-crop-stage">
                  <AvatarEditor
                    ref={editor}
                    image={src}
                    width={STAGE}
                    height={STAGE}
                    border={20}
                    borderRadius={0}
                    color={[92, 89, 83, 0.55]}
                    scale={scale}
                    rotate={rotate}
                  />
                </div>
                <HStack gap={GAP.group} align="center" width="100%">
                  <Slider label="Zoom" value={scale} min={1} max={5} step={0.02} onChange={setScale} />
                  <Button label="Rotate" variant="secondary"
                          onClick={() => setRotate((r) => (r + 90) % 360)} />
                </HStack>
              </VStack>
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
