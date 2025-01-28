import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import Badge from "../../Badge";
import { DateFormat } from "../../Utils/constants/date-format";
import AccessControl from "../../AccessControl";
import { JSX, useState } from "react";
import { ProjectPermissions } from "../../Utils/constants/roles-permission";
import Button from "../../Button";
interface PropsData {
  title?: string | JSX.Element;
  redirectToPage?: { url: string; text: string };
  redirectToBack?: string;
  description?: string | JSX.Element;
  status?: string;
  ShowCSV?: {
    tooltip: string;
    fileName: string;
    headers: { label: string; key: string }[];
    data: any[];
    errorMessage: string;
    ColorEnable?: boolean;
  };
  ShowEdit?: {
    HandleClick: () => any;
    tooltip: string;
    ColorEnable?: boolean;
  };
  ShowDelete?: {
    HandleClick: () => any;
    tooltip: string;
    ColorEnable?: boolean;
    dataAttr?: string;
  };
  text?: string;
  dataAttr?: string;
  ShowPrinter?: {
    HandleClick: () => any;
    tooltip: string;
    ColorEnable?: boolean;
  };
  backtoList?: any;
  seTestCaseNum?: any;
  setPrinterIcon?: any;
}

export default function TestCaseHeading({
  title,
  description,
  status,
  redirectToPage,
  redirectToBack,
  ShowCSV,
  text,
  dataAttr,
  backtoList,
  seTestCaseNum,
  setPrinterIcon, // page,
}: PropsData) {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();

  const [buttonLoader, setButtonLoader] = useState({
    backButton: false,
    redirectButton: false,
  });

  let newCSVData: any[];

  if (ShowCSV && ShowCSV.data) {
    newCSVData = ShowCSV?.data;
    newCSVData?.forEach((item: any) => {
      item.createdAt = dayjs(item?.createdAt).format(DateFormat.LONG);
      item.executionPriority =
        item?.executionPriority?.slice(0, 1) +
        item?.executionPriority?.slice(1).toLowerCase();
    });
  } else {
    newCSVData = [];
  }

  return (
    <>
      <div className="py-4 mx-8 sm:flex sm:items-start sm:justify-between bg-gray-50 2xl:mx-52">
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="flex-1 text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {text && (
            <div className="text-sm text-gray-500 truncate mt-1">{text}</div>
          )}
          {description && (
            <div className="mt-1 truncate text-sm text-gray-500">
              {description}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-0 sm:mt-0 sm:ml-4">
          {status && (
            <>
              {status?.toLowerCase() === "pending" && (
                <Badge className="bg-gray-100 text-gray-800 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-600/20">
                  {t(status)}
                </Badge>
              )}
              {status?.toLowerCase() === "in progress" && (
                <Badge className="bg-yellow-100 text-yellow-800 text-sm">
                  {t(status)}
                </Badge>
              )}
              {status?.toLowerCase() === "completed" && (
                <Badge className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {t(status)}
                </Badge>
              )}
            </>
          )}
          {redirectToPage && (
            <div className="pl-1">
              {redirectToPage?.text === t("New Project") ? (
                <AccessControl permission={ProjectPermissions.CREATE_PROJECT}>
                  <Button
                    id={redirectToPage?.text}
                    loading={buttonLoader.redirectButton}
                    type="button"
                    data-cy={dataAttr}
                    onClick={() => {
                      setButtonLoader({
                        ...buttonLoader,
                        redirectButton: true,
                      });
                      navigate(redirectToPage.url);
                    }}
                    className="sm:order-1 "
                  >
                    {redirectToPage?.text}
                  </Button>
                </AccessControl>
              ) : (
                <Button
                  id={redirectToPage?.text}
                  loading={buttonLoader.redirectButton}
                  type="button"
                  data-cy={dataAttr}
                  onClick={() => {
                    setButtonLoader({
                      ...buttonLoader,
                      redirectButton: true,
                    });
                    navigate(redirectToPage.url);
                  }}
                  className="sm:order-1 "
                >
                  {redirectToPage?.text}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
