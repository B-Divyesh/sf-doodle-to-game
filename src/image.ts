export interface PixelBuffer { data: Uint8ClampedArray; width: number; height: number }

export const removePaperPixels = (image: PixelBuffer, threshold = 48): PixelBuffer => {
  const output = new Uint8ClampedArray(image.data);
  for (let i = 0; i < output.length; i += 4) {
    const red = output[i];
    const green = output[i + 1];
    const blue = output[i + 2];
    const brightest = Math.max(red, green, blue);
    const darkest = Math.min(red, green, blue);
    const closenessToWhite = 255 - brightest;
    const colorCast = brightest - darkest;
    const distance = closenessToWhite + colorCast * 0.65;
    if (distance < threshold) output[i + 3] = Math.round(255 * Math.max(0, distance / threshold));
  }
  return { data: output, width: image.width, height: image.height };
};

export const removePaperBackground = (canvas: HTMLCanvasElement, threshold = 48): void => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser cannot edit the drawing canvas.');
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const cleaned = removePaperPixels(image, threshold);
  const output = new ImageData(cleaned.width, cleaned.height);
  output.data.set(cleaned.data);
  context.putImageData(output, 0, 0);
};

export const containImage = (canvas: HTMLCanvasElement, image: CanvasImageSource, width: number, height: number): void => {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / width, canvas.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
};
