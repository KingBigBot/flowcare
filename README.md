# FlowCare – MVP Healthcare Navigation Demo

FlowCare is a demo healthcare navigation platform designed for a DECA‑style pitch. It routes patients to the most appropriate care setting based on symptoms, wait time estimates, facility capabilities and patient preferences. This MVP is built as a static single‑page application (SPA) with vanilla HTML/CSS/JS and is deployable for free on Netlify. All patient information is stored locally in the browser; no personal health information is collected on the server.

## Features

* **Landing Page** – value proposition, how it works and CTA to start the triage.
* **Patient Profile** – enter demographic and preference data which is saved in `localStorage`.
* **Symptom Triage Wizard** – a simple 6‑step intake for complaint category, severity, red flags, duration, symptom prompts and preferences. Based on a rule‑based algorithm the app recommends a care setting (ED, Urgent, Walk‑in, Virtual or Self‑care).
* **Results** – ranked list of facilities with demo wait times, distance estimates and capabilities. An interactive map (Leaflet + OpenStreetMap) displays facility markers.
* **Facilities** – view all demo facilities.
* **Safety & Privacy** – clear safety guidance, disclaimer and Ontario‑friendly privacy note.
* **Demo Admin Mode** – override facility wait times and add/remove facilities on the fly. Changes are stored in `localStorage` and do not alter the source data.
* **Git‑based CMS (Decap CMS)** – edit facilities and site copy at `/admin`. The CMS uses Netlify Identity + Git Gateway to write changes directly back to the repository via commits.

## File Structure

```
flowcare/
├── admin/
│   ├── config.yml       # Decap CMS configuration
│   └── index.html       # Loads Netlify Identity & Decap CMS
├── content/
│   ├── facilities.json  # Demo facility data (editable via CMS)
│   └── site.json        # Landing page copy & labels (editable via CMS)
├── app.js               # Main JavaScript application logic
├── index.html         # Root HTML page for the SPA
├── styles.css           # Styles using the prescribed colour palette
├── netlify.toml         # Netlify build configuration & SPA redirect
└── README.md            # This file
```

## Running Locally

You can preview the site locally without any build steps. Use a simple HTTP server so that XHR requests to JSON files work correctly:

```bash
# From the repository root
cd flowcare
# Install a tiny web server if you don't already have one
python3 -m http.server 8080

# Then browse to http://localhost:8080 in your browser.
```

## Deploying to Netlify

1. **Create a new GitHub repository and push the code.**
   - On GitHub, create a public repository (e.g. `flowcare`).
   - Locally (or via the GitHub UI) add the files from this directory and commit:
     ```bash
     git init
     git add .
     git commit -m 'Initial FlowCare MVP'
     git branch -M main
     git remote add origin <your-repo-url>
     git push -u origin main
     ```

2. **Deploy to Netlify.**
   - Log in to [Netlify](https://www.netlify.com/) and click **“Add new site” → “Import an existing project”**.
   - Choose **GitHub** and select the repository you just created.
   - For build settings, no build command is required; the **publish directory** is the project root (`/`). Netlify will automatically detect the `netlify.toml` and honour the SPA redirect.
   - Click **Deploy site**. After a few seconds the site will be live at a Netlify subdomain (you can later set up a custom domain if desired).

3. **Enable Netlify Identity and Git Gateway.** (required for the CMS at `/admin`)
   - In your Netlify site’s dashboard, go to **Site settings → Identity** and click **“Enable Identity”**.
   - Under **Identity → Settings and usage**, set **Registration** to **Invite only** (recommended) so only invited users can log in.
   - Click **Enable Git Gateway** to allow the CMS to commit changes to your GitHub repository on behalf of authenticated users.

4. **Invite yourself as a user.**
   - Under **Identity → Users**, click **“Invite users”** and enter your email address. You will receive an invitation email; follow the link to set your password.
   - Once logged in, you can visit `/admin` on your deployed site, log in with your new credentials, and edit content.

5. **Using the CMS (/admin).**
   - Navigate to `https://your-netlify-site.netlify.app/admin`.
   - Log in with the credentials you set via the invitation email.
   - You will see two collections: **Site Content** and **Facilities**. Edit the fields as needed and click **Save** and then **Publish**. The CMS will commit the changes directly to your GitHub repository and Netlify will automatically redeploy the site with the updated JSON files.

### Fallback editing (if Identity/Git Gateway is unavailable)

If Netlify Identity is not enabled you can still edit the `content` files directly through the GitHub web UI. Open `content/facilities.json` or `content/site.json` in GitHub, click the pencil icon to edit, make your changes, and commit them to the `main` branch. Netlify will redeploy automatically.

## Using Demo Admin Mode

The in‑app **Demo Admin Mode** allows quick edits to facilities during a live demo without committing changes back to the repository. To use it:

1. Navigate to **“Demo Admin”** in the top navigation.
2. Click **“Add Facility”** to create a new facility override. Fill in the fields. Changes are saved automatically in your browser’s `localStorage`.
3. Edit existing facilities by changing fields directly. Remove one by clicking the **×** button in the top right corner of the card.
4. **Export JSON** will download your overrides as a file; **Import JSON** will load a previously exported overrides file. **Reset Overrides** clears all overrides.

Edits made in Demo Admin Mode override the base facility data only on your device. To permanently change the source data for all users, use the CMS or edit `content/facilities.json` in the repository.

## Judge Demo Script (60–90 seconds)

1. **Open the site** at its Netlify URL on a mobile device or desktop.
2. From the landing page, click **“Start Check”**. Briefly mention the value proposition and how FlowCare uses symptoms, demo wait times and preferences to route patients.
3. **Create a profile** via the **Profile** tab. Enter age, postal code (e.g. `M5V 1A1`), language, mobility needs, etc., then save.
4. **Complete the triage wizard** under **Triage**: choose a complaint (e.g. “Injury”), set severity, red flags, duration, answer prompts and set preferences. At the final step click **Finish**.
5. **View the results**. Explain the recommended care setting (e.g. Urgent), show the ranked facility list with demo wait times, distance and capability tags. Point out the map with markers. Apply a filter such as “Shortest wait” or “Closest”.
6. Navigate to **Facilities** to see all demo entries.
7. Go to **Demo Admin**. Add a new facility or change a wait time. Note how the list updates instantly. Optionally export the overrides and show the JSON file.
8. (If time) Log into the CMS at `/admin` and edit a facility’s wait time or the landing page copy. Publish the change and note that Netlify will redeploy automatically.

## Accessibility & Compliance Notes

* Colour palette uses a high‑contrast forest green (`#2e6f40`) and off‑white background (`#faebd7`).
* All interactive elements have sufficient contrast and are keyboard‑navigable.
* The app clearly labels demo data with a “DEMO DATA” badge and states that wait times are not real‑time.
* Patient information is stored only on the client; no accounts are required and no PHI is sent to the server.
* Safety messages remind users to seek emergency care for red‑flag symptoms.
