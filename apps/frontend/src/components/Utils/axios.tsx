import axios, { InternalAxiosRequestConfig } from "axios";
import { appRoutes } from "./constants/page-routes";
import { NotifyExpired } from "./helpers";
import { showError } from "../Toaster/ToasterFun";
import i18next from "i18next";
import { ErrorMessages } from "./constants/misc";

const serverUrl: string | undefined = process.env.REACT_APP_API_URL;
const instance = axios.create({
  baseURL: serverUrl,
});
instance.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig<any>) {
    // @ts-ignore
    config.headers["Accept-Language"] =
      localStorage.getItem("i18nextLng") || "en-US";
    const accessToken =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (accessToken) {
      // https://stackoverflow.com/questions/69524573/why-config-headers-in-interceptor-is-possibly-undefined
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error) {
      handleErrorCodes(error?.response)
      return Promise.reject(error);
    }
  }
);

function handleErrorCodes(errorResponse: any) {
  switch (errorResponse?.status) {
    case 400: // Bad Request
      showError(ErrorMessages.BAD_REQUEST);
      break;

    case 401: // Unauthorized
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = appRoutes.SIGNIN_PAGE;
      showError(ErrorMessages.UNAUTHORIZED);
      break;

    case 403: // Forbidden: User does't have access rights to the content.
      NotifyExpired();
      showError(ErrorMessages.FORBIDDEN);
      break;

    case 404: // Resource Not Found:
      showError(ErrorMessages.RESOURCE_NOT_FOUND);
      break;

    case 500: // Internal Server Error
    case 502: // Bad gateway
    case 503: // Service unavailable
    case 504: // Gateway Timeout
      showError(ErrorMessages.SOMETHING_WENT_WRONG);
      break;

    default:
      showError(ErrorMessages.UNEXPECTED_ERROR);
  }
}

const axiosService = {
  get: (endPoint: string, headers = {}) => {
    const config = { params: {}, headers: {} };
    if (!endPoint) {
      throw Error("endPoint is required params");
    } else {
      config.headers = headers;
      return instance.get(endPoint, config);
    }
  },
  post: (endPoint: string, data: any, headers = {}) => {
    if (!(endPoint || !data)) {
      throw Error("endPoint and data are required params");
    }
    return instance.post(endPoint, data, { headers });
  },
  put: (endPoint: string, data: any, headers = {}) => {
    if (!(endPoint || !data)) {
      throw Error("endPoint and data are required params");
    }
    return instance.put(endPoint, data, { headers });
  },
  patch: (endPoint: string, data: any, headers = {}) => {
    if (!(endPoint || !data)) {
      throw Error("endPoint and data are required params");
    }
    return instance.patch(endPoint, data, { headers });
  },
  delete: (endPoint: string, data: any, headers = {}) => {
    if (!endPoint) {
      throw Error("endPoint is required params");
    } else {
      return instance.delete(endPoint, { data: data, headers: headers });
    }
  },
};

export default axiosService;
