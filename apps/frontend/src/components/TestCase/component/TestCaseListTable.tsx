import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// @ts-ignore
import ReactDragListView from "react-drag-listview/lib";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import axiosService from "../../Utils/axios";
import {
  appRoutes,
  projectRoutes,
  testCaseRoutes,
} from "../../Utils/constants/page-routes";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import ShowPriorityTextIcon from "./ShowPriorityTextIcon";
import { SerialisedTestCaseType } from "../../../types/testCaseTypes";

export default function TestCaseListTable({
  testcases,
  openDeleteModal,
  sectionId,
  SectionName,
  showDragIcon,
  selectedData,
  dataAttr,
  selectedTestCase,
  setSelectedTestCase,
}: any) {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const params = useParams();

  const [orderTestCases, setOrderTestCases] = useState([...testcases]);
  const [checked, setChecked] = useState<boolean>(false);
  const targetRef = useRef(null);

  useEffect(() => {
    setOrderTestCases(
      testcases?.map((val: any) => ({
        ...val,
        checked: false,
        SectionName,
      }))
    );
  }, [SectionName, testcases]);

  const editTestCase = (id: string) => {
    navigate(
      `${appRoutes.PROJECTS}/${params.pid}/${projectRoutes.TESTCASES}/${id}/${testCaseRoutes.EDIT_TESTCASE}`
    );
  };

  const rearrangeLocally = (data: {
    newPosition: number;
    testCaseId: string;
  }) => {
    const firstSerialNumber = orderTestCases[0].serialNumber;
    let testCaseIndex = -1;
    testCaseIndex = orderTestCases.findIndex((e) => e.id === data.testCaseId);
    if (testCaseIndex > -1) {
      const draggedTestCase = orderTestCases.splice(testCaseIndex, 1);
      orderTestCases.splice(data.newPosition - 1, 0, draggedTestCase[0]);
      const newOrderTestCase = orderTestCases.map((e, i) => ({
        ...e,
        serialNumber: firstSerialNumber + i,
      }));
      setOrderTestCases(newOrderTestCase);
    }
  };

  const reorderTestcase = async (obj: any, newPosition: number) => {
    const data = {
      testCaseId: obj?.id,
      newPosition: newPosition + 1,
    };
    try {
      await axiosService.post(
        `/projects/${params.pid}/sections/${sectionId}/re-order`,
        data
      );
      await rearrangeLocally(data);
    } catch (err) {
      console.error(err);
    }
  };

  const dragProps = {
    onDragEnd(fromIndex: any, toIndex: any) {
      const data = [...orderTestCases];
      const item = data.splice(fromIndex, 1)[0];
      data.splice(toIndex, 0, item);
      setOrderTestCases(data);
      reorderTestcase(item, toIndex);
    },

    nodeSelector: "tr",
    handleSelector: "a",
  };

  const titleClickHandler = (testcase: SerialisedTestCaseType) => {
    selectedTestCase && selectedTestCase.id === testcase.id
      ? setSelectedTestCase(null)
      : setSelectedTestCase({ ...testcase, sectionId: sectionId });
  };

  // To export testCases data in excel
  useEffect(() => {
    let result: any[] = [];
    for (const x of orderTestCases) {
      if (x.checked) result = [...result, x];
    }
    selectedData([...result], SectionName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SectionName, orderTestCases]);

  return (
    <ReactDragListView {...dragProps}>
      <table className="min-w-full divide-y border-t divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="pb-1 flex mr-auto text-center py-3 pr-2 whitespace-nowrap text-xs font-medium text-gray-900">
              <div className="mx-auto flex ">
                {showDragIcon && <div className="h-4 w-4 mb-2 mr-2"></div>}

                <input
                  className={`h-4 w-4 checkbox1 text-indigo-600  border-gray-300 rounded focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0`}
                  type="checkbox"
                  defaultChecked={checked}
                  ref={targetRef}
                  onChange={(e) => {
                    setOrderTestCases(
                      orderTestCases.map((val) => ({
                        ...val,
                        checked: e.target.checked,
                      }))
                    );
                    setChecked(!checked);
                  }}
                />
              </div>
            </th>
            <th
              scope="col"
              className="text-left text-sm font-semibold text-gray-900 w-1/12"
            >
              {t("Sr. No.")}
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-8/12"
            >
              {t("Title")}
            </th>
            <th
              scope="col"
              className="text-left text-sm font-semibold text-gray-900 w-1/12"
            >
              {t("Priority")}
            </th>
            <th
              scope="col"
              className="border-b border-gray-200 bg-gray-50 px-8 py-2 text-center text-sm font-semibold text-gray-900"
              id="action-header"
            >
              {t("Action")}
            </th>
          </tr>
        </thead>
        <tbody
          data-cy={dataAttr + "body"}
          className="bg-white divide-y divide-gray-200"
        >
          {orderTestCases?.map((test: SerialisedTestCaseType, i) => (
            <tr key={i} data-cy={dataAttr + i} className="bg-white rounded">
              <td className="py-2 whitespace-nowrap text-xs font-normal pr-2">
                <div className="flex justify-center">
                  {showDragIcon && (
                    <Link to={"#"} title="Drag" className="drag mr-2">
                      <EllipsisVerticalIcon
                        data-tooltip-id="testcase-list-table-tooltip-id"
                        data-tooltip-content={t("Drag")}
                        className="text-gray-900 mx-auto h-4 w-4 cursor-move dragIcon"
                      />
                      <PlusIcon className="text-indigo-600 h-4 w-4 cursor-move plusIcon hidden" />
                    </Link>
                  )}
                  <input
                    data-cy={dataAttr + i + "-check"}
                    className={`h-4 w-4 text-indigo-600 focus:outline-none border-gray-300 rounded focus:ring-0 focus:ring-transparent focus:ring-offset-0`}
                    type="checkbox"
                    checked={!!test.checked}
                    onChange={(e) =>
                      setOrderTestCases(
                        orderTestCases.map((val) =>
                          val.id === test.id
                            ? {
                              ...val,
                              checked: e.target.checked,
                            }
                            : { ...val }
                        )
                      )
                    }
                  />
                </div>
              </td>
              <td className="py-2 whitespace-nowrap text-xs font-normal">
                <span
                  className="hover:cursor-pointer hover:underline"
                  onClick={() => titleClickHandler(test)}
                >
                  {test.serialNumber}
                </span>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs">
                <span
                  className=" hover:underline cursor-pointer font-normal text-gray-900 text-sm"
                  style={{
                    display: "block",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}
                  onClick={() => titleClickHandler(test)}
                >
                  {test.title}
                </span>
              </td>

              <td>
                <ShowPriorityTextIcon value={test.executionPriority} />
              </td>
              <td
                id="action-value"
                className=" px-2 py-2 whitespace-nowrap text-center text-xs font-normal"
              >
                <div className="flex justify-center">
                  <PencilSquareIcon
                    data-tooltip-id="testcase-list-table-tooltip-id"
                    data-tooltip-content={t("Edit")}
                    data-cy={dataAttr + i + "-edit"}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      editTestCase(test.id);
                    }}
                    className="text-indigo-500 h-4 w-4 cursor-pointer mr-2"
                  />
                  <TrashIcon
                    data-tooltip-id="testcase-list-table-tooltip-id"
                    data-tooltip-content={t("Delete")}
                    data-cy={dataAttr + i + "-delete"}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      openDeleteModal(test);
                    }}
                    className="text-red-400 h-4 w-4 cursor-pointer"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Tooltip id="testcase-list-table-tooltip-id" />
    </ReactDragListView>
  );
}
