import Register from "../components/SignUp/SignUp";

export default function SignUp() {
  return (
    <>
      <meta
        name="description"
        content="New to Buglot! Create an account and Sign Up for the first time, 14 days free trial."
      />
      <meta
        name="keywords"
        content="Quick Test, Test Cases, Test Runs, ToDo, Test Case Reports, Jira, Sign Up, Projects"
      />
      <link
        rel="canonical"
        href={`${process.env.REACT_APP_DOMAIN_LINK}/signup`}
      />
      <Register />
    </>
  );
}
