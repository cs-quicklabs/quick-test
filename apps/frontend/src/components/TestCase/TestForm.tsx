import { FormikHelpers, Form, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

import {
  FormikInput,
  FormikSelect,
  FormikTextArea,
} from "../Common/FormikInput";
import { useParams } from "react-router-dom";
import { useFormSubmitWithLoading } from "../Utils/hooks/useFormSubmitWithLoading";
import { FormSubmitPanel } from "./component/FormSubmitPanel";
import { ValidatorMessage } from "../Utils/constants/misc";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export const editTestCaseSchema = Yup.object().shape({
  title: Yup.string().trim().required(t(ValidatorMessage.TITLE_REQ)),
  preconditions: Yup.string()
    .trim().max(3000, 'Preconditions max size can be 3000')
    .required(t(ValidatorMessage.PRECONDITIONS_REQ)),
  steps: Yup.string().trim().required(t(ValidatorMessage.STEPS_REQ)),
  expectedResults: Yup.string()
    .trim()
    .required(t(ValidatorMessage.EXPECTED_RESULT_REQ)),
  sectionId: Yup.string().required('Section is required')
});

interface InitVal {
  title: string | string[] | undefined;
  expectedResults: string | string[] | undefined;
  preconditions: string | string[] | undefined;
  steps: string | string[] | undefined;
  executionPriority: string | string[] | undefined;
  sectionId: string | string[] | undefined;
}

export type TestFormProps = {
  onSubmit: (values: InitVal, formikHelpers?: FormikHelpers<InitVal>) => void;
  onCancel: () => void;
  initialValues: InitVal;
  heading?: string;
  subheading?: string;
  optionsForSelect?: any[];
  EditMany?: boolean;
  onSubmitNext?: boolean;
};

const TestForm = ({
  onCancel,
  onSubmit,
  initialValues,
  heading,
  subheading,
  optionsForSelect,
  EditMany,
  onSubmitNext,
}: TestFormProps) => {
  const { t } = useTranslation(["common"]);
  const params = useParams();
  const { onSubmitHandler, loading } = useFormSubmitWithLoading(onSubmit);
  const [validation, setValidation] = useState(false);
  return (
    <div className="mt-4">
      <div className="mx-8">
        <div className="mb-2 ">
          <p className="text-lg leading-6 font-medium text-gray-900">
            {heading}
          </p>
          <p className="text-sm text-gray-500">{subheading}</p>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={EditMany ? null : editTestCaseSchema}
          onSubmit={onSubmitHandler}
          enableReinitialize
        >
          {(formik) => {
            const { dirty } = formik;
            return (
              <Form className="space-y-2" noValidate autoComplete="off">
                <div className="flex gap-4">
                  {!EditMany && (
                    <div className="flex-auto w-2/4">
                      <FormikInput
                        type="text"
                        name="title"
                        label={t("Title")}
                        validation={validation}
                      />
                    </div>
                  )}
                  <div className="flex-auto w-1/4">
                    <FormikSelect
                      data-cy="select-section"
                      type="text"
                      name="sectionId"
                      label={t("Section")}
                      validation={validation}
                      sendIdAsValue={true}
                      optionsForSelect={
                        EditMany && optionsForSelect
                          ? [
                            { name: t("Not selected"), id: "" },
                            ...optionsForSelect,
                          ]
                          : optionsForSelect
                      }
                    />
                  </div>
                  <div className="flex-auto w-1/4">
                    <FormikSelect
                      data-cy="select-priority"
                      type="text"
                      name="executionPriority"
                      label={t("Priority")}
                      validation={validation}
                      sendIdAsValue={true}
                      optionsForSelect={
                        EditMany
                          ? [
                            { name: t("Not selected"), id: "" },
                            { name: t("Low"), id: "LOW" },
                            { name: t("Medium"), id: "MEDIUM" },
                            { name: t("High"), id: "HIGH" },
                            { name: t("Critical"), id: "CRITICAL" },
                          ]
                          : [
                            { name: t("Low"), id: "LOW" },
                            { name: t("Medium"), id: "MEDIUM" },
                            { name: t("High"), id: "HIGH" },
                            { name: t("Critical"), id: "CRITICAL" },
                          ]
                      }
                    />
                  </div>
                </div>
                <div>
                  <FormikTextArea
                    placeholder="Preconditions max size can be 3000"
                    type="text"
                    name="preconditions"
                    label={t("Preconditions")}
                    validation={validation}
                    markdownPreview={true}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <FormikTextArea
                      type="text"
                      name="steps"
                      label={t("Steps")}
                      validation={validation}
                      markdownPreview={true}
                      manageHeight={true}
                    />
                  </div>
                  <div className="flex-1 h">
                    <FormikTextArea
                      type="text"
                      name="expectedResults"
                      label={t("Expected Result")}
                      validation={validation}
                      markdownPreview={true}
                      manageHeight={true}
                    />
                  </div>
                </div>
                {!onSubmitNext ? (
                  <FormSubmitPanel
                    idForSubmit="test-case-create-edit"
                    validateFunc={() => setValidation(true)}
                    onCancel={onCancel}
                    loading={loading}
                    dataAttr="edit-test-case"
                    validSubmit={
                      EditMany ? false : params?.id && !dirty ? true : false
                    }
                    submitTitle={
                      EditMany
                        ? t("Edit Test Cases")
                        : params.id
                          ? t("Edit Test Case")
                          : t("Add & Next")
                    }
                  />
                ) : (
                  <div className="flex flex-row  gap-4 justify-end">
                    <FormSubmitPanel
                      onClick={() => {
                        // @ts-ignore
                        delete formik.values["next"];
                        formik.submitForm();
                      }}
                      type="button"
                      idForSubmit="test-case-create-edit-1"
                      validateFunc={() => setValidation(true)}
                      onCancel={onCancel}
                      loading={loading}
                      dataAttr="add-test-case"
                      validSubmit={
                        EditMany ? false : params?.id && !dirty ? true : false
                      }
                      submitTitle={
                        EditMany
                          ? t("Edit Test Cases")
                          : params.id
                            ? t("Edit Test Case")
                            : t("Add Test Case")
                      }
                    />
                    <FormSubmitPanel
                      onClick={() => {
                        // @ts-ignore
                        formik.values.next = true;
                        // @ts-ignore
                        formik.values.callBack = setValidation(false);
                        formik.submitForm();
                      }}
                      type="button"
                      idForSubmit="test-case-create-edit-2"
                      validateFunc={() => setValidation(true)}
                      loading={loading}
                      dataAttr="add-multiple-test-case"
                      validSubmit={
                        EditMany ? false : params?.id && !dirty ? true : false
                      }
                      submitTitle={
                        EditMany
                          ? t("Edit Test Cases")
                          : params.id
                            ? t("Edit Test Case")
                            : t("Add & Next")
                      }
                    />
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
export default TestForm;
