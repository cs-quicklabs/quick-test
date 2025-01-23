import axiosService from "../components/Utils/axios";

export const getArchiveProjects = async () => {
  const resp = await axiosService.get(`organizations/archive/projects`);
  return resp;
};
