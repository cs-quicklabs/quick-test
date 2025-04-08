import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Trans } from "react-i18next";

export default function InfoAlert(props: any) {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="shrink-0 self-center">
          <InformationCircleIcon
            className="h-4 w-4 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">
            <Trans>{props?.msg}</Trans>
          </p>
        </div>
      </div>
    </div>
  );
}
