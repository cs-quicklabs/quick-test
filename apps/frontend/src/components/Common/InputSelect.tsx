import { FC } from "react";
interface Iprops {
  error?: string;
  touched?: boolean | string;
  disabled?: boolean;
  validation?: boolean;
  optionsForSelect?: any[];
  sendIdAsValue?: boolean;
  name?: string;
}
const InputSelect: FC<Iprops> = ({ ...props }: Iprops) => {
  const {
    name,
    touched,
    error,
    disabled,
    validation,
    optionsForSelect,
    sendIdAsValue,
    ...rest
  } = {
    ...props,
  };
  return (
    <select
      className="form-input-field"
      {...rest}
      disabled={disabled}
      id={name}
      autoComplete={name}
    >
      <option value="" disabled>
        Select
      </option>
      {optionsForSelect?.map((options) => {
        return options.id === "default" ? (
          <option key={options.id} className="hidden" disabled value="">
            {options.name}
          </option>
        ) : (
          <option
            key={options.id}
            value={sendIdAsValue === true ? options.id : options.name}
          >
            {options.name}
          </option>
        );
      })}
    </select>
  );
};

export default InputSelect;
