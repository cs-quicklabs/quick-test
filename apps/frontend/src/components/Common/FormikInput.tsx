import React, { useState } from "react";

import { useField, ErrorMessage } from "formik";

import InputCheckbox from "./InputCheckbox";
import InputDateField from "./InputDateField";
import InputField from "./InputField";
import InputSearchableSelect from "./InputSearchableSelect";
import InputSelect from "./InputSelect";
import InputTextArea from "./InputTextArea";
import InputTextAreaMarkdown from "./InputTextAreaMarkdown";

import ScaleLoader from "react-spinners/ScaleLoader";
import { useTranslation } from "react-i18next";
import { InputFieldProps } from "../Utils/interfaces/userObject";

interface IProps {
  name: string;
  showLabel?: boolean;
  type?: string;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  validation?: boolean;
  optionsForSelect?: any[];
  sendIdAsValue?: boolean;
  valueOfLabel?: string;
  isOptional?: boolean;
  dataAttr?: string;
  markdownPreview?: boolean;
  getSelectedOption?: (value: any) => void;
  emptyCached?: boolean;
  loading?: boolean;
  manageHeight?: boolean;
}

export const FormikInput = ({ showLabel = true, ...props }: IProps) => {
  const { t } = useTranslation(["common"]);
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };
  return (
    <>
      <div className="flex justify-between">
        {showLabel && (
          <label
            htmlFor={props.name}
            className="block text-sm font-medium text-gray-900"
          >
            {props.label}
          </label>
        )}
        {props.isOptional && (
          <span className="text-sm text-gray-500">{t("Optional")}</span>
        )}
      </div>
      <div className="mt-1 relative">
        <InputField
          touched={touched}
          error={error}
          {...field}
          {...props}
          validation={props.validation}
        />
      </div>
      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

export const FormikCheckbox = ({ ...props }: IProps) => {
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };

  return (
    <>
      <div className="flex items-center">
        <InputCheckbox touched={touched} error={error} {...field} {...props} />
        <label
          htmlFor={props.name}
          className="ml-2 block text-sm text-gray-900"
          dangerouslySetInnerHTML={{ __html: props.label }}
        ></label>
      </div>
      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

export const FormikTextArea = ({
  markdownPreview,
  isOptional,
  showLabel = true,
  ...props
}: IProps) => {
  const { t } = useTranslation(["common"]);
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };
  const [preview, togglePreview] = useState<boolean>(false);
  return (
    <>
      <div className="flex justify-between items-center">
        {showLabel && (
          <label
            htmlFor={props.name}
            className="flex-1 text-sm font-medium text-gray-700 space-x-3 flex items-center flex justify-between items-center"
          >
            <span>{props.label}</span>
            {markdownPreview ? (
              <button
                type="button"
                onClick={() => togglePreview((prevState) => !prevState)}
                className="inline-flex items-center px-1 py-1 text-xs font-medium rounded text-indigo-700 focus:outline-none"
              >
                {preview ? t("Editor") : t("Preview")}
              </button>
            ) : null}
          </label>
        )}
        {isOptional && (
          <span className="text-sm text-gray-500 ml-2">{t("Optional")}</span>
        )}
      </div>
      <div className="mt-1 relative">
        {markdownPreview ? (
          <InputTextAreaMarkdown
            touched={touched}
            error={error}
            showPreview={preview}
            {...field}
            {...props}
          />
        ) : (
          <InputTextArea
            touched={touched}
            error={error}
            {...field}
            {...props}
          />
        )}
      </div>

      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

export const FormikSelect = ({ showLabel = true, ...props }: IProps) => {
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };
  return (
    <>
      {showLabel && (
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {props.label}
        </label>
      )}
      <div className="mt-1 relative">
        <InputSelect touched={touched} error={error} {...field} {...props} />
      </div>

      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

export const FormikInputSearch = ({
  isOptional,
  loading,
  ...props
}: IProps) => {
  const { t } = useTranslation(["common"]);
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };
  return (
    <>
      <div className="flex justify-between">
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700 space-x-2"
        >
          <span>{props.label}</span>
          {loading ? (
            <ScaleLoader
              color="#130A88"
              loading={true}
              width={2}
              radius={2}
              margin={1}
              height={8}
            />
          ) : null}
        </label>
        {isOptional && (
          <span className="text-sm text-gray-500">{t("Optional")}</span>
        )}
      </div>
      <div className="mt-1 relative">
        <InputSearchableSelect
          touched={touched}
          error={error}
          {...field}
          {...props}
          validation={props.validation}
          valueOfLabel={props.valueOfLabel}
        />
      </div>
      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

interface FormikInputDateFieldProps {
  name: string;
  type?: string;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  validation?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const FormikInputDateField = ({
  ...props
}: FormikInputDateFieldProps) => {
  const [field, meta] = useField(props.name);
  const { touched, error } = { ...meta };
  return (
    <>
      <label
        htmlFor={props.name}
        className="block text-sm font-medium text-gray-700"
      >
        {props.label}
      </label>
      <div className="mt-1 relative">
        <InputDateField
          touched={touched}
          error={error}
          {...field}
          {...props}
          validation={props.validation}
        />
      </div>
      {props.validation && error ? (
        <span className="text-red-600 mt-2 text-sm">{error}</span>
      ) : (
        <ErrorMessage
          name={props.name}
          component="span"
          className="text-red-600 mt-2 text-sm"
        />
      )}
    </>
  );
};

export const RenderFormikInputs = (fields: Array<InputFieldProps>) => {
  return fields.map((field) => (
    <div key={field.name}>
      <FormikInput
        type={field.type}
        name={field.name}
        label={field.label}
        {...(field.validation ? { validation: field.validation } : {})}
      />
    </div>
  ));
}