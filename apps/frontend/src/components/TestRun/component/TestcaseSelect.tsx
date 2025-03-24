import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SelectionModal from "./SelectionModal";

const TestcaseSelect = ({
  state,
  setState,
  totalTestcases,
  setTotalTestcases,
}: any) => {
  const { t } = useTranslation();
  const [showSpecific, setShowSpecific] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (state === "includeSpecific") {
      setShowSpecific(true);
    } else {
      setShowSpecific(false);
    }
  }, [state]);
  return (
    <div className="space-y-6">
      <hr></hr>
      <div>
        <input
          className="h-4 w-4 text-indigo-600 ring-0 border-gray-300 focus:ring-0 focus:ring-transparent focus:ring-offset-0"
          type="radio"
          id="includeAll"
          value="includeAll"
          checked={state === "includeAll"}
          name="includeTestcases"
          onChange={(e) => setState(e.target.value)}
        />
        <label
          htmlFor="includeAll"
          className="ml-2 text-sm text-gray-700 font-medium"
        >
          {t("Include all test cases")}
          <p className="ml-6 mt-2 text-sm font-normal">
            {t(
              "Select this option to include all test cases in this test run. If new test cases are added to the repository, they are also automatically included in this run."
            )}
          </p>
        </label>
      </div>
      <div>
        <input
          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-0 focus:ring-transparent focus:ring-offset-0"
          type="radio"
          id="includeSpecific"
          value="includeSpecific"
          checked={state === "includeSpecific"}
          name="includeTestcases"
          onChange={(e) => setState(e.target.value)}
        />
        <label
          htmlFor="includeSpecific"
          className="ml-2 text-sm text-gray-700 font-medium"
        >
          {t("Select specific sections")}
          <p className="ml-6 mt-2 text-sm font-normal">
            {t(
              "You can alternatively select the sections to include in this test run. New test cases are not automatically added to this run in this case."
            )}
          </p>
        </label>
        {showSpecific && (
          <div className="ml-6 mt-3 text-sm px-3 py-1 flex flex-row justify-start space-x-4 bg-gray-200 rounded">
            <span>
              {totalTestcases} {t("test cases included")}
            </span>
            <span
              className="hover:underline cursor-pointer select-none text-indigo-600"
              onClick={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}
            >
              {t("(change selection)")}
            </span>
          </div>
        )}
      </div>
      <SelectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setTotalTestcases={setTotalTestcases}
      />
    </div>
  );
};

export default TestcaseSelect;
