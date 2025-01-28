import { useFormikContext } from "formik";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const InputSearchableSelect = ({ ...props }) => {
  const {
    valueOfLabel,
    touched,
    error,
    disabled,
    validation,
    optionsForSelect,
    dataAttr,
    getSelectedOption,
    emptyCached,
    ...rest
  } = {
    ...props,
  };

  const { t } = useTranslation(["common"]);
  const { name } = rest;
  const formik = useFormikContext();
  const { setFieldValue, setFieldTouched } = formik;

  const [showDropdown, setShowDropdown] = useState(false);
  const [value, setValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    if (valueOfLabel) {
      setValue(valueOfLabel);
    }
  }, [valueOfLabel]);

  useEffect(() => {
    setFilteredOptions(optionsForSelect);
  }, [optionsForSelect]);

  useEffect(() => {
    if (emptyCached) {
      setValue("");
      setFieldValue(name, "");
    }
  }, [emptyCached, name, setFieldValue]);

  const handleChange = (e) => {
    const input = e.target.value.toLowerCase();
    const newOptions = optionsForSelect.filter((option) =>
      option.label.toLowerCase().includes(input)
    );
    setFilteredOptions(newOptions);
    setValue(e.target.value);
    setFieldTouched(name, false);
    setFieldValue(name, "");
  };

  const handleClick = (option) => {
    setValue(option.label);
    setFieldValue(name, option.value);
    if (typeof getSelectedOption === "function") {
      getSelectedOption(option);
    }
  };

  const handleBlur = () => {
    if (showDropdown) {
      setFieldTouched(name);
      setShowDropdown(false);
    }
  };

  return (
    <>
      <input
        id={rest.name}
        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none  focus:border-indigo-500 sm:text-sm pr-10 border-gray-300 cursor-default ${
          (error && touched) || (validation && error)
            ? " border-red-300"
            : " border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
        {...rest}
        disabled={disabled}
        value={value}
        onChange={(e) => handleChange(e)}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showDropdown && (
        <div
          data-cy={dataAttr + "-dropdown"}
          className={`absolute w-full bg-white z-10 border rounded-b-md border-gray-400 shadow-xl sm:text-sm ${
            filteredOptions.length > 5 ? `overflow-y-scroll h-36` : "h-auto"
          }`}
        >
          {filteredOptions.length === 0 ? (
            <div className="select-none py-1 px-3 h-auto">
              {t("No matches")}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                data-cy={dataAttr + "-" + index}
                key={option.value?.value || option.value}
                className="cursor-pointer hover:bg-blue-500 hover:text-white select-none px-3 py-1"
                onMouseDown={() => handleClick(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 fill-current text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </>
  );
};

export default InputSearchableSelect;
