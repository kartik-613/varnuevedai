# Node.js API Boilerplate (Scalable Architecture) Update 3

A highly scalable and generic Node.js API boilerplate designed for rapid development. This architecture is extracted from the `chefboxai-api` project, optimized for modularity, clean separation of concerns, and dynamic resource management.

---

## 🚀 Key Architectural Features

- **Service Registry Pattern**: Dynamically resolves domain-specific services with automatic fallback to generic CRUD logic.
- **Resource Router Factory**: Instantly generate standard CRUD endpoints for any model using a single utility.
- **Domain-Specific Overrides**: Easily extend generic behaviors in the `src/services/domain` directory.
- **Production-Ready Core**: Matches `chefboxai-api` exact server/app setup including IIS Named Pipe support, multi-interface listening (`0.0.0.0`), and sophisticated Sequelize synchronization.

---

## 📂 Project Structure

```text
node-api-boilerplate/
├── src/
│   ├── app.js               # Express application bootstrap (Security & Middleware)
│   ├── server.js            # Entry point for DB Auth, Sync, and Server Listen
│   ├── config/              # Centralized environment & app settings
│   ├── controllers/         # Logic layer connecting Services to API Responses
│   │   ├── baseController.js # Generic CRUD Controller Factory
│   │   └── todoController.js # Domain-specific controller (e.g., TODO app)
│   ├── middlewares/         # Auth, Global Error Handling, and Validation
│   ├── models/              # Sequelize schemas (automatically loaded)
│   ├── routes/              # Modular API path definitions
│   │   ├── index.js         # Main router mounting all logic
│   │   ├── resourceRoutes.js# DYNAMIC: Factory for generating CRUD routes
│   │   └── todo.routes.js   # Custom module-specific routes
│   ├── services/            # Business & Database Interaction
│   │   ├── baseService.js   # REUSABLE: Generic DB operation logic
│   │   └── domain/          # OVERRIDES: Where custom business logic lives
│   │       ├── serviceRegistry.js # HUB: Maps models to domain services
│   │       └── todoService.js     # Custom logic for Todos
│   └── utils/               # standardized responses and logging
├── public/                  # Static assets & file uploads
└── README.md                # Developer guide
```

---

## 🛠️ Developer Guidance: How to Use

### 1. Adding a Simple CRUD Table (No Custom Logic)
If you just need standard CRUD (Create, Read, Update, Delete) for a new model like `Category`:

1.  **Define Model**: Create `src/models/category.js`.
2.  **Mount Route**: Add the following line in `src/routes/index.js`:
    ```javascript
    router.use('/categories', resourceRouter('Category'));
    ```
    *The system will automatically create `GET`, `POST`, `PUT`, `DELETE` endpoints.*

### 2. Adding a Module with Custom Logic (The TODO Way)
If your model requires custom behavior (e.g., specific filters, validations, or extra endpoints):

1.  **Define Model**: Create `src/models/todo.js`.
2.  **Create Domain Service**: Create `src/services/domain/todoService.js` and extend `makeService`.
3.  **Register Service**: Add your service to `src/services/domain/serviceRegistry.js`:
    ```javascript
    const services = {
        Todo: todoService, // Overrides the base service
    };
    ```
4.  **Create Custom Controller**: Create `src/controllers/todoController.js` and extend `makeController`.
5.  **Define Custom Routes**: Create `src/routes/todo.routes.js` and mount it in `src/routes/index.js`.

### 3. Overriding Base Behaviors
To change how *all* generic resources behave (e.g., adding soft-delete by default or audit logging), modify:
-   `src/services/baseService.js`
-   `src/controllers/baseController.js`

---

## 🚦 Getting Started

### Installation
```bash
npm install
```

### Configuration
1.  Copy `.env.example` to `.env`.
2.  Update your Database credentials.
3.  Note: Setting `SKIP_SYNC=true` will bypass Sequelize model alterations in production.

### Execution
```bash
# Development (Hot Refresh)
npm run dev

# Production
npm start
```

---

## ✅ Best Practices
- **Never modify `baseService.js` for model-specific logic.** Use the `domain/` folder for overrides.
- **Use `respond.ok()`** and other standard helpers to maintain frontend compatibility.
- **Keep `app.js` and `server.js` clean.** Only add global, app-wide middleware or initialization logic there.

---
## 📜 License
MIT
