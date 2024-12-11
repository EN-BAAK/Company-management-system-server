# Company Management System Server

### Coded and Designed by: [EN-BAAK (GitHub)](https://github.com/EN-BAAK)

The **Company Management System Server** is a backend service developed using `Express.js`, `MySQL`, and `Sequelize`. It is designed to manage workers, companies, and their shifts efficiently. This project ensures a robust and scalable system with features for authentication, role-based access, and detailed shift management.

---

## Terminology

- **Worker**: In this documentation, the term `worker` refers to a user with the role of `worker`. Other roles are explicitly stated.

---

## Features

- User authentication and secure role-based access.
- Management of workers, companies, and shifts.
- Pagination and filtering for large datasets.
- PDF reports generation for shift details.

---

## Models

### 1. **User**

Represents a system user, either an `admin` or a `worker`.

| Field         | Type        | Notes                       |
| ------------- | ----------- | --------------------------- |
| `id`          | Primary Key | Auto-incrementing ID.       |
| `fullName`    | String      | Indexed for quick searches. |
| `personal_id` | String      | Unique, optional.           |
| `password`    | String      | **Hashed** using `bcrypt`.  |
| `phone`       | String      | Unique, required.           |
| `notes`       | String      | Optional.                   |
| `role`        | Enum        | `admin` or `worker`.        |

- **Password Hashing**: The `bcrypt` library is used to hash passwords before creation or updates for security.

---

### 2. **Company**

Represents a company in the system.

| Field   | Type        | Notes                 |
| ------- | ----------- | --------------------- |
| `id`    | Primary Key | Auto-incrementing ID. |
| `name`  | String      | Required.             |
| `phone` | String      | Unique, required.     |
| `notes` | String      | Optional.             |

---

### 3. **Shift**

Represents work shifts for workers in companies.

| Field       | Type        | Notes                            |
| ----------- | ----------- | -------------------------------- |
| `id`        | Primary Key | Auto-incrementing ID.            |
| `date`      | Date        | Indexed for performance.         |
| `workerId`  | Foreign Key | Nullable. Links to `User`.       |
| `companyId` | Foreign Key | Required. Links to `Company`.    |
| `location`  | String      | Optional.                        |
| `notes`     | String      | Optional.                        |
| `workType`  | String      | Optional.                        |
| `startHour` | Time        | Optional.                        |
| `endHour`   | Time        | Optional.                        |
| `createdAt` | Timestamp   | Auto-generated. Ordered by DESC. |
| `updatedAt` | Timestamp   | Auto-generated.                  |

---

## API Endpoints

### 1. **Authentication**

- **Login**: Authenticate using `phone` and `password`.
- **Logout**: End the session for the user.

---

### 2. **Admin Features**

Admins have access to the following endpoints:

#### User Management

- **Edit Password**: Change password using `password` and `newPassword`.
- **Edit Phone Number**: Update phone number using `password` and `newPhone`.
- **Edit Full Name**: Update full name using `newFullName`.

#### Company Management

- **Create Company**: Add a company using `name`, `phone`, and `notes`.
- **Edit Company**: Modify company details by `id`.
- **Delete Company**: Remove a company using its `id`.
- **Fetch Companies**: Paginated results with `name`, `phone`, and `notes`.
- **Fetch Company Identities**: Get a list of company `id` and `name`.

#### Worker Management

- **Create Worker**: Add a worker using `fullName`, `personal_id`, `phone`, `password`, and `notes`.
- **Edit Worker**: Modify worker details by `id`.
- **Delete Worker**: Remove a worker by `id`.
- **Fetch Workers**: Paginated results with details.
- **Fetch Worker Identities**: Get a list of worker `id` and `fullName`.

#### Shift Management

- **Create Shift**: Add a shift using `date`, `workerId`, `companyId`, `workType`, `startHour`, `endHour`, `location`, and `notes`.
- **Edit Shift**: Modify shift details.
- **Delete Shift**: Remove a shift using its `id`.
- **Fetch Shifts**:
  - For Admins: Fetch all shifts with pagination and filters (`workerName`, `workerPhone`, `companyName`, `fromDate`, `toDate`, or general search).
  - For Workers: Fetch only their own shifts for the current date.

---

### 3. **Reports**

- **Generate PDF**:
  - Generate a detailed report using `pdfkit` for shifts of a specific worker.
  - Filters include `companyName`, `fromDate`, `toDate`, or search on `fullName`.
  - PDF Includes:
    - Company name.
    - Worker type.
    - Start and end times.
    - Date.
    - Total hours for the shift.
    - Aggregate total hours for all shifts of the worker.

---

## Technical Notes

- **Password Security**: All passwords are hashed using `bcrypt` for security.
- **Indexes**: Performance optimization through indexes on `user.fullName` and `shift.date`.
- **Pagination**: Supported for large datasets in workers, companies, and shifts.
- **Role-Based Access**: Only admins can manage workers, companies, and shifts. Workers have restricted access to view their own shifts.

---

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/EN-BAAK/company-management-system-server.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the .env file for database and environment settings:
  - PORT
  - FRONTEND_URL
  - SALT
  - JWT_SECRET_KEY
  - DATABASE_NAME
  - DATABASE_PASSWORD
  - DATABASE_USERNAME
  - DATABASE_HOST

4. In your database, run the following command:
    ```sql
      INSERT INTO users (fullName, password, phone, role) 
      VALUES ('Admin', '$2a$10$Mg30BfcdCGAsuOepJasjr.VLtC3jZuTuRxqIX.O2g3jhI9xePzy06', '123', 'admin');
    ```
    **Note:** The password here is `123`.


5. Run the application:
   ```bash
   npm start
   ```
