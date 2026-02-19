# Issue: Frontend Dashboard & Accounting Metrics Not Displaying

## Bug Description:
On the main dashboard, the graphs and telemetry/statistics numbers are not displaying. Additionally, the "Accounting" section is completely unimplemented on the frontend.

## Scope of Fix:
- Implement the frontend to correctly display dashboard metrics (telemetry and statistics).
- Implement the frontend for the "Accounting" section.
- All graphs in both the dashboard and accounting sections must be implemented using `react-chartjs-2`.
- No additional features or issues are to be addressed.
- No unrelated code refactoring.

## Affected Components:
- `client/src/features/dashboard`
- `client/src/features/comptabilite`

## Assumptions:
- Backend APIs for fetching dashboard metrics and accounting data are functional and correctly exposed. The fix focuses solely on frontend rendering and integration.

## Steps for Resolution:
1. Implement the necessary React components to fetch and display dashboard metrics.
2. Integrate `react-chartjs-2` for rendering all required graphs on the dashboard.
3. Develop the frontend components for the "Accounting" section, including data display and graph rendering using `react-chartjs-2`.
4. Ensure all changes adhere to existing project conventions and coding standards.

## Origin:
Reported by user. Instructions emphasize `react-chartjs-2` as per contributor `@ibrahimaSidibe07`.