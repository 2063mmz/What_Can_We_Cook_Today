/** Triggers a browser download. Nothing leaves the device. */
export function downloadText(
  filename: string,
  contents: string,
  mimeType = 'text/markdown;charset=utf-8',
): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsText(file);
  });
}

/** A dated file name, e.g. `my-recipes-2026-08-08.md`. */
export function datedFilename(base: string, extension: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${base}-${today}.${extension}`;
}
