import AddMultiUser from "../../../components/Users/addMultiUser";

const UserAddMultiple = () => {
  return (
    <div>
      <meta
        name="description"
        content="Add multiple new users simultaneously to your existing projects."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, New User, Add User, Multiple Users, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/settings/users/add-multiple`}
      />

      <AddMultiUser />
    </div>
  );
};

export default UserAddMultiple;
