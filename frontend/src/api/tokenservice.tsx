import cookies from "js-cookie";
interface TokenDetailsI {
  access: string;
}

interface TokenInfo {
  userId: number;
  email: string;
  name: string;
}
function setToken(token: TokenDetailsI) {
  cookies.set("token", token.access);
}
function getToken() {
  try {
    const access = cookies.get("token");
    if (!access) {
      return null;
    }
    return { access };
  } catch (e) {
    return null;
  }
}

function getTokenDetails() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = token?.access.split(".")[1];

  if (!payload) {
    return null;
  }

  return JSON.parse(
    window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
  ) as TokenInfo;
}

function clearToken() {
  cookies.remove("token");
}

function isAuthenticated() {
  const token = getToken();
  if (!token) {
    return false;
  }
  return true;
}

function getUserDetail() {
  const token = getToken();
  if (!token) {
    return null;
  }
  const payload = token.access.split(".")[1];
  if (!payload) {
    return null;
  }
  const decoded = JSON.parse(
    window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
  );
  return { name: decoded.name, email: decoded.email };
}
const TokenService = {
  setToken,
  getToken,
  getTokenDetails,
  isAuthenticated,
  clearToken,
  getUserDetail,
};
export default TokenService;
