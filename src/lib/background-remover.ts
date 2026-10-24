/**
 * Browser-native intelligent background removal utility for category & product images.
 * Uses HTML5 Canvas edge-connected BFS flood-fill and boundary antialiasing to cleanly
 * remove studio/solid/light backgrounds while keeping internal white and colored details intact.
 */

export interface BackgroundRemovalResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

export function removeBackgroundFromImageFile(
  file: File,
  tolerance: number = 36
): Promise<BackgroundRemovalResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve({
        file,
        dataUrl: "",
        width: 0,
        height: 0,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve({ file, dataUrl: "", width: 0, height: 0 });
        return;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            resolve({ file, dataUrl: src, width, height });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // 1. Sample corners & outer border to detect dominant background color
          const cornerIndices = [
            0, // top-left
            (width - 1) * 4, // top-right
            (height - 1) * width * 4, // bottom-left
            ((height - 1) * width + (width - 1)) * 4, // bottom-right
          ];

          let bgR = 0;
          let bgG = 0;
          let bgB = 0;
          let sampleCount = 0;

          cornerIndices.forEach((idx) => {
            if (data[idx + 3] > 20) {
              bgR += data[idx];
              bgG += data[idx + 1];
              bgB += data[idx + 2];
              sampleCount++;
            }
          });

          if (sampleCount > 0) {
            bgR = Math.round(bgR / sampleCount);
            bgG = Math.round(bgG / sampleCount);
            bgB = Math.round(bgB / sampleCount);
          } else {
            bgR = 255;
            bgG = 255;
            bgB = 255;
          }

          const isLightBg = bgR > 210 && bgG > 210 && bgB > 210;

          // Color Euclidean Distance
          const colorDist = (
            r1: number,
            g1: number,
            b1: number,
            r2: number,
            g2: number,
            b2: number
          ) => {
            return Math.sqrt(
              (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
            );
          };

          // 2. Breadth-First-Search (BFS) Flood Fill strictly from borders
          // Only connected outer background pixels are removed.
          // Inside details (white decals, headlights, windshields) remain completely intact!
          const visited = new Uint8Array(width * height);
          const queue: number[] = [];

          // Enqueue all 4 outer border edges
          for (let x = 0; x < width; x++) {
            queue.push(x); // top edge
            queue.push((height - 1) * width + x); // bottom edge
          }
          for (let y = 1; y < height - 1; y++) {
            queue.push(y * width); // left edge
            queue.push(y * width + (width - 1)); // right edge
          }

          let head = 0;
          while (head < queue.length) {
            const pIdx = queue[head++];
            if (visited[pIdx]) continue;
            visited[pIdx] = 1;

            const px = pIdx % width;
            const py = Math.floor(pIdx / width);
            const dIdx = pIdx * 4;

            const r = data[dIdx];
            const g = data[dIdx + 1];
            const b = data[dIdx + 2];
            const a = data[dIdx + 3];

            if (a === 0) continue;

            const dist = colorDist(r, g, b, bgR, bgG, bgB);

            // Light/studio backdrop matching
            const matchesWhiteStudio =
              isLightBg &&
              r > 215 &&
              g > 215 &&
              b > 215 &&
              Math.abs(r - g) < 25 &&
              Math.abs(g - b) < 25;

            if (dist <= tolerance || matchesWhiteStudio) {
              data[dIdx + 3] = 0; // set alpha transparent

              // Propagate to 4 neighbors
              if (px > 0 && !visited[pIdx - 1]) queue.push(pIdx - 1);
              if (px < width - 1 && !visited[pIdx + 1]) queue.push(pIdx + 1);
              if (py > 0 && !visited[pIdx - width]) queue.push(pIdx - width);
              if (py < height - 1 && !visited[pIdx + width])
                queue.push(pIdx + width);
            }
          }

          // 3. Smooth Edge Antialiasing (feather boundary borders for crisp professional look)
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const pIdx = y * width + x;
              const dIdx = pIdx * 4;
              if (data[dIdx + 3] > 0) {
                // If any cardinal neighbor is transparent, soften transition
                const isBorderPixel =
                  data[(pIdx - 1) * 4 + 3] === 0 ||
                  data[(pIdx + 1) * 4 + 3] === 0 ||
                  data[(pIdx - width) * 4 + 3] === 0 ||
                  data[(pIdx + width) * 4 + 3] === 0;

                if (isBorderPixel) {
                  const dist = colorDist(
                    data[dIdx],
                    data[dIdx + 1],
                    data[dIdx + 2],
                    bgR,
                    bgG,
                    bgB
                  );
                  if (dist < tolerance * 1.6) {
                    const alphaRatio = Math.max(
                      0.2,
                      Math.min(1, dist / (tolerance * 1.6))
                    );
                    data[dIdx + 3] = Math.round(data[dIdx + 3] * alphaRatio);
                  }
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);

          canvas.toBlob((blob) => {
            if (!blob) {
              resolve({ file, dataUrl: src, width, height });
              return;
            }
            const cleanBase = file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_\-]/g, "_");
            const transparentFile = new File(
              [blob],
              `${cleanBase}-transparent.png`,
              { type: "image/png" }
            );
            const transparentDataUrl = canvas.toDataURL("image/png");

            resolve({
              file: transparentFile,
              dataUrl: transparentDataUrl,
              width,
              height,
            });
          }, "image/png");
        } catch (canvasErr) {
          console.error("Canvas background removal error:", canvasErr);
          resolve({ file, dataUrl: src, width: img.width, height: img.height });
        }
      };

      img.onerror = () => {
        resolve({ file, dataUrl: src, width: 0, height: 0 });
      };

      img.src = src;
    };

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}
