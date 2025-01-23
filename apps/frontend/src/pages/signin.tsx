import Login from "../components/SignUp/Login";

export default function SignIn() {
  return (
    <>
      <title>Test Loginnn</title>
      <meta
        name="description"
        content="Already a user of Buglot! SignIn and start testing"
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Sign In, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/signin`}
      />
      <Login />
    </>
  );
}
