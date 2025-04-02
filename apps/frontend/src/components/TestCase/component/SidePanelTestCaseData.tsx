import React, { FC, useState } from "react";
import { SerialisedTestCaseType } from "../../../types/testCaseTypes";
import { Trans, useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { DateFormat } from "../../Utils/constants/date-format";
import ClickFormikFields from "./ClickFormikFields";
import { Formik } from "formik";
import { editTestCaseSchema } from "../TestForm";

interface Props {
  testCase: SerialisedTestCaseType;
}
type InitialValuesType = {
  title: string;
  preconditions: string;
  steps: string;
  expectedResults: string;
  executionPriority: string;
  sectionId: string | undefined;
};

const SidePanelTestCaseData: FC<Props> = ({ testCase }) => {
  const { t } = useTranslation();

  const initialValues: InitialValuesType = {
    title: testCase.title,
    preconditions: testCase.preconditions,
    steps: testCase.steps,
    expectedResults: testCase.expectedResults,
    executionPriority: testCase.executionPriority,
    sectionId: testCase.sectionId,
  };

  const [currentEditableField, setCurrentEditableField] = useState<
    string | null
  >(null);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={editTestCaseSchema}
      onSubmit={() => {}}
      enableReinitialize
    >
      <div className="p-4 ">
        <div className="grid grid-cols-10">
          <span className="col-span-1 max-w-fit max-h-[36px] px-2.5 py-0.5 rounded-md text-lg font-medium bg-indigo-100 text-indigo-800">
            {`#${testCase.serialNumber}`}
          </span>
          <ClickFormikFields
            currentEditableField={currentEditableField}
            setCurrentEditableField={setCurrentEditableField}
            testCase={testCase}
            fieldName="title"
            inputType="textBox"
          />
        </div>
        <div className="w-full p-4">
          <div className="border">
            <dl>
              <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                <h1 className="text-sm font-medium text-gray-900">
                  {t("Preconditions")}
                </h1>
                <ClickFormikFields
                  currentEditableField={currentEditableField}
                  setCurrentEditableField={setCurrentEditableField}
                  testCase={testCase}
                  fieldName="preconditions"
                  inputType="textArea"
                />
              </div>
              <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                <h1 className="text-sm font-medium text-gray-900">
                  {t("Steps")}
                </h1>
                <ClickFormikFields
                  currentEditableField={currentEditableField}
                  setCurrentEditableField={setCurrentEditableField}
                  testCase={testCase}
                  fieldName="steps"
                  inputType="textArea"
                />
              </div>
              <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                <h1 className="text-sm font-medium text-gray-900">
                  {t("Expected Results")}
                </h1>
                <ClickFormikFields
                  currentEditableField={currentEditableField}
                  setCurrentEditableField={setCurrentEditableField}
                  testCase={testCase}
                  fieldName="expectedResults"
                  inputType="textArea"
                />
              </div>
            </dl>
          </div>
          <div className="border-t mt-4 p-2">
            <h1 className="text-lg font-semibold text-gray-700 mb-4">
              {t("Test Case Details")}
            </h1>
            <div className="grid grid-cols-2">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Created on")}
                </span>
                <span className="block text-sm text-gray-500 mb-4">
                  {dayjs(testCase.createdAt).format(DateFormat.LONG)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Created By")}
                </span>
                <span className="block text-sm text-gray-500 mb-4">
                  <Trans>
                    {testCase.createdBy
                      ? `${testCase.createdBy.firstName}  ${testCase.createdBy.lastName}`
                      : "-"}
                  </Trans>
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 ">
                  {t("Priority")}
                </span>

                <ClickFormikFields
                  currentEditableField={currentEditableField}
                  setCurrentEditableField={setCurrentEditableField}
                  testCase={testCase}
                  fieldName="executionPriority"
                  inputType="dropDown"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {t("Updated on")}
                </span>
                <span className="block text-sm text-gray-500 mb-4">
                  {dayjs(testCase.updatedAt).format(DateFormat.LONG)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Formik>
  );
};

export default SidePanelTestCaseData;
