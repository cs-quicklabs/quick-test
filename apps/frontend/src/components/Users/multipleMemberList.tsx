/* eslint-disable react/no-unescaped-entities */

import { useTranslation } from "react-i18next";
import { RoleId, RoleType } from "../Utils/constants/roles-permission";

const MultipleMemberList = ({ users }: any) => {
  const { t } = useTranslation();
  return (
    <main className="pb-12 sm:pl-4 lg:col-span-9 ">
      <div className="flex flex-col ">
        <div className="-my-2 sm:-mx-6 lg:-mx-8  ">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden ">
              <div className="pb-1 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                <h3 className="text-base leading-6 font-medium text-gray-900">
                  {t("Preview")}
                </h3>
              </div>
              <div className="min-w-full divide-y divide-gray-200 border-2 border-gray-200 h-52  block overflow-auto">
                <table className="w-full ">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th
                        scope="col"
                        className="pr-4 pl-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("Sno")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("Name")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("Email")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {t("Role")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 position-relative ">
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="mt-4">
                          <div className="text-gray-500 text-sm text-center">
                            {t("No user added yet")}
                          </div>
                        </td>
                      </tr>
                    )}

                    {users?.map((user: any, index: any) => {
                      if (!user?.valid) {
                        return (
                          <tr key={index} className="text-sm">
                            <td className="pr-4 pl-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="w-full" colSpan={3}>
                              <div className=" text-red-500 text-sm text-center pr-12">
                                {t(
                                  "Please enter information in the given format."
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={index} className="table-row">
                          <td className="pr-4 pl-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.firstName.length > 10
                              ? `${user.firstName.slice(0, 10)}...`
                              : user.firstName}{" "}
                            {user.lastName.length > 10
                              ? `${user.lastName.slice(0, 10)}...`
                              : user.lastName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {user.firstName.length + user.lastName.length < 15
                              ? `${user.email}`
                              : user.email.length > 20
                                ? `${user.email.slice(0, 20)}...`
                                : user.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {user.roleId === RoleId.OWNER
                              ? RoleType.OWNER.charAt(0) +
                              RoleType.OWNER.slice(1).toLowerCase()
                              : user.roleId === RoleId.ADMIN
                                ? RoleType.ADMIN.charAt(0) +
                                RoleType.ADMIN.slice(1).toLowerCase()
                                : RoleType.MEMBER.charAt(0) +
                                RoleType.MEMBER.slice(1).toLowerCase()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MultipleMemberList;
