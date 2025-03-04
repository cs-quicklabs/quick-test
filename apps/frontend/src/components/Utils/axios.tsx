import axios, { InternalAxiosRequestConfig } from "axios";
import { appRoutes } from "./constants/page-routes";
import { NotifyExpired } from "./helpers";
import { showError } from "../Toaster/ToasterFun";
import i18next from "i18next";
import { ToastMessage } from "./constants/misc";

const serverUrl: string | undefined = process.env.REACT_APP_API_URL;
const instance = axios.create({
  baseURL: serverUrl,
});
instance.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig<any>) {
    // @ts-ignore
    config.headers["Accept-Language"] =
      localStorage.getItem("i18nextLng") || "en-US";
    const accessToken = sessionStorage.getItem("token") || localStorage.getItem("token");
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
  async (errorResponse) => {
    if (errorResponse) {
      //401=unauthorised access possibly due to being archived
      if (errorResponse) {
        if (errorResponse.response.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = appRoutes.SIGNIN_PAGE;
        } else if (errorResponse.response.status === 403) {
          //403=Plan expired
          NotifyExpired();
        } else if (errorResponse.response.status === 404)
          showError(i18next.t(ToastMessage.NO_TEST_CASE_PROJECT));
      }
      return Promise.reject(errorResponse);
    }
  }
);

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
