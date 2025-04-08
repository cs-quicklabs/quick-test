import { XCircleIcon } from "@heroicons/react/24/solid";
import { Trans } from "react-i18next";

export default function ErrorAlert(props: any) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="shrink-0 self-center">
          <XCircleIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">
            {props?.msg}{" "}
            <button
              onClick={props?.confirmCall}
              className="font-medium outline-hidden focus:outline-hidden underline text-red-700 hover:text-red-600"
            >
              <Trans>{props?.confirmMsg}</Trans>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
