import { showError, showAlert } from "../Toaster/ToasterFun";
import { useNavigate } from "react-router-dom";
import { appRoutes, settingsRoutes } from "./constants/page-routes";
import { ToastMessage } from "./constants/misc";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/ar";
import i18next from "i18next";
import { RoleType } from "./constants/roles-permission";

export const getRole = async () => {
  const role = localStorage.getItem("role");
  if (!role) {
    try {
      const response = JSON.parse(localStorage.getItem("role") || "");
      return response === RoleType.OWNER;
    } catch (error) {
      showError(i18next.t(ToastMessage.SOMETHING_WENT_WRONG));
      return false;
    }
  } else {
    return role === RoleType.OWNER;
  }
};

export const RedirectNonOwners = async () => {
  const navigate = useNavigate();
  const isAdmin = await getRole();
  if (!isAdmin) {
    return navigate(`${appRoutes.SETTINGS}/${settingsRoutes.USERS}`);
  } else return;
};

export const NotifyExpired = async () => {
  const returnNotification = async () => {
    const isAdmin = await getRole();

    if (isAdmin) {
      return showAlert(
        i18next.t("Your plan has been expired!"),
        i18next.t("Please upgrade your plan"),
        `${appRoutes.SETTINGS}/${settingsRoutes.USERS}`
      );
    } else {
      return showError(i18next.t(ToastMessage.CONTACT_ADMINISTRATOR));
    }
  };

  returnNotification();
};

export const downloadFile = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.click();
}