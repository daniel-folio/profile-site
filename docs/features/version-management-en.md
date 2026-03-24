# 🎨 Design Version Management

This portfolio website features a robust **'Version Switching'** system that allows you to safely toggle between diverse UI themes and design versions in real-time.

This documentation explains the isolated design structure, how to switch versions via Strapi, and how easy it is to expand in the future.

---

## 📂 1. Directory Structure

**"Design components exist only in their respective version folders. Only shared elements are kept in `common`."**

By strictly isolating designs (v1, v2, etc.), we prevent CSS or code from clashing. This ensures that a change in Version 2 never accidentally breaks Version 1.

```plaintext
frontend/src/
├── app/                  # Routing Controllers (Page Logic)
│   ├── page.tsx          # Main Page (Decides whether to show V1 or V2)
│   ├── resume/page.tsx   # Resume Page
│   └── career-detail/page.tsx # Project Detail Page
│
└── components/           # UI Elements
    ├── common/           # Shared (Buttons, inputs, theme providers used by all)
    ├── v1/               # Version 1 (Classic / Light-mode oriented)
    │   ├── layout/       # v1-specific Header & Footer
    │   ├── pages/        # v1-specific Page Assemblies (HomePageClientV1, etc.)
    │   └── sections/     # v1-specific Blocks (Hero, Projects, etc.)
    │
    └── v2/               # Version 2 (Modern / Dark / Particle-motion oriented)
        ├── layout/       
        ├── pages/        
        ├── sections/     
        └── styles/       # v2-specific Styles (globals-v2.css)
```

## ⚙️ 2. How to Switch Versions

You can instantly toggle the entire site's look via the Strapi Admin without redeploying code.

1. **Log into Strapi Admin** (`http://localhost:1337/admin`).
2. Go to **Content Manager** -> **Site Settings** (Single Type).
3. Find the **`Portfolio Version`** field and enter the version key:
   - Enter `v1`: Triggers the **Classic UI**.
   - Enter `v2`: Triggers the **Modern UI**.
4. Click **Save**, and then crucially, click **Publish** to push the data live.
5. Refresh your website to see the layout mutation instantly.

## 🏗️ 3. How it Works (Under the Hood)

We moved from a complex `if/else` logic to a more standardized **"Version Map (Selector)"** approach.

* **Map Pattern**: We keep a simple list of versions paired with their components. This makes the code predictable and clean.
* **Real-time Updates**: Using `force-dynamic` (Next.js), the server checks for the latest backend settings on every visit. This eliminates the need for a server restart.
* **Smart URL Resolution**: The system automatically detects whether it's running on your local machine or a production server and connects to the correct Strapi address.

---

## 🛠️ 4. Future Scalability (Adding V3)

When you want to add a new **`v3`** design, **you don't have to touch a single line of existing V1 or V2 code.**

1. Create a `src/components/v3/` folder and develop your new design.
2. In each `app/` page file, just add a single line like `v3: PageV3` to the `VERSION_COMPONENTS` map.
3. Because previous code remains untouched, there is zero risk of regressions, and you can roll back to any version instantly.

> [!IMPORTANT]
> **API Permissions Notice**  
> If the design doesn't change after deployment, ensure that the `find` permission for `site-setting` is enabled in Strapi under `Settings > Roles > Public`. Without this, the frontend won't be able to fetch the version data.
