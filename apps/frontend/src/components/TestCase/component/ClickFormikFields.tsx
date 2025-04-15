import React, { Dispatch, FC, SetStateAction, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { editTestCasesApi } from "../../../services/testCasesServices";
import { getTestCasesData } from "../../../reducers/testCaseSlice";
import {
  FormikInput,
  FormikSelect,
  FormikTextArea,
} from "../../Common/FormikInput";
import PreviewMarkdown from "../../Common/PreviewMarkdown";
import { SerialisedTestCaseType } from "../../../types/testCaseTypes";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { showError } from "../../Toaster/ToasterFun";

interface Props {
  currentEditableField: string | null;
  setCurrentEditableField: Dispatch<SetStateAction<string | null>>;
  testCase: SerialisedTestCaseType;
  fieldName: string;
  inputType: string;
}

const ClickFormikFields: FC<Props> = ({
  currentEditableField,
  setCurrentEditableField,
  testCase,
  fieldName,
  inputType,
}) => {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const { pid } = useParams();
  const dispatch = useAppDispatch();
  const { values, errors } = useFormikContext<any>();

  const titleData = {
    preconditions: "Preconditions",
    steps: "Steps",
    expectedResults: "Expected Results",
  };
  const handleClick = () => setCurrentEditableField(fieldName);

  const handleClickOutside = (event: any) => {
    if (
      panelRef.current &&
      //@ts-ignore
      !panelRef.current.contains(event.target)
    ) {
      setCurrentEditableField(null);
      if (
        currentEditableField &&
        values[currentEditableField] !==
          testCase[currentEditableField as keyof SerialisedTestCaseType]
      ) {
        editTestCasesApi(pid as string, testCase.id, values)
          .then(() => {
            dispatch(getTestCasesData(pid as string));
          })
          .catch((err) => showError(err.response.data.message));
      }
    }
  };

  useEffect(() => {
    Object.keys(errors).length !== 0 &&
      document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  useEffect(() => {
    if (
      currentEditableField &&
      inputType !== "dropDown" &&
      Object.keys(errors).length === 0
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[currentEditableField as string]]);

  // ✅ Save dropdown value on change (not relying on click outside)
  useEffect(() => {
    if (inputType === "dropDown") {
      const originalValue = testCase[fieldName as keyof SerialisedTestCaseType];
      const currentValue = values[fieldName];

      if (currentValue !== originalValue) {
        editTestCasesApi(pid as string, testCase.id, values)
          .then(() => {
            dispatch(getTestCasesData(pid as string));
          })
          .catch((err) => showError(err.response?.data?.message));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[fieldName]]);

  return (
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 whitespace-normal break-all col-span-9 cursor-pointer">
      {inputType === "dropDown" ? (
        <div className="pl-1 col-span-3" ref={panelRef}>
          <FormikSelect
            data-cy="select-priority"
            type="text"
            name="executionPriority"
            label={t("Priority")}
            sendIdAsValue={true}
            optionsForSelect={[
              { name: t("Low"), id: "LOW" },
              { name: t("Medium"), id: "MEDIUM" },
              { name: t("High"), id: "HIGH" },
              { name: t("Critical"), id: "CRITICAL" },
            ]}
            showLabel={false}
            validation
            valueOfLabel={values[fieldName]}
          />
        </div>
      ) : currentEditableField === fieldName ? (
        <div ref={panelRef}>
          {inputType === "textArea" && (
            <FormikTextArea
              placeholder={`${
                titleData[currentEditableField as keyof typeof titleData]
              } max size can be 3000`}
              type="text"
              name={fieldName}
              label=""
              markdownPreview={true}
              showLabel={false}
            />
          )}
          {inputType === "textBox" && (
            <div className="pl-1 col-span-3">
              <FormikInput
                placeholder={`${
                  titleData[currentEditableField as keyof typeof titleData]
                } max size can be 3000`}
                type="text"
                name={fieldName}
                label=""
                markdownPreview={true}
                showLabel={false}
              />
            </div>
          )}
        </div>
      ) : inputType === "textArea" ? (
        <PreviewMarkdown
          markdown={values[fieldName]}
          clickHandler={handleClick}
        />
      ) : inputType === "textBox" ? (
        <h1
          className="px-4 inline text-lg leading-6 font-bold text-gray-900 col-span-3"
          onClick={handleClick}
        >
          {values[fieldName]?.charAt(0)?.toUpperCase() +
            values[fieldName]?.slice(1)}
        </h1>
      ) : null}
    </dd>
  );
};

export default ClickFormikFields;
