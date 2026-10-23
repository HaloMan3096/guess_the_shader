
const featureCache = new Map();
let analysisPromise = null;

function getColorHistogram(iconUrl) {
  if (featureCache.has(iconUrl)) {
    return featureCache.get(iconUrl);
  }

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 32;
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(
          0, 0, size, size
        ).data;

        const histogram = Array(12).fill(0);
        let visiblePixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] < 32) continue;

          histogram[Math.floor(pixels[i] / 64)]++;
          histogram[4 + Math.floor(pixels[i + 1] / 64)]++;
          histogram[8 + Math.floor(pixels[i + 2] / 64)]++;

          visiblePixels++;
        }

        resolve(
          visiblePixels === 0
            ? null
            : histogram.map((value) => value / visiblePixels)
        );
      } catch (error) {
        console.warn("Couldn't analyze shader icon:", iconUrl, error);
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = iconUrl;
  });

  featureCache.set(iconUrl, promise);
  return promise;
}

function getColorDistance(a, b) {
  if (!a || !b) return Infinity;

  return Math.sqrt(
    a.reduce((sum, value, index) => {
      const difference = value - b[index];
      return sum + difference * difference;
    }, 0)
  );
}

// Analyze every shader once and reuse the results.
export function prepareShaderCache(shaders) {
  if (analysisPromise) return analysisPromise;

  analysisPromise = Promise.all(
    shaders.map(async (shader) => ({
      shader,
      histogram: await getColorHistogram(shader.icon),
    }))
  ).then((results) =>
    results.filter((result) => result.histogram)
  );

  return analysisPromise;
}

// Find visually similar shaders across the entire collection.
export async function rankSimilarShaders(answer, shaders) {
  const cachedFeatures = await prepareShaderCache(shaders);
  const answerHistogram = await getColorHistogram(answer.icon);

  if (!answerHistogram) return null;

  return cachedFeatures
    .filter(({ shader }) => shader.id !== answer.id)
    .map(({ shader, histogram }) => ({
      shader,
      distance: getColorDistance(answerHistogram, histogram),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map(({ shader }) => shader);
}
