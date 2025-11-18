/**
 * Converts an image URL to a Base64 encoded string.
 * This is necessary because the Gemini API requires image data directly, not a URL.
 * @param url The URL of the image to convert.
 * @returns A promise that resolves to an object containing the base64 string and its mime type.
 */
export const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const mimeType = blob.type;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // result is a data URL (e.g., "data:image/png;base64,iVBORw0KGgo...")
                // We need to strip the prefix to get just the base64 part.
                const base64String = (reader.result as string).split(',')[1];
                if (base64String) {
                    resolve({ base64: base64String, mimeType: mimeType });
                } else {
                    reject(new Error("Failed to read Base64 string from data URL."));
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting URL to Base64:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};
