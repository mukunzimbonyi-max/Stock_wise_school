# School Stock Keeper

make design Create a modern, responsive Stock Management and Food Stock Book frontend using React.js, JavaScript, HTML, and CSS. The design should be inspired by a school stock book spreadsheet, but it must look like a professional web application instead of an Excel sheet.

The application is for a school to record and manage food stock received, released, used, destroyed, and remaining.

Use React functional components and organize the project into reusable components. Do not create a backend yet. Use local React state and localStorage so that entered stock records remain available after refreshing the browser.

Application name:

“School Food Stock Management System”

Main design:

- Use a clean professional dashboard.

- Use dark green as the primary color to represent school and food management.

- Use white and light gray backgrounds.

- Add green buttons and clear icons.

- Make the website responsive for desktop, tablet, and mobile.

- Use a modern font such as Inter, Poppins, or Arial.

- Add smooth transitions, hover effects, rounded cards, and subtle shadows.

- Do not copy the Excel appearance exactly. Convert the information into a modern and easy-to-use website.

Create the following pages and components:

1. Login Page

- School logo or stock management icon.

- Title: “School Food Stock Management System”

- Email input.

- Password input.

- Show/hide password button.

- “Remember me” checkbox.

- Login button.

- “Forgot password?” link.

- Responsive modern design.

2. Dashboard Page

Create a left sidebar containing:

- Dashboard

- Stock Records

- Add Stock

- Food Released

- Stock Reports

- School Information

- Settings

- Logout

Create a top navigation bar containing:

- Page title.

- Search box.

- Notification icon.

- User profile image and name.

Dashboard statistics cards:

- Total Food Received

- Total Food Released

- Total Food Destroyed

- Remaining Stock

Show the values with suitable icons and small percentage or status indicators.

Add:

- Recent stock activity table.

- Food stock summary chart.

- Monthly stock movement chart.

- Low-stock warning section.

- Quick action buttons:

  - Add New Stock

  - Record Food Release

  - Generate Report

3. Stock Records Page

Display a professional table based on the stock book in the image.

Use these columns:

- Date

- Food Item

- Started With

- Received

- Supplier Name

- Supplier Signature

- Provided

- Cook Name

- Cook Signature

- Destroyed

- Thrown Away

- Total Used

- Remaining Stock

- Explanation

- Actions

Actions:

- View

- Edit

- Delete

Add:

- Search bar.

- Filter by date.

- Filter by food item.

- Filter by stock status.

- Sort options.

- Pagination.

- Export to PDF button.

- Export to Excel button.

- Print button.

- “Add New Stock Record” button.

The table must be horizontally scrollable on small screens.

4. Add Stock Record Page

Create a clear form with the following sections:

School Information:

- School Name

- School Category

- School Number

- District

- Academic Year

Stock Information:

- Date

- Food Item

- Unit of Measurement

- Started With Quantity

- Received Quantity

- Supplier Name

- Supplier Signature

Food Release Information:

- Quantity Provided

- Cook Name

- Cook Signature

Stock Loss Information:

- Quantity Destroyed

- Quantity Thrown Away

- Explanation

The system should automatically calculate:

Remaining Stock =

Started With + Received - Provided - Destroyed - Thrown Away

Show the calculated remaining quantity immediately while the user enters values.

Add:

- Save Record button.

- Save and Add Another button.

- Cancel button.

- Form validation.

- Success notification after saving.

5. Food Released Page

Create a page for recording food released for student feeding.

Include:

- Date

- Food Item

- Quantity Released

- Cook Name

- Number of Students Fed

- Meal Type

- Notes

- Cook Signature

Show recent food releases in a table.

6. Reports Page

Create report cards and filters.

Reports:

- Daily Stock Report

- Weekly Stock Report

- Monthly Stock Report

- Food Received Report

- Food Released Report

- Food Loss Report

- Remaining Stock Report

Add filters:

- Start Date

- End Date

- Food Item

- Academic Year

Include:

- Bar chart for received, released, and remaining stock.

- Pie or doughnut chart for food usage.

- Summary cards.

- Export PDF button.

- Export Excel button.

- Print Report button.

7. School Information Page

Display:

- School Name

- School Category: Day School

- School Number

- District: Huye

- Academic Year

- School Logo

Allow the user to edit and save the information.

8. Settings Page

Include:

- Profile settings.

- Change password.

- Notification settings.

- Light and dark mode.

- Language selection.

- Data backup and restore options.

Functional requirements:

- Use React Router for navigation.

- Use React hooks such as useState and useEffect.

- Store records in localStorage.

- Add, edit, delete, search, filter, and sort stock records.

- Automatically calculate remaining stock.

- Show confirmation before deleting a record.

- Display toast notifications for successful actions and errors.

- Use reusable components such as:

  - Sidebar

  - Navbar

  - StatCard

  - StockTable

  - StockForm

  - SearchFilter

  - ReportChart

  - Modal

  - ConfirmationDialog

  - ToastNotification

Suggested project structure:

src/

├── components/

│ ├── Sidebar.jsx

│ ├── Navbar.jsx

│ ├── StatCard.jsx

│ ├── StockTable.jsx

│ ├── StockForm.jsx

│ ├── SearchFilter.jsx

│ ├── ReportChart.jsx

│ ├── Modal.jsx

│ └── ToastNotification.jsx

├── pages/

│ ├── Login.jsx

│ ├── Dashboard.jsx

│ ├── StockRecords.jsx

│ ├── AddStock.jsx

│ ├── FoodReleased.jsx

│ ├── Reports.jsx

│ ├── SchoolInformation.jsx

│ └── Settings.jsx

├── data/

│ └── sampleStockData.js

├── App.jsx

├── main.jsx

└── index.css

Use:

- React.js

- JavaScript, not TypeScript

- React Router

- React Icons

- Chart.js or Recharts for charts

- CSS or modern CSS modules

Include realistic sample data for foods such as:

- Rice

- Beans

- Maize Flour

- Cooking Oil

- Salt

- Sugar

Make the interface professional, simple, clear, interactive, and easy for school staff to use. The frontend should be fully functional with sample data and should not require a backend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stock-wise-school.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85cdb315-3054-4a00-817a-cf84001e25b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
