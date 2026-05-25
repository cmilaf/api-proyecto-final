# Navia Library 📜

Full-stack Bookstore Management Web application designed for the final Web Programming course project. The system includes JWT role-based authentication, interactive catalog text searching, inventory protection via SQL atomic transactions, and a customer interface built on strict native technologies.

## 🌟 Key Features

### 👤 Customer Features (Web Interface available)
- **Authentication**: Secure account signup and credentials authorization tokens saved locally via `localStorage`.
- **Book Catalog**: Real-time listing with contextual criteria matching (Title/Description) filtering out instantly.
- **Shopping Cart**: Real-time quantity validation capping selectors directly against item physical inventory boundaries.
- **Transactions Management**: Complete order placement tracking dynamic transaction rollback states safely. Includes a user-specific full historical records drawer.

### 🔑 Administrator Features (No UI required - Managed via CURL)
- Special master capabilities to list total database customer files.
- Complete catalog expansion capabilities (POST product data) and record properties adjustments (PUT alterations).

---

## 🎨 Design System & Technologies
- **Backend**: Node.js, Express REST API architecture, MySQL2 Pool connectors.
- **Security Protocols**: JSON Web Tokens (JWT) headers payload extraction, bcryptjs salted passwords hashing.
- **Frontend Layer**: Semantic Vanilla HTML5, native modern layouts CSS3 (Styled under a clean Sage Green aesthetic palette), and pure asynchronous JavaScript Fetch components.

---

## 🧪 Administrator Interaction Testing (CURL Commands)

As requested, the administrator panel features no visual component interface. Management procedures must be executed directly via command line tools:

### 1. Administrator Sign-in (Login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "adminpassword123"}'

2. Retrieve All Customers ListBashcurl -X GET http://localhost:5000/api/auth/customers \
  -H "Authorization: Bearer INSERT_TOKEN_HERE"
3. Retrieve All Books Inventory ListBashcurl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer INSERT_TOKEN_HERE"
4. Create an Intellectual Book Title (Insert Product)Bashcurl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSERT_TOKEN_HERE" \
  -d '{"name": "The Silence of the Lambs", "description": "Classic psychological thriller novel.", "price": 18.99, "stock": 15}'
5. Modify Existing Book Data (Update Product via PUT)Bashcurl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSERT_TOKEN_HERE" \
  -d '{"name": "The Silence of the Lambs - Deluxe Edition", "description": "Hardcover psychological masterpiece.", "price": 24.50, "stock": 12}'
👥 Reference Seeding Account CredentialsTo quickly run test scenarios, seed an initial master user into your local MySQL system:Target RoleRegistered Account UsernameDefault Secure PasswordSystem Adminadminadminpassword123Store CustomerSelf-registered via Web UIChosen at Sign-up