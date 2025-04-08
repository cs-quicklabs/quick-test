import { useTranslation } from "react-i18next";
import bugplotLogo from "../../../assets/images/bugplot-logo.svg";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axiosService from "../../Utils/axios";
import { Currency, freeTrial } from "../../Utils/constants/misc";
import Loader from "../../Loader/Loader";

export default function CancelPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentDuration, setPaymentDuration] = useState("");

  const getAmount = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axiosService.get("payments/price", {});
      if (resp.data.data) {
        setCurrency(resp.data.data.price.currency);
        setPaymentDuration(resp.data.data.price.recurring.interval);
        const tempAmount = resp.data.data.price.unit_amount;
        const newAmount = String(tempAmount).split("", 2).join("");
        setAmount(newAmount);
      }
    } catch (err) {
      // console.error(err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAmount();
  }, [getAmount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center content-center my-32">
        <Loader withoverlay={true} />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col grow">
        <section className="pt-40 bg-gray-50 pb-20 grow">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <img
                height={32}
                width={32}
                loading="eager"
                className="mx-auto h-8"
                src={bugplotLogo}
                alt="App Logo"
              />
              <blockquote className="mt-10">
                <div className="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-gray-900">
                  <p>
                    {t("Your")} {freeTrial.TRIAL_DAYS}{" "}
                    {t(
                      " days trial period is over. Please pay further to continue our services."
                    )}
                  </p>
                </div>
                <footer className="mt-8">
                  <div className="md:flex md:items-center md:justify-center">
                    <div className="md:shrink-0"></div>
                    <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                      <Link
                        data-cy="cancel-page-button"
                        to="/settings/payments"
                        className="w-full capitalize inline-flex justify-center rounded-md border border-transparent shadow-xs px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-hidden sm:col-start-2 sm:text-sm"
                      >
                        {t("Subscribe for")} {currency === Currency.USD && "$"}
                        {amount}/{paymentDuration}
                      </Link>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
