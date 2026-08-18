export function parseAuthErrorMessage(raw) {
  if (!raw) return "Authentication failed. Please try again.";

  const safeDecode = (value) => {
    try {
      return decodeURIComponent(String(value).replace(/\+/g, " "));
    } catch {
      return String(value).replace(/\+/g, " ");
    }
  };

  const decoded = safeDecode(raw);

  const jsonMessage = (() => {
    try {
      const jsonStart = decoded.indexOf("{");
      if (jsonStart === -1) return null;
      const parsed = JSON.parse(decoded.slice(jsonStart).replace(/'/g, '"'));
      return parsed?.message || parsed?.detail?.message || null;
    } catch {
      return null;
    }
  })();

  if (jsonMessage) return jsonMessage;

  const messageMatch = decoded.match(/message['"]?\s*[:=]\s*['"]([^'"]+)['"]/i);
  if (messageMatch?.[1]) return messageMatch[1];

  if (/email not registered|user not found/i.test(decoded)) {
    return "User not found. Please contact your administrator.";
  }

  if (/user is inactive/i.test(decoded)) {
    return "User is inactive. Please contact your administrator.";
  }

  return decoded.length > 200
    ? "Authentication failed. Please contact your administrator."
    : decoded;
}

export function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.detail?.message === "string") return data.detail.message;

  if (typeof error?.message === "string" && error.message !== "Network Error") {
    return error.message;
  }

  return null;
}

export function getAuthFailureMessage(error, status) {
  const apiMessage = getApiErrorMessage(error);
  if (apiMessage) return apiMessage;

  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 403) return "You are not authorized to access this application.";

  return "Authentication failed. Please try again.";
}

export function stripAuthErrorFromUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has("error")) return;

  url.searchParams.delete("error");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
