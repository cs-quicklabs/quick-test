import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  setPageNum: (arg: number) => void | number;
  paginationData: {
    itemCount: number;
    page: number;
    pageCount: number;
    take: number;
  };
}

export default function Pagination(data: Props) {
  const { t } = useTranslation(["common"]);
  const [showLastData, setShowLastData] = useState(false);

  const state = useMemo(
    () => ({
      showing:
        data.paginationData?.page * data.paginationData?.take -
        (data.paginationData.take - 1),
      to:
        data.paginationData.page * data.paginationData.take >
          data.paginationData.itemCount
          ? data.paginationData.itemCount
          : data.paginationData.page * data.paginationData.take,
    }),
    [data.paginationData]
  );

  useEffect(() => {
    if (state.showing === state.to) setShowLastData(true);
    else setShowLastData(false);
  }, [data.paginationData, state.showing, state.to]);

  return data.paginationData?.pageCount > 1 ? (
    <div className="mx-auto mt-6" id="pagination">
      <nav
        className="bg-white pt-1 py-3 flex items-center justify-between border-gray-200"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            {t("Showing")}&nbsp;
            <span className="font-medium">{state.showing}</span>
            {!showLastData && (
              <>
                &nbsp;{t("to")}&nbsp;
                <span className="font-medium">{state.to}</span>
              </>
            )}
            &nbsp;{t("of")}&nbsp;
            <span className="font-medium">{data.paginationData.itemCount}</span>
            &nbsp;{t("results")}&nbsp;
          </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
          <div
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              data.paginationData.page === 1 || data.paginationData.page === 0
                ? null
                : data.setPageNum(data.paginationData.page - 1);
            }}
            className={` cursor-pointer relative inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${(data.paginationData.page === 1 ||
                data.paginationData.page === 0) &&
              "hidden"
              }`}
          >
            {t("Previous")}
          </div>
          <div
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              data.paginationData.page === data.paginationData.pageCount
                ? null
                : data.setPageNum(data.paginationData.page + 1);
            }}
            className={` cursor-pointer ml-3 relative inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${data.paginationData.page === data.paginationData.pageCount &&
              "hidden"
              }`}
          >
            {t("Next")}
          </div>
        </div>
      </nav>
    </div>
  ) : null;
}
