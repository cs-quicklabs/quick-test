import dayjs from "dayjs";
import { DateFormat } from "../../Utils/constants/date-format";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  appRoutes,
  projectRoutes,
  testRunRoutes,
} from "../../Utils/constants/page-routes";
import Badge from "../../Badge";

interface PropsType {
  RowData: {
    description: null | string;
    id: string;
    name: string;
    createdAt: string;
    testReport: {
      failed: number;
      passed: number;
      total: number;
      untested: number;
    };
  }[];
  endDate: any;
}

export default function Table({ RowData, endDate }: PropsType) {
  const { t } = useTranslation(["common"]);
  const params = useParams();

  return (
    <>
      <div
        className={`flex flex-col  overflow-hidden ${RowData?.length < 1 && "hidden"
          }`}
      >
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 ">
          <div className="inline-block min-w-full py-3 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden mr-2">
              <table className="min-w-full divide-y divide-gray-300">
                <tbody className="bg-white divide-y divide-gray-200">
                  {RowData?.map((value, i) => (
                    <tr key={i} className={`rounded`}>
                      <td className="whitespace-nowrap py-3 px-3 text-sm font-medium text-gray-900 sm:pl-0 w-full hover:underline cursor-pointer">
                        <Link
                          to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${value.id}/${testRunRoutes.TEST_RESULTS}`}
                          className="font-normal truncate text-gray-900 text-sm hover:underline cursor-pointer"
                        >
                          <span>{value?.name}</span>
                        </Link>
                        <Link
                          to={`${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTRUNS}/${value.id}/${testRunRoutes.TEST_RESULTS}`}
                        >
                          <p className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 font-normal">
                            <span className=" text-xs">
                              {t("Due on")}{" "}
                              {dayjs(endDate).format(DateFormat.LONG)}
                            </span>
                          </p>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        <div className="flex justify-end text-center items-center gap-2 text-xs">
                          {(value.testReport.passed / value.testReport.total) *
                            100 <
                            100 && (
                              <Badge className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                {t("In Progress")}
                              </Badge>
                            )}
                          {(value.testReport.passed / value.testReport.total) *
                            100 ===
                            100 && (
                              <Badge className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                {t("Completed")}
                              </Badge>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {RowData?.length === 0 && (
        <div className="flex justify-center items-center content-center text-gray-500 text-xs font-normal">
          {t("No active test runs in this milestone.")}
        </div>
      )}
    </>
  );
}
