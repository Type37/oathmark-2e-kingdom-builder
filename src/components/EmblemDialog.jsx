import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, HStack, Button,
} from "@astryxdesign/core";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import ImageEditor from "@uppy/image-editor";

const SIZE = 512;    // what gets saved
const STAGE_W = 680; // what Uppy draws in
const STAGE_H = 460;

// Uppy owns both halves of this: the Dashboard takes the picture in (drop it,
// paste it, browse for it, or shoot it on a webcam) and the ImageEditor frames
// it. Saving the crop is the whole gesture, so that is what closes the dialog.
export default function EmblemDialog({ isOpen, onOpenChange, onDone }) {
  const mount = React.useRef(null);
  const done = React.useRef(onDone);
  done.current = onDone;

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const target = mount.current;
    if (!target) return undefined;

    const uppy = new Uppy({
      autoProceed: false,
      restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ["image/*"] },
    })
      .use(Dashboard, {
        target,
        inline: true,
        width: STAGE_W,
        height: STAGE_H,
        theme: "auto",
        autoOpen: "imageEditor",
        hideUploadButton: true,
        disableStatusBar: true,
        proudlyDisplayPoweredByUppy: false,
      })
      .use(ImageEditor, {
        quality: 0.92,
        // A square emblem, locked, cut straight to the size we store.
        cropperOptions: {
          aspectRatio: 1,
          viewMode: 1,
          croppedCanvasOptions: { width: SIZE, height: SIZE },
        },
        // The ratio is fixed, so the ratio buttons would do nothing.
        actions: {
          revert: true, rotate: true, granularRotate: true, flip: true,
          zoomIn: true, zoomOut: true,
          cropSquare: false, cropWidescreen: false, cropWidescreenVertical: false,
        },
      });

    uppy.on("file-editor:complete", (file) => {
      if (file?.data) done.current(file.data);
    });

    return () => uppy.destroy();
  }, [isOpen]);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={STAGE_W + 64} purpose="form">
      <Layout
        header={<DialogHeader title="Emblem" onOpenChange={onOpenChange} />}
        content={<LayoutContent><div ref={mount} className="om-crop-stage" /></LayoutContent>}
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
