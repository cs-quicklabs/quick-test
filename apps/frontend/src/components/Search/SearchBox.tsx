import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import axiosService from "../Utils/axios";
import SearchResult from "./components/SearchResult";
interface ISearchResultProps {
  milestones: [];
  testCases: [];
  testSuites: [];
  projects: [];
}

const initialSearchResultState: ISearchResultProps = {
  milestones: [],
  testCases: [],
  testSuites: [],
  projects: [],
};

const debounce = (fn: any, wait: number) => {
  let token: any;
  return (...args: any) => {
    if (token) clearTimeout(token);
    token = setTimeout(() => {
      fn(...args);
    }, wait);
  };
};

const SearchBox = ({ inputFieldId }: { inputFieldId: string }) => {
  const { t } = useTranslation(["common"]);
  const [inputValue, setInputValue] = useState("");
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchResult, setSearchResult] = useState(initialSearchResultState);
  const [searchWidth, setSearchWidth] = useState(0);
  const searchWidthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getSearchWidth = searchWidthRef.current?.clientWidth || 0;
    setSearchWidth(getSearchWidth);
  }, [searchWidthRef.current?.clientWidth]);

  // cleans the cached search results
  useEffect(() => {
    if (inputValue === "") {
      setSearchResult(initialSearchResultState);
    }
  }, [inputValue]);

  const inputOnChange = (e: any) => {
    setInputValue(e.target.value);
    getSearchData(e);
    if (e.target.value?.length > 0) setShowDropDown(true);
    else setShowDropDown(false);
  };

  const inputOnFocus = () => {
    if (inputValue.length > 0) setShowDropDown(true);
  };

  const getSearchData = useMemo(
    () =>
      debounce(async (e: any) => {
        const _value = e.target.value;
        if (_value.length > 0) {
          try {
            const response = await axiosService.get(
              `/organizations/search?query=${_value}`
            );
            setSearchResult(response?.data?.data);
          } catch (err) {
            // console.log(err?.response?.data?.message);
          }
        }
      }, 1500),
    []
  );

  const getAllSearchCount = () => {
    return Object.values(searchResult).reduce(
      (accumulator, currentValue) => accumulator + currentValue.length,
      0
    );
  };

  return (
    <>
      <div className="w-full max-w-lg lg:max-w-xs">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            className="pl-10 pr-3 py-1 rounded-md text-sm text-gray-500 font-medium sm:w-72  h-9 grow sm:grow-0 sm:justify-self-end relative bg-gray-700 focus:border-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
            ref={searchWidthRef}
            type="search"
            id={inputFieldId}
            placeholder={t("Search...")}
            value={inputValue}
            onChange={inputOnChange}
            onFocus={inputOnFocus}
            onBlur={() => setShowDropDown(false)}
            data-cy="input-search-box"
          ></input>
        </div>
      </div>

      {showDropDown && (
        <div
          style={{ width: `${searchWidth}px` }}
          className={`absolute top-24 sm:top-11 rounded-md shadow-md border border-gray-300 overflow-x-hidden w-72 bg-white z-10 ${getAllSearchCount() > 8 ? "h-64 overflow-y-auto" : "h-auto"
            } `}
        >
          {Object.keys(searchResult).length === 0 ? (
            <div className="px-2 py-1 text-sm">{t("No matches")}</div>
          ) : (
            <SearchResult
              matchedData={searchResult}
              setInputValue={setInputValue}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SearchBox;
