

## Backend Setup

Follow the steps below to set up and run the backend server.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd election-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Prisma

* Install Prisma CLI:

  ```bash
  pnpm add -D prisma
  ```

* Install Prisma Client:

  ```bash
  pnpm add @prisma/client
  ```

* Initialize Prisma (if not already done):

  ```bash
  npx prisma init
  ```

* Generate Prisma Client:

  ```bash
  npx prisma generate
  ```

### 4. Run the Development Server

```bash
pnpm run dev
```

---
