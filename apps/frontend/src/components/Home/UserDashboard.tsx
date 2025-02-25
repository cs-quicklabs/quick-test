import { useCallback, useContext, useState } from "react";
import ProjectHeading from "../ProjectDetails/component/Header";
import ProjectListing from "../Project/ProjectListing";
import axiosService from "../Utils/axios";
import { useEffect } from "react";
import { appRoutes } from "../Utils/constants/page-routes";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import FreeTrialPopup from "../Payment/components/FreeTrialPopup";
import Loader from "../Loader/Loader";
import { freeTrial, SubscriptionStatus } from "../Utils/constants/misc";
import dayjs from "dayjs";
import { RoleType } from "../Utils/constants/roles-permission";
import { AppContext } from "../Context/mainContext";
import { showError } from "../Toaster/ToasterFun";

export default function UserDashboard() {
  const { t } = useTranslation(["common"]);
  const [isSubscribed, setIsSubscribed] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [ifOwner, setIfOwner] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDuration, setPaymentDuration] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [currency, setCurrency] = useState("");
  const { state } = useContext(AppContext);

  const fetchPluginConfig = async () => {
    try {
      const { data } = await axiosService.get("/plugins/config");
      localStorage.setItem("isJiraIntegrated", data?.data?.isIntegrated ?? '');
    } catch (error) {
      localStorage.setItem("isJiraIntegrated", "");
    }
  };

  const freeTrialDays = useCallback(() => {
    try {
      setLoading(true);
      const response = state.userDetails;
      if (response) {
        const freeTrialStartDate = dayjs(response.freeTrialStartDate);
        const currentDate = dayjs();
        const differenceDate = Math.floor(
          currentDate.diff(freeTrialStartDate, "day", true)
        );
        setDaysLeft(freeTrial.TRIAL_DAYS - differenceDate);
        setIsSubscribed(response.subscriptionStatus);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showError(error?.message);
    }
  }, [state.userDetails]);

  const paymentAmount = useCallback(async () => {
    try {
      setLoading(true);
      setApiLoading(true);
      const resp = await axiosService.get("payments/price", {});
      const price = resp?.data?.data?.price;
      if (price) {
        setCurrency(price?.currency);
        setPaymentDuration(price?.recurring.interval);
        setAmount(String(price?.unit_amount).split("", 2).join(""));
        setApiLoading(false);
        setLoading(false);
      }
    } catch (err) {
      setApiLoading(false);
      setLoading(false);
      showError(err?.message);
    }
  }, []);

  useEffect(() => {
    let firstLogin = JSON.parse(localStorage.getItem("firstLogin") || "false");
    if (firstLogin) {
      localStorage.setItem("firstLogin", JSON.stringify(false));
    }
    setIsFirstLogin(firstLogin);
    setIfOwner(localStorage.getItem("role") === RoleType.OWNER);
  }, []);

  useEffect(() => {
    paymentAmount();
  }, [paymentAmount]);

  useEffect(() => {
    fetchPluginConfig();
  }, []);

  useEffect(() => {
    freeTrialDays();
  }, [freeTrialDays]);

  if (isSubscribed === "" && loading) {
    return (
      <div className="flex justify-center items-center content-center my-32">
        <Loader withoverlay={true} />
      </div>
    );
  } else {
    return (
      <>
        {isSubscribed === SubscriptionStatus.FREE_TRIAL &&
          isFirstLogin &&
          ifOwner && (
            <>
              <FreeTrialPopup
                daysLeft={daysLeft}
                paymentDuration={paymentDuration}
                currency={currency}
                amount={amount}
                apiLoading={apiLoading}
              />
            </>
          )}
        <ProjectHeading
          title={t("Dashboard")}
          redirectToPage={{
            url: appRoutes.CREATE_PROJECT,
            text: i18next.t("New Project"),
          }}
          dataAttr="new-project"
        />
        <ProjectListing />
      </>
    );
  }
}
