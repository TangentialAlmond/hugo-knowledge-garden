<h1 align="center"> 🪴 Knowledge Garden Template 🪴 </h1>

This is a template for implementing reusable, static-first knowledge gardens in a Hugo-based website. It uses a semantic grid system to transform user-input data into interactive visual mindmaps.

For full architecture details, testing criteria, and maintenance practices, please refer to `docs/GARDEN.md`. I've implemented a live example of a knowledge garden [here](https://tangentialalmond.cc/garden/ml/).

## Table-of-contents
- [✅ Requirements](#-requirements)
- [🚀 Quick start](#-quick-start)
- [👩‍🌾 Managing a garden](#-managing-a-garden)
  - [🪴 Creating a garden](#-creating-a-garden)
  - [🪏 Updating a garden](#-updating-a-garden)
  - [🧨 Deleting a garden](#-deleting-a-garden)
- [🧪 Running tests](#-running-tests)

# ✅ Requirements

Before getting started, ensure you have the following installed on your local machine:

* **Go** (Required for Hugo Modules/Engines)
* **Hugo Extended Version** (Required for compiling TailwindCSS v3 and DaisyUI v4 asset pipelines)
* **Node.js & npm** (Required for running the Jest validation and testing suite)

# 🚀 Quick start

1. **Create Your Repository**<br>
Do not fork this repository. Instead, click the green **"Use this template"** button at the top of this GitHub page and select **"Create a new repository"**. This gives you a clean slate with your own commit history.

2. **Clone and Install**<br>
Clone your newly created repository to your local machine and install the development dependencies:
   ```bash
   git clone [https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git)
   cd YOUR-REPO-NAME
   npm install
   ```

# 👩‍🌾 Managing a garden
This template includes automated scripts to easily create, update and delete your gardens.

## 🪴 Creating a garden
1. Create the relevant directories and files. The `<name-of-garden>` must be in kebab-case.
   ```bash
   ./scripts/garden/create-garden.sh <name-of-garden>
   ```
   This automatically creates the folders and files you'll need for your garden.
   ```text
   content/
   └── garden/
       └── <name-of-garden>/
           └── index.md          <-- markdown with frontmatter for specific garden
    
    data/
   └── garden/
       └── <name-of-garden>/
           ├── nodes/            <-- stores one yaml file per node
           └── connections/      <-- stores edge list of connections between nodes
               ├── main.yaml
               └── detour.yaml
   ```

2. Update the title and description of the `content/garden/<name-of-garden>/index.md`, which looks something like:
     ```markdown
     ---
     title: "name-of-garden"
     description: "A new knowledge garden about name-of-garden"
     date: 2026-05-15T11:46:37+08:00                             <-- automatically generated
     draft: true                                                 <-- must be boolean
     garden: "name-of-garden"                                    <-- do NOT change
     layout: "single"                                            <-- do NOT change
     ---
     ```
     The garden field indicates the name of the subdirectory containing the `index.md` and the nodes/connections. The layout field indicates the garden template to use (`layouts/garden/single.html`). These two fields are automatically generated and should NOT be changed typically unless you are planning to change the garden name, etc.

3. To create each node, copy the `node-template.yaml`. The `<new-node-name>` must be in kebab-case.
   ```bash
   cp data/garden/node-template.yaml data/garden/<name-of-garden>/nodes/<new-node-name>.yaml
   ```
   The yaml file should look like:
   ```yaml
   id: "node-id"                <-- must match the name of the .yaml
   title: "Node Title"
   col: 1                       <-- grid coordinate for positioning the node (1 to 5)
   row: 1                       <-- grid coordinate for positoning the node
   asset: "plant-filename"      <-- asset name without SVG extension
   link: "/posts/slug-or-url"   <-- internal link to post or URL
   linkType: "internal"         <-- can be "external" or "internal"
   ```
   | Field | Description |
   |------|-------------|
   | id | Unique identifier in kebab-case |
   | title | Display label |
   | col | Grid column (1–5) |
   | row | Grid row (infinite) |
   | asset | SVG plant illustration from `asstes/art/garden/plants` without the `.svg` extension|
   | link | Destination URL<br>**For posts:** `/posts/<slug>`<br>**For external resources:** Full URL |
   | linkType | `internal` (posts) or `external` |

4. Provide the connections under `data/garden/<name-of-garden>/connections` in the `main.yaml` or `detour.yaml`. Connections in the `main,yaml` are nodes that are part of the main course, while connections in the `detour.yaml` are detours a user can take. What counts as a main course or detour is quite ambiguous for now and depends on my opinion. The `main.yaml` and `detour.yaml` are both edge lists which look something like:
   ```yaml
   - from: intro-to-ml     # id of the source node
     to: ml-crash-course   # id of the target node
   ```

5. Check if the garden has been set up correctly by running tests.
  ```bash
   npm run test
   ```

6. Launching the website at this point should show a garden in the landing page similar to the [ML Garden](https://tangentialalmond.cc/garden/ml/).

## 🪏 Updating a garden
There are a few things you might want to update in the garden:
- **Landing page:**<br>
  Edit the `content/garden/<name-of-garden>/index.md`

- **Adding new nodes and connections:**<br>
  Add nodes and connections following steps 3 and 4 in [Creating a garden](#creating-a-garden)

- **Deleting nodes and its connections:**<br>
  ```bash
  ./scripts/garden/delete-node.sh <name-of-garden> <id-of-node>
  ```

- **Pruning duplicated connections:**<br>
  ```bash
  ./scripts/garden/deduplicate-connections.sh <name-of-garden>
  ```

Check if the garden has been updated correctly by running tests:
```bash
npm run test
```

## 🧨 Deleting a garden
To delete a garden, run the following commend:
```bash
./scripts/garden/create-garden.sh <name-of-garden>
```
The script will check if the garden has any resources to delete and prompt you for a confirmation prior to deleting the garden across `content/garden` and `data/garden`.

# 🧪 Running tests
Data integrity is crucial for ensure the garden renders correctly. This template comes bundled with a test suite that catches missing frontmatter properties, broken internal links, non-existent assets, conflicting connections, etc. Further details are documented in `docs/GARDEN.md`.

Always run the test pipeline locally before deploying your site:
```bash
npm run test
```

**Compiling for production**<br>
If all tests pass perfectly, build your static production files for your website as per usual for example by running `hugo --gc --minify`.