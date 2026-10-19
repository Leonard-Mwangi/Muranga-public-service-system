# Murang'a County Public Service Portal (Prototype)

A responsive mini eCitizen-style public service request prototype created as an ICT internship project.

> **Important:** This is an independent demo prototype, not an official Murang'a County Government website. It is not connected to any county systems. Do not enter real personal, confidential, or sensitive information.

## Features

- Responsive landing page and public-service categories
- Request submission form with basic browser-side validation
- Automatic request reference numbers (`MC-YEAR-######`)
- Request tracking by reference number
- Staff dashboard with counts, status filtering, and status updates
- Browser-local persistence using `localStorage`
- Reset function for clearing demonstration data
- No external backend or account required

## Technologies

- HTML5
- CSS3 (responsive layout)
- Vanilla JavaScript
- Browser `localStorage`

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Select **Submit a request** and create a sample request using fictional/demo details.
4. Save the reference number and test **Track request**.
5. Open **Staff dashboard** to filter requests and change their statuses.

You can also use a local static server, for example VS Code's Live Server extension.

## Publish using GitHub Pages

1. Create a GitHub repository named `muranga-county-service-portal`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment source, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to publish and open the generated URL.

## Limitations and next steps

This version is a front-end prototype. Requests are saved only in the browser profile where they were created; another resident or staff member on another device cannot see them. Browser storage is not a secure database. There is no login, role-based access control, server-side validation, email/SMS notification, file upload, audit log, or real integration with county services.

For a production-style version, add a backend API and database, secure staff authentication, authorization, server-side validation, audit logging, privacy controls, backups, and deployment configuration. Use synthetic data until an authorized organization approves real-data handling.


