export const getToken = () => localStorage.getItem("token");

export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/-/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload); //exp
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const decode = decodeToken(token);
  if (!decode) return true;
  return Date.now() >= decode.exp * 1000;
};
