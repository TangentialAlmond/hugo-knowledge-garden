<h1 align='center'> 🌸 Generic Garden System 🌸 </h1>

The Garden System is a reusable static-site visualization framework for creating handcrafted “knowledge gardens” within a Hugo-based website.

A garden represents knowledge as a visual mindmap where:
- nodes represent resources
- curved SVG paths represent relationships
- layout is based on a **semantic grid system (col/row)** rather than pixel coordinates
- users can explore interconnected ideas spatially

The system is intentionally:
- static-first
- manually curated
- lightweight
- reusable across multiple domains

Example gardens:
- ML Garden (machine learning concepts)

## 📋 Table-of-contents
- [🧰 Oranization and architecture](#-oranization-and-architecture)
  - [🗂️ File organization](#️-file-organization)
  - [🚦 System architecture](#-system-architecture)
  - [🎨 Design choices](#-design-choices)
  - [🌠 Asset design](#-asset-design)
  - [🧪 Tests](#-tests)
  - [🚧 Roadmap](#-roadmap)
- [👩‍🌾 Managing a garden](#-managing-a-garden)
  - [🪴 Creating a garden](#-creating-a-garden)
  - [🪏 Updating a garden](#-updating-a-garden)
  - [🧨 Deleting a garden](#-deleting-a-garden)

# 🧰 Oranization and architecture
## 🗂️ File organization
The following is the file organization with the `ml` garden as an example.

```text
archetype
└── garden.md                 <-- template for content/garden/<name-of-garden>/index.md

assets/
├── css/
│   └── garden.css            <-- default garden dimensions and design
│
├── js/
│   └── garden.js             <-- renders nodes and connections
│
└── art/                      <-- reusable art assets
    └── garden/
        └── plants/           <-- node SVGs

content/
└── garden/                   <-- master directory for learning gardens
    └── ml/
        └── index.md          <-- markdown with frontmatter for specific garden

docs
└── GARDEN.md                 <-- Guide for generic garden system

data/
└── garden/
    ├── node-template.yaml    <-- template for node yaml
    └── ml/
        ├── nodes/            <-- stores one yaml file per node
        └── connections/      <-- stores edge list of connections between nodes
            ├── main.yaml
            └── detour.yaml

layouts/
├── garden/
│   └── single.html           <-- template for garden page
└── _partials/
    └── garden.html           <-- reusable garden page-specific component

scripts/
└── garden                    <-- scripts for garden management
    ├── create-garden.sh
    ├── deduplicate-connections.sh
    ├── delete-garden.sh
    └── delete-node.sh

tests                          <-- tests for garden
└── data
    └── garden
        ├── connections.test.js
        ├── index.test.js
        └── nodes.test.js
```

## 🚦 System architecture

```text
YAML (nodes + connections)
        ↓
Hugo aggregation layer (partials)
        ↓
Grid-to-pixel transformation (JS using CSS and SVGs)
        ↓
SVG Bézier path rendering
        ↓
DOM node positioning
```

## 🎨 Design choices
The layout of the garden is based on a grid system, where the settings are in the `garden.css`. The default is a 5-column grid with infinite vertical rows and spacing handled by the renderer (`garden.js`). The number of rows is rendered based on the maximum number of rows required for the nodes.

Nodes and connections are manually decided upon by the author of the garden. Nodes have individual `.yaml` files while connections are stored separately as edge lists based on whether they describe the main course or detours. These information are separated over different `.yaml` files for long-term maintainability. For example, many nodes could be added over time and parsing a single `.yaml` file with all nodes and conenctions would be quite challenging and potentially introduces accidental changes. Changes to smaller files, in contrast, are easier to track with `git diff`, making backtracking to earlier versions easier too.

The node `.yaml` files contain the location of the node as `col` (1 to 5) and `row` (1 to whatever the author requires) in the grid. These grid coordinates are converted to pixel coordinates by `gridToPixel` in `garden.js` which is then used for positioning the plant SVGs and calculating the Bezier anchor points.

The connection `.yaml` files are edge lists that use the pixel coordinates of the nodes to create quadratic Bezier curves as SVGs using `createBezierPath` in `garden.js`. Main connections are solid lines, while detours are dotted lines.

Altogether, authors can create gardens that can scale to the number of nodes and viewers of the garden have an interactive mindmap they can navigate to find resources of interest by simply clicking the nodes.

## 🌠 Asset design
Nodes are reprsented as plants to mimic a digital garden. The plants must be in SVG format so that the plant can be scaled easily without loss in resolution. To keep the effort low-cost/free, I plan to use Inkscape to draw the plants and export them as SVG. I intend to draw the plants (and possibly fungi) based on the plants I've seen in Singapore.

## 🧪 Tests
<span style='color:red'>**PLACEHOLDER FOR TEST OVERVIEW**</span>

## 🚧 Roadmap
- [x] Issue 1: Create one working garden<br>
  - The garden will focus on my learning journey through machine learning with nodes leading to both internal (blog posts on log loss and the F1-score) and external resources (Google's Introduction to ML and ML Crash Course).
  - The garden page displays the title "ML Garden", a succinct description and the garden itself with the four nodes and their connections. The nodes will use placeholder SVGs for plants from [Free SVG repo](https://www.svgrepo.com/).
  - [x] Set up the files for generic gardens including the guide/roadmap (this document)

- [x] Issue 2: Polish up aesthetics of the garden
  - [x] Add a title to the window to indicate the name of the garden as if the window were a tab in a browser
  - [x] Make the garden a vertically scrollable window of maxium 5 rows by 5 columns and the width of the window should fit medium to large screens
  - [x] Add a legend indicating that solid paths are the main course and dotted paths are the detours
  - [x] Legend should appear over the node
  - [x] Set up the frontmatter of the `index.md` to trigger 'draft' mode, where the row and col numbers are visible for each tile in the grid

- [x] Issue 3: Set up tests
  - [x] check the `content/garden/<name-of-garden>/index.md` for
    - missing fields
    - `garden` field not mapping to an existing directory in `data/garden/`
    - `layout` is not `"single"`.
  - [x] check the node `.yaml` files for:
    - missing fields
    - non-existent `asset`
    - `link` that cannot be found
    - report any nodes with matching `.yaml` fields (aside from the `linkType`)
  - [x] check the connection `.yaml` files for:
    - nodes that do not exist
    - conflicting connections found in `main.yaml` and `detour.yaml`

- [x] Issue 4: Set up scripts for automating garden management
  - [x] garden creation
  - [x] garden deletion
  - [x] node deletion
  - [x] de-duplication of edge entries in connections

- [ ] Issue 5: Prepare a template version of the garden system
  - [ ] Create a `git` branch of the [phone-hugo-blog repo](https://github.com/TangentialAlmond/phone-hugo-blog)
  - [ ] Draft a guide for setting up the garden closely based on this document
  - [ ] Follow and edit the guide to set up a template version of the garden system
  - [ ] Push to GitHub

- [ ] Issue 6: Personalize the ML Garden
  - [ ] Create 1 tree SVG and 1 non-tree SVG in Inkscape
  - [ ] Update the 4 nodes in the ML Garden to use the new SVGs and test if nodes have been updated correctly
  - [ ] Add 'GARDENS' to the menu of the blog linking to `tangentialalmond.cc/gardens` and the index for the page should be cards leading to the gard

# 👩‍🌾 Managing a garden
## 🪴 Creating a garden
1. Create the relevant directories and files. The `<name-of-garden>` must be in kebab-case.
   ```bash
   # In the blog directory
   ./scripts/garden/create-garden.sh <name-of-garden>
   ```
   This command creates the following:
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
   # In the blog directory
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
   # In the blog directory
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
  # In the blog directory
  ./scripts/garden/delete-node.sh <name-of-garden> <id-of-node>
  ```

- **Pruning duplicated connections:**<br>
  ```bash
  # In the blog directory
  ./scripts/garden/deduplicate-connections.sh <name-of-garden>
  ```

Check if the garden has been updated correctly by running tests:
```bash
# In the blog directory
npm run test
```

## 🧨 Deleting a garden
To delete a garden, run the following commend:
```bash
# In the blog directory
./scripts/garden/create-garden.sh <name-of-garden>
```
The script will check if the garden has any resources to delete and prompt you for a confirmation prior to deleting the garden across `content/garden` and `data/garden`.