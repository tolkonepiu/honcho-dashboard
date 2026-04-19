export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  try {
    const data = (await response.json()) as {
      error?: { message?: string };
    };

    return data.error?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
