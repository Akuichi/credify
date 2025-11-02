# Live Security Demo Script - Step by Step

**Total Time**: ~25-30 minutes  
**Preparation**: Have browser open, DevTools ready (F12), application running

---

## 🎬 PRE-DEMO SETUP (5 minutes before reviewers arrive)

1. **Start the application**
   ```powershell
   docker-compose up -d
   ```

2. **Open browser** (Chrome or Edge recommended)
   - Navigate to: `http://localhost:3000`
   - Open DevTools: Press `F12`
   - Position DevTools on right side for visibility

3. **Prepare test accounts**
   - Account 1: test1@example.com / Password123!@# (for basic demo)
   - Account 2: test2@example.com / SecurePass456!@# (for 2FA demo)
   - Have these written down

4. **Clear cookies/cache** for clean demo

5. **Test the app** once to ensure everything works

---

## 📋 DEMO SCRIPT

### **PART 1: Authentication Security (6-7 minutes)**

#### 1.1 Password Hashing & Complexity (2 min)
```
SAY: "Let me show you our password security measures."

DO:
✓ Click "Register" button
✓ Fill in name: "Demo User"
✓ Fill in email: "demo@test.com"

✓ Type weak password: "12345678"
  → POINT OUT: Red validation message appears
  → POINT OUT: "Password must contain uppercase letter"

✓ Type: "password"
  → POINT OUT: "Password must contain numbers"

✓ Type: "Password1"
  → POINT OUT: "Password must contain special characters"

✓ Type: "Password123!@#"
  → POINT OUT: Green checkmark, "Strong password"
  → POINT OUT: Strength indicator shows "Strong"

✓ Confirm password: "Password123!@#"

SAY: "Passwords are hashed with bcrypt on the backend. 
     Notice when I submit, the response never contains the password."

✓ Click "Register"
✓ IN DEVTOOLS → Network tab
✓ Click the POST /register request
✓ Go to "Response" tab
  → POINT OUT: User object has no "password" field
  → POINT OUT: Only hashed version is stored (not visible here)

  

```
<img width="818" height="321" alt="image" src="https://github.com/user-attachments/assets/08dbec44-9aa0-4d45-9330-a06c8c382130" />

#### 1.2 CSRF Protection (2 min)
```
SAY: "Every form submission has CSRF protection."

DO:
✓ IN DEVTOOLS → Network tab → Clear (trash icon)
✓ Click "Logout" (if logged in)
✓ Click "Login" 


✓ IN DEVTOOLS → Network tab
✓ Find: GET /sanctum/csrf-cookie request
✓ Click on it
  → POINT OUT: "This fetches a CSRF token before login"
  


✓ Go to Application tab → Cookies → http://localhost:3000
  → POINT OUT: "XSRF-TOKEN" cookie exists
  → SHOW: The long encrypted value
  

SAY: "Now watch it being sent with the login request."

✓ Enter email: test1@example.com
✓ Enter password: Password123!@#
✓ Click "Login"

✓ IN DEVTOOLS → Network tab
✓ Find: POST /api/login request
✓ Click it → Go to "Headers" tab
✓ Scroll to "Request Headers"
  → POINT OUT: "X-XSRF-TOKEN" header with the token value


SAY: "Without this token, the request would be rejected. 
     This prevents cross-site request forgery attacks."
```
<img width="812" height="234" alt="image" src="https://github.com/user-attachments/assets/c411b305-8e64-4985-a7d8-a649c3a74e2e" />
<img width="799" height="387" alt="image" src="https://github.com/user-attachments/assets/058581a8-2d7c-4440-a74b-52375c8a3a9e" />
<img width="845" height="639" alt="image" src="https://github.com/user-attachments/assets/477433be-21e8-4585-86ef-fd7bd46100fe" />
<img width="810" height="490" alt="image" src="https://github.com/user-attachments/assets/b92f5af9-be99-49b9-bd96-99315db123a2" />

#### 1.3 Rate Limiting (2 min)
```
SAY: "Login attempts are rate-limited to prevent brute force attacks.
     Let me show you by attempting multiple failed logins."

DO:
✓ Make sure you're on login page
✓ IN DEVTOOLS → Network tab → Clear

✓ Enter email: "hacker@test.com"
✓ Enter password: "wrong123"
✓ Click Login → FAST click "Login" 5 times
  (Or manually try 5 times quickly)


✓ IN DEVTOOLS → Network tab
✓ Find the 5th POST /api/login request
✓ Click on it
  → POINT OUT: Status Code: 429 Too Many Requests

  
✓ Go to "Headers" tab
  → POINT OUT: "X-RateLimit-Limit: 4"
  → POINT OUT: "X-RateLimit-Remaining: 0"
  → POINT OUT: "Retry-After: 30" (seconds)


SAY: "The system blocks further attempts for 30 seconds.
     This is configured as 4 attempts per 30 seconds."

✓ Wait 5 seconds, show error message on screen
  → POINT OUT: User sees "Too many attempts" message
```

---
<img width="543" height="289" alt="image" src="https://github.com/user-attachments/assets/87fa6d8a-6c76-4a97-b662-3306429fcc31" />
<img width="835" height="348" alt="image" src="https://github.com/user-attachments/assets/83d590f7-9b7a-403f-b3f9-b2d9abd901f0" />
<img width="570" height="390" alt="image" src="https://github.com/user-attachments/assets/14d7bcae-4bde-4fca-9cba-02c34d48efb7" />

### **PART 2: Two-Factor Authentication (6-7 minutes)**

#### 2.1 Setup 2FA (3 min)
```
SAY: "Let me demonstrate two-factor authentication setup."

DO:
✓ Login
✓ Navigate to: Settings or Security page
✓ Find "Two-Factor Authentication" section
✓ Click "Enable 2FA" button

✓ SHOW ON SCREEN: QR code appears
  → POINT OUT: "This QR code contains a secret key"
  → POINT OUT: App name "Credify" and email shown

SAY: "I'll scan this with Google Authenticator on my phone."

✓ Take out phone, open Authenticator app
✓ Scan the QR code (show phone screen to reviewers if possible)
✓ SHOW: 6-digit code appearing on phone

✓ Enter the 6-digit code in the input field
✓ Click "Verify & Enable"

  → POINT OUT: Success message "2FA enabled successfully"
  → POINT OUT: QR code disappears
  → POINT OUT: Status shows "2FA is enabled"

SAY: "The secret is now encrypted and stored in the database.
     It's never exposed to the client again."
```

#### 2.2 Test 2FA Login Flow (2 min)
```
SAY: "Now let me show you the 2FA verification on login."

DO:
✓ Click "Logout"
✓ Return to Login page

✓ IN DEVTOOLS → Network tab → Clear

✓ Enter email
✓ Enter password
✓ Click "Login"

  → POINT OUT: Instead of logging in, redirected to 2FA page
  
✓ IN DEVTOOLS → Network tab
✓ Click POST /api/login request
✓ Go to "Response" tab
  → POINT OUT: "two_factor_required": true
  → POINT OUT: "temp_token" provided (for the 2FA step only)


✓ SHOW: 2FA verification page appears
✓ Check phone for current 6-digit code
✓ Enter the code
✓ Click "Verify"

  → POINT OUT: Now successfully logged in
  → POINT OUT: Redirected to dashboard

SAY: "Two-factor authentication is required every time after password login.
     This adds an extra layer of security."
```
<img width="811" height="189" alt="image" src="https://github.com/user-attachments/assets/992448f3-ac97-47c4-8125-0076eb216372" />
#### 2.3 Disable 2FA Protection (1 min)
```
SAY: "Disabling 2FA requires re-authentication for security."

DO:
✓ Go to Settings/Security page
✓ Find "Two-Factor Authentication" section
✓ Click "Disable 2FA" button

  → POINT OUT: Modal/prompt appears asking for password

✓ Enter WRONG password: "wrongpass123"
✓ Click "Confirm"
  → POINT OUT: Error message "Wrong password" or "Invalid password"

✓ Enter CORRECT password: SecurePass456!@#
✓ Click "Confirm"
  → POINT OUT: Success message "2FA disabled"
  → POINT OUT: Status changes to "2FA is disabled"

SAY: "This prevents someone who gains temporary access 
     from disabling your security features."
```

---

### **PART 3: Session & Token Management (4-5 minutes)**

#### 3.1 Sanctum Session Cookies (2 min)
```
SAY: "We use Laravel Sanctum for secure session-based authentication."

DO:
✓ Make sure you're logged in
✓ IN DEVTOOLS → Application tab
✓ Expand "Cookies" → Click "http://localhost:3000"

  → POINT OUT: "credify_session" cookie exists
  → POINT OUT: "HttpOnly" flag is checked ✓
  → SHOW: The encrypted session value

SAY: "The HttpOnly flag means JavaScript cannot access this cookie.
     This prevents XSS attacks from stealing session tokens."


```
<img width="835" height="605" alt="image" src="https://github.com/user-attachments/assets/62175d5b-a332-4874-8e4f-09de224315c1" />
#### 3.2 No Tokens in Console (2 min)
```
SAY: "Let me prove there are no authentication tokens 
     stored in JavaScript-accessible locations."

DO:

✓ Go to Application tab → Local Storage → http://localhost:3000
  → POINT OUT: No tokens stored here


✓ Go to Application tab → Session Storage → http://localhost:3000
  → POINT OUT: No tokens stored here

SAY: "All authentication is handled via secure HttpOnly cookies.
     No tokens are accessible to JavaScript."



```
<img width="831" height="668" alt="image" src="https://github.com/user-attachments/assets/cd40cad8-7b25-45a3-a812-ced2b32c8b43" />
<img width="834" height="651" alt="image" src="https://github.com/user-attachments/assets/9ab1824c-6de8-4ae4-8f20-dce4e9b0acf4" />
#### 3.3 Logout Invalidates Session (1 min)
```
SAY: "When you logout, the session is completely invalidated."

DO:
✓ IN DEVTOOLS → Application → Cookies
✓ Note the current session cookie value (show it)

✓ Click "Logout" button

✓ IN DEVTOOLS → Network tab
✓ Find POST /api/logout request
  → POINT OUT: Returns 200 OK

✓ Go back to Application → Cookies
  → POINT OUT: Session cookie is deleted or value changed

✓ Try to access protected page (e.g., type URL: /dashboard)
  → POINT OUT: Automatically redirected to login page

SAY: "The session is completely destroyed on logout.
     You cannot access protected resources."
```
<img width="832" height="615" alt="image" src="https://github.com/user-attachments/assets/3d942e00-ef3b-40f0-a080-0110eb865fda" />
<img width="833" height="591" alt="image" src="https://github.com/user-attachments/assets/ba669b2e-0677-4a0b-b3b0-638848d3ff88" />

---

### **PART 4: Input Validation (3-4 minutes)**

#### 4.1 Frontend Validation (1 min)
```
SAY: "The frontend provides immediate feedback on invalid input."

DO:
✓ Go to Register page
✓ Click in "Email" field
✓ Type: "notanemail" (without @)
✓ Click outside the field

  → POINT OUT: Red border appears
  → POINT OUT: Error message "Please enter a valid email"

✓ Clear field and type: "test@email"
  → POINT OUT: Still shows error (no domain extension)

✓ Type: "test@email.com"
  → POINT OUT: Green checkmark, error disappears
```

#### 4.2 Backend Validation (2 min)
```
SAY: "Even if someone bypasses frontend validation, 
     the backend still validates everything."

DO:
✓ Stay on Register page
✓ Right-click on "Email" field → Inspect Element
✓ In the HTML inspector, find: type="email"
✓ Double-click "email" and change to "text"
✓ Find: required attribute
✓ Right-click → Delete attribute

SAY: "I've just removed the frontend validation."

✓ Leave email empty or type invalid data
✓ Fill password: "weak" (intentionally weak)
✓ Fill other fields normally

✓ IN DEVTOOLS → Network tab → Clear
✓ Click "Register"

✓ IN DEVTOOLS → Network tab
✓ Find POST /api/register request
  → POINT OUT: Status Code: 422 Unprocessable Entity
  
✓ Click on it → Response tab
  → POINT OUT: Validation errors from backend:
    "errors": {
      "email": ["The email field is required"],
      "password": ["The password must be at least 8 characters"]
    }

SAY: "The backend always validates. Frontend validation is just for UX."
```

#### 4.3 SQL Injection Protection (1 min)
```
SAY: "Let me test for SQL injection vulnerabilities."

DO:
✓ Go to Login page
✓ IN DEVTOOLS → Network tab → Clear

✓ Enter email: ' OR '1'='1
✓ Enter password: anything
✓ Click Login

  → POINT OUT: Returns error "Invalid credentials"
  → POINT OUT: Application still works (not broken)

✓ Try another: admin'--
✓ Try another: '; DROP TABLE users;--

  → POINT OUT: All fail safely
  → POINT OUT: No SQL errors exposed to client

SAY: "We use Laravel Eloquent ORM with prepared statements.
     All queries are parameterized, preventing SQL injection."
```

---

### **PART 5: Secure Configuration (3-4 minutes)**

#### 5.1 No Secrets in Client Code (2 min)
```
SAY: "Let me prove no credentials are exposed in the client."

DO:
✓ Right-click page → "View Page Source"
✓ Press Ctrl+F
✓ Search for: "password"
  → POINT OUT: Only finds password field HTML, no actual passwords

✓ Search for: "secret"
  → POINT OUT: Nothing sensitive found

✓ Search for: "api_key"
  → POINT OUT: No API keys

SAY: "All sensitive configuration is on the backend, 
     loaded from environment variables."
```

#### 5.2 .env Not in Repository (1 min)
```
SAY: "Environment variables are never committed to git."

DO:
✓ Open browser tab
✓ Navigate to: https://github.com/Akuichi/credify
  (or your repository URL)

✓ Browse files
  → POINT OUT: .env.example is visible (template)
  → POINT OUT: .env is NOT in the file list

✓ Click on .gitignore file
  → POINT OUT: /.env is listed
  → POINT OUT: Multiple .env patterns excluded

SAY: "The actual .env file with real credentials 
     is never pushed to the repository."
```

---

### **PART 6: Logging & Audit Trail (2-3 minutes)**

#### 6.1 Login History (3 min)
```
SAY: "The system logs every login with IP address, 
     browser information, and timestamp."

DO:
✓ Make sure you're logged in
✓ Navigate to: Account Settings or Security page
✓ Find "Login History" or "Recent Activity" section

  → POINT OUT: "Last Login" information shows:
    - Date & Time: "November 2, 2025 at 2:30 PM"
    - IP Address: "192.168.1.100" or similar
    - Browser: "Chrome 119.0.0 on Windows"

✓ Scroll down to Login History table

  → POINT OUT: Multiple entries showing:
    - Column 1: Date & Time
    - Column 2: IP Address
    - Column 3: Browser / Device
    - Column 4: Location (if available)

SAY: "Let me create a new login from a different browser 
     to show this updates in real-time."

✓ Open Incognito/Private window (or different browser)
✓ Navigate to localhost:3000
✓ Login with same account
✓ Close private window

✓ Return to main window
✓ Refresh the Login History page

  → POINT OUT: New entry appears at the top
  → POINT OUT: Different browser shown
  → POINT OUT: Timestamp is current




SAY: "Every successful login is logged for security auditing.
     Users can monitor their account for suspicious activity."
```

---
<img width="1427" height="380" alt="image" src="https://github.com/user-attachments/assets/799cc748-bea1-4a27-9a2f-792f4b09076e" />
### **PART 7: General Security (2-3 minutes)**

#### 7.1 Error Handling (2 min)
```
SAY: "Errors never expose sensitive system information."

DO:
✓ Go to Login page
✓ Enter wrong credentials
✓ Click Login

  → POINT OUT: Generic message: "Invalid credentials"
  → POINT OUT: Doesn't say "User not found" or "Wrong password"
  → POINT OUT: Prevents username enumeration

✓ IN DEVTOOLS → Network → POST /api/login response
  → POINT OUT: No stack traces
  → POINT OUT: No file paths
  → POINT OUT: No database errors

✓ IN DEVTOOLS → Console tab
  → POINT OUT: No PHP errors
  → POINT OUT: No sensitive information logged

SAY: "In production, APP_DEBUG is set to false.
     Generic error pages are shown for any server errors."
```

#### 7.2 Password Never Exposed (1 min)
```
SAY: "Let me verify passwords are never returned in any API response."

DO:
✓ Make sure you're logged in
✓ IN DEVTOOLS → Network tab → Clear

✓ Navigate around the app (Dashboard, Settings, Profile)
✓ IN DEVTOOLS → Network tab
✓ Click through various API calls
✓ Check Response tabs

  → POINT OUT: User objects never include "password" field
  → POINT OUT: Only safe fields: name, email, created_at, etc.

✓ Go to Application → Cookies → Local Storage → Session Storage
  → POINT OUT: No password stored anywhere

SAY: "Passwords are hashed with bcrypt and never leave the server.
     They're excluded from all API responses."
```

---

## 🎯 CLOSING (1-2 minutes)

```
SAY: "To summarize what we've demonstrated today:"

RECAP:
✓ "All passwords are hashed with bcrypt"
✓ "CSRF protection on all forms"
✓ "Rate limiting prevents brute force attacks"
✓ "Two-factor authentication with TOTP"
✓ "Secure session management with Sanctum"
✓ "No tokens accessible to JavaScript"
✓ "Backend validates all input"
✓ "SQL injection protection with ORM"
✓ "Environment variables not in repository"
✓ "Complete login audit trail"
✓ "Error messages don't leak sensitive information"

SAY: "Do you have any questions or would you like me to 
     demonstrate any specific feature again?"

✓ Ask reviewers to sign the checklist
✓ Answer any questions
```

---

## 📌 TROUBLESHOOTING

**If something doesn't work during demo:**

- **App not loading**: Check docker-compose is running
  ```powershell
  docker-compose ps
  docker-compose logs app
  ```

- **Database errors**: Restart containers
  ```powershell
  docker-compose restart
  ```

- **Network tab empty**: Make sure "Preserve log" is checked

- **Can't find a feature**: Use app search or navigation menu

---

---



