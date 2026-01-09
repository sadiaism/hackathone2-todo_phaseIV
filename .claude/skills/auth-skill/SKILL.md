---
name: auth-skill
description: Handle secure signup, signin, password hashing, JWT token management, and Better Auth integration. Use for authentication flows in web applications.
---

# Auth Skill

## Instructions

1. **Signup & Signin**
   - Implement secure signup and signin endpoints
   - Validate user input and enforce password policies
   - Ensure email uniqueness and proper error handling

2. **Password Security**
   - Use strong hashing algorithms (e.g., bcrypt)
   - Salt passwords before storing
   - Avoid storing plain text passwords

3. **JWT Tokens**
   - Generate JWT tokens on successful signin
   - Include relevant claims (user ID, role, expiry)
   - Verify tokens on protected routes
   - Handle token refresh securely

4. **Better Auth Integration**
   - Configure Better Auth properly
   - Use for additional security layers if required
   - Ensure seamless integration with signup/signin flows

## Best Practices
- Never log sensitive information (passwords, tokens)
- Use HTTPS for all auth requests
- Validate inputs on both client and server sides
- Follow OWASP authentication security guidelines
- Keep token expiry reasonable and refresh securely
