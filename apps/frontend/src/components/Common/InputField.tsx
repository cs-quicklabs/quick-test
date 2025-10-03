import { FC } from "react";
interface Iprops {
  error?: string;
  touched?: boolean | string;
  disabled?: boolean;
  validation?: boolean;
  type?: string;
  name?: string;
  placeholder?: string;
}

const InputField: FC<Iprops> = ({ ...props }: Iprops) => {
  const { name, touched, error, disabled, validation, type, placeholder, ...rest } = {
    ...props,
  };
  return (
    <>
      <input
        id={name}
        className="form-input-field"
        {...rest}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={type === "password" ? "new-password" : "on"}
      />
    </>
  );
};

export default InputField;
