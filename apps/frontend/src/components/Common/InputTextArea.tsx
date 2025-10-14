import React, { FC } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface Iprops {
  error?: string;
  touched?: boolean | string;
  validation?: boolean;
  value?: string;
  name?: string;
}

const InputField: FC<Iprops> = ({ ...props }: Iprops) => {
  const { name, touched, error, validation, value, ...rest } = { ...props };

  return (
    <>
      <TextareaAutosize
        id={name}
        value={value}
        minRows={3}
        maxRows={5}
        className={`form-input-field ${error && touched ? "border-red-300" : "border-gray-300"}`}
        {...rest}
      />
    </>
  );
};

export default InputField;
