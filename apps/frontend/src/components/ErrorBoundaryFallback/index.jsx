import { useTranslation } from "react-i18next";
import bugplotLogo from '../../assets/images/bugplot-logo.svg';

export default function Example() {
  const { t } = useTranslation();
  return (
    <div>
      <section className="pt-40 bg-gray-50 pb-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <img
              height={32}
              width={32}
              loading="eager"
              title="Alt Logo"
              className="mx-auto h-8"
              src={bugplotLogo}
              alt="QuickTest Logo"
            />
            <blockquote className="mt-10">
              <div className="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-gray-900">
                <p>{t("Something went wrong.")}</p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0"></div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <button
                      className="text-base font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      onClick={() => window.location.reload()}
                    >
                      {t("Try Again")}
                    </button>
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

export const myFallback = <Example />;
