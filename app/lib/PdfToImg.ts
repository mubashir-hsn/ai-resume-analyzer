export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
  }
  
  let pdfjsLib: any = null;
  let isLoading = false;
  let loadPromise: Promise<any> | null = null;
  
  async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;
  
    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module that TypeScript can fully understand without specific declarations, but it works at runtime.
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (lib) => {
      // Import the worker as a URL using Vite's '?url' suffix.
      // TypeScript will now understand this due to the 'vite-env.d.ts' declaration.
      const pdfWorker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  
      // Assign the URL provided by Vite to the workerSrc.
      lib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      pdfjsLib = lib;
      isLoading = false;
      return lib;
    });
  
    return loadPromise;
  }
  
  export async function convertPdfToImage(
    file: File
  ): Promise<PdfConversionResult> {
    try {
      const lib = await loadPdfJs();
  
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Get the first page
  
      // Set a higher scale for better image quality
      const viewport = page.getViewport({ scale: 4 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
  
      canvas.width = viewport.width;
      canvas.height = viewport.height;
  
      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }
  
      // Render the PDF page onto the canvas
      await page.render({ canvasContext: context!, viewport }).promise;
  
      // Convert canvas content to a Blob (image file data)
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a File from the blob with a sensible name
              const originalName = file.name.replace(/\.pdf$/i, "");
              const imageFile = new File([blob], `${originalName}.png`, {
                type: "image/png",
              });
  
              resolve({
                imageUrl: URL.createObjectURL(blob), // URL for display
                file: imageFile, // The image file itself
              });
            } else {
              resolve({
                imageUrl: "",
                file: null,
                error: "Failed to create image blob from canvas",
              });
            }
          },
          "image/png", // Output format
          1.0 // Quality (1.0 for highest)
        );
      });
    } catch (err: any) { // Catch any potential errors during the process
      console.error("Error converting PDF to image:", err);
      return {
        imageUrl: "",
        file: null,
        error: `Failed to convert PDF: ${err.message || err}`,
      };
    }
  }