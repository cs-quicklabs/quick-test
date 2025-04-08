import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Trans } from "react-i18next";

export default function WarningAlert(props: any) {
  return (
    <div className="bg-yellow-50 p-4 rounded-md">
      <div className="flex">
        <div className="shrink-0 self-center">
          <ExclamationTriangleIcon
            className="h-4 w-4 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {props?.msg}{" "}
            <button
              onClick={props?.confirmCall}
              className="font-medium outline-hidden focus:outline-hidden underline text-yellow-700 hover:text-yellow-600"
            >
              <Trans>{props?.confirmMsg}</Trans>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
