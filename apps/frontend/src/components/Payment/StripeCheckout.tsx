import { useCallback, useContext, useEffect, useState } from "react";
import Button from "../Button";
import Loader from "../Loader/Loader";
import axiosService from "../Utils/axios";
import { Currency, SubscriptionStatus } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import AccessControl from "../AccessControl";
import { PaymentPermissions } from "../Utils/constants/roles-permission";
import { AppContext } from "../Context/mainContext";

export default function StripeCheckout() {
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [paymentDuration, setPaymentDuration] = useState("");
  const { state } = useContext(AppContext);

  const manageStripeRedirect = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
  };

  const getCheckoutId = useCallback(async () => {
    try {
      setApiLoading(true);
      const resp = await axiosService.post(
        "/payments/create-checkout-session",
        {}
      );
      if (resp.data.data) {
        manageStripeRedirect(resp.data.data.sessionUrl);
      }
    } catch (err) {
      // console.error(err?.message);
    } finally {
      setApiLoading(false);
    }
  }, []);

  const getManageId = useCallback(async () => {
    try {
      setApiLoading(true);
      const resp = await axiosService.post(
        "/payments/create-portal-session",
        {}
      );
      if (resp.data.data) {
        manageStripeRedirect(resp.data.data.sessionUrl);
      }
    } catch (err) {
      // console.error(err?.message);
    } finally {
      setApiLoading(false);
    }
  }, []);

  const getSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      // const subscriptionResp = await axiosService.get("/auth/me");
      const subscriptionResp = state.userDetails;
      const priceResp = await axiosService.get("payments/price", {});
      if (subscriptionResp) {
        setIsSubscribed(subscriptionResp.subscriptionStatus);
      }
      if (priceResp.data.data) {
        setCurrency(priceResp.data.data.price.currency);
        setPaymentDuration(priceResp.data.data.price.recurring.interval);
        const tempAmount = priceResp.data.data.price.unit_amount;
        const newAmount = String(tempAmount).split("", 2).join("");
        setAmount(newAmount);
      }
    } catch (err) {
      // console.error(err?.message)
    } finally {
      setLoading(false);
    }
  }, [state.userDetails]);

  useEffect(() => {
    getSubscriptionData();
  }, [getSubscriptionData]);

  return (
    <main className="pb-12 lg:col-span-9">
      <div className="flex flex-col place-content-center place-items-center">
        <div className="flex flex-col place-content-center place-items-center w-full items-start gap-y-4">
          <h1 className="w-full font-medium text-lg pb-2 border-gray-200">
            {t("Billing")}
          </h1>
          {loading ? (
            <div className="flex w-full justify-center items-center content-center my-32">
              <Loader />
            </div>
          ) : (
            <div className="">
              {isSubscribed === SubscriptionStatus.CANCELLED ||
              isSubscribed === SubscriptionStatus.FREE_TRIAL ? (
                <>
                  <p>
                    {t(
                      "You haven't selected any payment plan. To continue using the product you need to subscribe to a plan."
                    )}
                  </p>
                  <AccessControl
                    permission={PaymentPermissions.CREATE_CHECKOUT_SESSION}
                  >
                    <Button
                      data-cy="stripe-checkout-button"
                      id="stripe-checkout-button"
                      onClick={getCheckoutId}
                      className="mt-4"
                      loading={apiLoading}
                    >
                      {t("Subscribe for")} {currency === Currency.USD && "$"}
                      {amount}/{paymentDuration}
                    </Button>
                  </AccessControl>
                </>
              ) : (
                <>
                  <p>
                    {t("You have an active subscription for our plan of")}{" "}
                    {currency === Currency.USD && <span>&#36;</span>}
                    {amount}/{paymentDuration}.
                  </p>
                  <AccessControl
                    permission={PaymentPermissions.CREATE_PORTAL_SESSION}
                  >
                    <Button
                      id="stripe-manage-button"
                      data-cy="stripe-manage-button"
                      onClick={getManageId}
                      loading={apiLoading}
                      className="mt-4 inline-flex justify-center items-center capitalize px-2.5 py-1.5 border border-transparent rounded-md text-sm font-medium rounded-sm shadow-xs text-white focus:outline-hidden bg-indigo-600 hover:bg-inidgo-700"
                    >
                      {t("Manage Subscription")}
                    </Button>
                  </AccessControl>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
