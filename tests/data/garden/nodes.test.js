import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DATA_GARDEN_PATH = './data/garden';
const NODE_TEMPLATE_PATH = './data/garden/node-template.yaml';
const ASSET_PATH = './assets/art/garden/plants';

const getRequiredNodeKeys = (templatePath) => {
  if (!fs.existsSync(templatePath)) return [];
  const nodeData = yaml.load(fs.readFileSync(templatePath, 'utf8'));
  return Object.keys(nodeData);
};



describe('Garden Node Validation', () => {
  const requiredKeys = getRequiredNodeKeys(NODE_TEMPLATE_PATH);
  const gardenDirs = fs.readdirSync(DATA_GARDEN_PATH)
    .filter(d => fs.statSync(path.join(DATA_GARDEN_PATH, d)).isDirectory());

  // Guard clause for template
  it('should have a valid node template', () => {
    expect(requiredKeys.length, "Node template is missing or empty").toBeGreaterThan(0);
  });

  gardenDirs.forEach(garden => {
    const nodesPath = path.join(DATA_GARDEN_PATH, garden, 'nodes');
    if (!fs.existsSync(nodesPath)) return;

    const nodeFiles = fs.readdirSync(nodesPath).filter(f => f.endsWith('.yaml'));
    
    // Tracking for duplication reporting (aside from linkType)
    const seenNodes = new Map();

    describe(`Garden: ${garden}`, () => {
      it.each(nodeFiles)('validates node file: %s', (nodeFile) => {
        const filePath = path.join(nodesPath, nodeFile);
        const node = yaml.load(fs.readFileSync(filePath, 'utf8'));
        const kebabRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        const fileNameWithoutExt = path.parse(nodeFile).name;

        // Check: Filename must be kebab-case
        expect(fileNameWithoutExt, 
          `Filename "${nodeFile}" must be kebab-case (lowercase, no underscores/spaces).`
        ).toMatch(kebabRegex);

        // Check: Filename must match the internal node.id
        expect(fileNameWithoutExt, 
          `Mismatch: Filename is "${fileNameWithoutExt}" but node.id is "${node.id}".`
        ).toBe(node.id);

        // Dynamic key check
        requiredKeys.forEach(key => {
          expect(node, `Node ${nodeFile} is missing key: ${key}`).toHaveProperty(key);
        });

        // Asset existence check
        const assetFile = `${node.asset}.svg`;
        const assetExists = fs.existsSync(path.join(ASSET_PATH, assetFile));
        expect(assetExists, `Asset ${assetFile} not found for node ${node.id}`).toBe(true);

        // Check if linkType is 'external' or 'internal'
        const validTypes = ['internal', 'external'];
          expect(validTypes, `Invalid linkType "${node.linkType}" in ${nodeFile}`).toContain(node.linkType);

        // Check if internal link exists
        if (node.linkType === 'internal') {
          const sanitizedLink = node.link.replace(/^\/|\/$/g, '');
          const internalPath = path.join(`./content/${sanitizedLink}.md`);
          const internalIndex = path.join(`./content/${sanitizedLink}/index.md`);
          const exists = fs.existsSync(internalPath) || fs.existsSync(internalIndex);
          expect(exists, `Internal link ${internalPath} does not exist`).toBe(true);
        }

        // Duplicate Field Detection
        // Create a signature of the node excluding 'linkType'
        const { linkType, ...rest } = node;
        const signature = JSON.stringify(rest);

        if (seenNodes.has(signature)) {
          const originalFile = seenNodes.get(signature);
          throw new Error(`Node ${nodeFile} is a duplicate of ${originalFile} (all fields match except linkType)`);
        }
        seenNodes.set(signature, nodeFile);
      });
    });
  });
});


describe('Garden Node Field Collision Detection', () => {
  const gardenDirs = fs.readdirSync(DATA_GARDEN_PATH)
    .filter(d => fs.statSync(path.join(DATA_GARDEN_PATH, d)).isDirectory());

  gardenDirs.forEach(garden => {
    const nodesPath = path.join(DATA_GARDEN_PATH, garden, 'nodes');
    if (!fs.existsSync(nodesPath)) return;

    const nodeFiles = fs.readdirSync(nodesPath).filter(f => f.endsWith('.yaml'));
    
    // Trackers for individual field values
    const fieldRegistry = {
      id: new Map(),     // node-id -> filename
      asset: new Map(),  // plant.svg -> filename
      coords: new Map(), // "col-row" -> filename
      link: new Map()    // /path/to/resource -> filename
    };

    describe(`Collision Checks for: ${garden}`, () => {
      nodeFiles.forEach(nodeFile => {
        const node = yaml.load(
          fs.readFileSync(path.join(nodesPath, nodeFile), 'utf8')
        );

        it(`checks for field collisions in ${nodeFile}`, () => {
          // ID Collision (Critical for SVG connections)
          if (fieldRegistry.id.has(node.id)) {
            expect.fail(`Duplicate ID "${node.id}" found in ${nodeFile}. Already used by ${fieldRegistry.id.get(node.id)}`);
          }
          fieldRegistry.id.set(node.id, nodeFile);

          // Coordinate Collision (Prevents plants overlapping on the grid)
          const coordKey = `${node.col}-${node.row}`;
          if (fieldRegistry.coords.has(coordKey)) {
            expect.fail(`Coordinate overlap [Col: ${node.col}, Row: ${node.row}] in ${nodeFile}. Occupied by ${fieldRegistry.coords.get(coordKey)}`);
          }
          fieldRegistry.coords.set(coordKey, nodeFile);

          // Link/Resource Duplication
          if (fieldRegistry.link.has(node.link)) {
            expect.fail(`Link "${node.link}" duplicated in ${nodeFile}. Already linked in ${fieldRegistry.link.get(node.link)}`);
          }
          fieldRegistry.link.set(node.link, nodeFile);
        });
      });
    });
  });
});