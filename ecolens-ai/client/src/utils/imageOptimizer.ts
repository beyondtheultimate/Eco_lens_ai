/**
 * Client-side image optimizer for EcoLens AI.
 * Automatically downscales large camera / phone photographs to a maximum dimension
 * of 1600px while retaining crisp visual resolution for material texture, resin codes,
 * and packaging labels. This dramatically accelerates upload time and prevents
 * serverless execution timeouts without degrading vision model accuracy.
 */
export async function optimizeImageForVision(file: File): Promise<File> {
  // If file is already small (<= 800 KB), pass through directly
  if (file.size <= 800 * 1024) {
    return file;
  }

  // Ensure file is an image
  const lowerName = file.name.toLowerCase();
  const isImage =
    file.type.startsWith("image/") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".jfif");

  if (!isImage) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIM = 1600;
      let { width, height } = img;

      // If already within boundary, return original file
      if (width <= MAX_DIM && height <= MAX_DIM) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Maintain filename with .jpg extension for standardized processing
          const cleanName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          const optimizedFile = new File([blob], cleanName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          console.log(
            `[EcoLens AI] Optimized image: ${(file.size / 1024).toFixed(0)} KB -> ${(
              optimizedFile.size / 1024
            ).toFixed(0)} KB (${width}x${height})`
          );
          resolve(optimizedFile);
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Safe fallback to original
    };

    img.src = objectUrl;
  });
}
