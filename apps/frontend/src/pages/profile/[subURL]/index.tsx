import Dashboard from "../../../components/Profile/Dashboard";

const ShowProfile = () => {
  return (
    <>
      <meta
        name="description"
        content="Edit your profile details and password in this section"
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, User, Profile, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/users/edit/:id`}
      />
      <Dashboard />
    </>
  );
};

export default ShowProfile;
