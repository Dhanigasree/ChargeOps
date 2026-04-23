const buildHeaders = (authorization) => ({
  "Content-Type": "application/json",
  authorization
});

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || "Upstream service request failed");
    error.statusCode = response.status;
    throw error;
  }

  return payload;
};

export const serviceClient = {
  async get(url, authorization) {
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(authorization),
      signal: AbortSignal.timeout(10000)
    });

    return parseResponse(response);
  },

  async put(url, authorization, body) {
    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(authorization),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });

    return parseResponse(response);
  }
};
