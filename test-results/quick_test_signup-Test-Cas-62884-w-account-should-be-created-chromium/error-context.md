# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "QuickTest" [ref=e6] [cursor=pointer]
      - heading "Sign in to your account" [level=2] [ref=e7]
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e13]: Email Address
          - textbox "Email Address" [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e18]: Password
          - textbox "Password" [ref=e20]
        - generic [ref=e21]:
          - generic [ref=e23]:
            - checkbox "Remember Me" [ref=e24]
            - generic [ref=e25]: Remember Me
          - link "Forgot password?" [ref=e27] [cursor=pointer]:
            - /url: /forgot-password
        - button "Sign in" [ref=e29] [cursor=pointer]
      - generic [ref=e34]:
        - text: Don't have an account?
        - link "Sign up" [ref=e35] [cursor=pointer]:
          - /url: /signup
          - generic [ref=e36] [cursor=pointer]: Sign up
  - generic [ref=e37]:
    - img [ref=e39]
    - button "Open Tanstack query devtools" [ref=e87] [cursor=pointer]:
      - img [ref=e88] [cursor=pointer]
```