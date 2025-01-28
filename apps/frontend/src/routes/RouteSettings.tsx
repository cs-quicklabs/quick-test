import { Navigate } from "react-router-dom";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../components/Context/mainContext";
import UserHeader from "../components/Header/UserHeader";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader/Loader";
import CancelPage from "../components/Payment/components/CancelPage";
import { SubscriptionStatus } from "../components/Utils/constants/misc";
import SessionExpiredPopup from "../components/SignUp/SessionExpiredPopup";
import axiosService from "../components/Utils/axios";
interface PrivateRouteProps {
  children: React.ReactNode;
  permission?: string;
}

const validRoutes = [
  "/success",
  "/cancel",
  "/settings/payments",
  "/not-subscribe",
];

export function PrivateRoute({ children, permission }: PrivateRouteProps) {
  const [isSubscribed, setIsSubscribed] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(AppContext);
  const { hasLoggedIn } = state;
  const location = useLocation();
  const checkSessionExpired = localStorage.getItem("allowedPermissions");
  const checkIfLogin = useRef(true);

  const cachedPermissions = useMemo(
    () => localStorage.getItem("allowedPermissions"),
    []
  );

  const getSubscriptionStatus = useCallback(() => {
    try {
      const resp = state.userDetails;
      setIsSubscribed(resp.subscriptionStatus);
    } catch (err) {
      // console.error(err?.message)
    }
  }, [state.userDetails]);

  useEffect(() => {
    getSubscriptionStatus();
  }, [getSubscriptionStatus]);

  const checkPathname = useCallback(
    (url: string = location.pathname) => {
      const isPathValid = validRoutes.includes(url);
      setIsValid(isPathValid);
      return isValid;
    },
    [location.pathname, isValid]
  );

  const updateUserData = useCallback(async () => {
    dispatch({ type: "UPDATE_LOADING_STATE", data: true });
    const resp = await axiosService.get("/auth/me");
    if (resp.data.data) {
      dispatch({ type: "UPDATE_PROFILE_DATA", data: resp.data.data.user });
    }
  }, [dispatch]);

  useLayoutEffect(() => {
    if (checkIfLogin.current) {
      checkIfLogin.current = false;
      updateUserData();
      return;
    }
  });

  useEffect(() => {
    checkPathname();
    setLoading(false);
  }, [checkPathname]);

  let allowedPermission = [];
  if (typeof cachedPermissions === "string") {
    allowedPermission = JSON.parse(cachedPermissions);
  }

  const isPermitted = permission
    ? allowedPermission.includes(permission)
    : true;

  const isAuthenticated = useCallback(() => {
    return localStorage.getItem("token") || hasLoggedIn;
  }, [hasLoggedIn]);

  const auth = useMemo(() => isAuthenticated(), [isAuthenticated]);

  if (!checkSessionExpired) {
    return <SessionExpiredPopup />;
  }

  if (!loading) {
    if (auth && isPermitted) {
      if (isSubscribed === SubscriptionStatus.CANCELLED) {
        if (isValid || validRoutes.includes(location.pathname)) {
          return (
            <>
              <UserHeader />
              {children}
            </>
          );
        } else if (location.pathname === "/not-susbscribe") {
          return (
            <>
              <UserHeader />
              <CancelPage />
            </>
          );
        } else {
          return <Navigate to="/not-subscribe" />;
        }
      } else {
        return (
          <>
            <UserHeader />
            {children}
          </>
        );
      }
    } else {
      return <Navigate to="/signin" />;
    }
  } else {
    return (
      <div className="flex justify-center items-center content-center my-32">
        <Loader withoverlay={true} />
      </div>
    );
  }
}

export function PublicRoute({ children }: any) {
  const { state } = useContext(AppContext);
  const { hasLoggedIn } = state;

  const isAuthenticated = useCallback(() => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("token") ||
      hasLoggedIn
    );
  }, [hasLoggedIn]);

  const auth = useMemo(() => isAuthenticated(), [isAuthenticated]);
  return !auth ? children : <Navigate to="/dashboard" />;
}
