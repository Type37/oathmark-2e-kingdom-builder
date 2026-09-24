import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, HStack, Button,
} from "@astryxdesign/core";
// Uppy is fetched the first time the dialog opens, not with every page.
const loadUppy = () => Promise.all([
  import("@uppy/core"), import("@uppy/dashboard"), import("@uppy/image-editor"),
  import("@uppy/core/css/style.css"), import("@uppy/dashboard/css/style.css"),
  import("@uppy/image-editor/css/style.css"),
]).then(([core, dashboard, editor]) => ({
  Uppy: core.default, Dashboard: dashboard.default, ImageEditor: editor.default,
}));

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
    let uppy = null;
    let dead = false;

    loadUppy().then(({ Uppy, Dashboard, ImageEditor }) => {
      if (dead) return;
      uppy = new Uppy({
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
    });

    return () => { dead = true; uppy?.destroy(); };
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
