import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DATA_GARDEN_PATH = './data/garden';

describe('Garden Connection Integrity', () => {

  // Ensure the base path exists before proceeding
  if (!fs.existsSync(DATA_GARDEN_PATH)) {
    throw new Error(`Critical Error: Base path ${DATA_GARDEN_PATH} not found.`);
  }

  const gardens = fs.readdirSync(DATA_GARDEN_PATH)
    .filter(d => fs.statSync(path.join(DATA_GARDEN_PATH, d)).isDirectory());

  gardens.forEach(garden => {
    const nodesPath = path.join(DATA_GARDEN_PATH, garden, 'nodes');
    const connPath = path.join(DATA_GARDEN_PATH, garden, 'connections');

    describe(`Garden Integrity: ${garden}`, () => {
      // Explicit existence checks for required directories
      it('should have a nodes and connections directory', () => {
        expect(fs.existsSync(nodesPath), `Missing directory: ${nodesPath}`).toBe(true);
        expect(fs.existsSync(connPath), `Missing directory: ${connPath}`).toBe(true);
      });

      // Get valid IDs
      const validNodeIds = new Set(
        fs.existsSync(nodesPath) 
          ? fs.readdirSync(nodesPath).map(f => path.parse(f).name) 
          : []
      );

      const edgeSets = { main: new Set(), detour: new Set() };

      // Helper to extract unique nodes for each yaml file
      const getUniqueNodesFromFile = (fileName, edgeSet) => {
        const filePath = path.join(connPath, fileName);
        if (!fs.existsSync(filePath)) return [];

        const edges = yaml.load(fs.readFileSync(filePath, 'utf8')) || [];
        const nodesInFile = new Set();

        edges.forEach(edge => {
          nodesInFile.add(edge.from);
          nodesInFile.add(edge.to);
          edgeSet.add(`${edge.from}->${edge.to}`);
        });

        return [...nodesInFile];
      };

      // Report nodes that do not exist
      ['main.yaml', 'detour.yaml'].forEach(file => {
        const key = file.replace('.yaml', '');
        
        it(`reports ghost nodes in ${file}`, () => {
          const mentionedNodes = getUniqueNodesFromFile(file, edgeSets[key]);
          const ghostNodes = mentionedNodes.filter(id => !validNodeIds.has(id));

          expect(ghostNodes, 
            `The following nodes in ${file} do not exist in the nodes folder:\n${ghostNodes.join(', ')}`
          ).toHaveLength(0);
        });
      });

      // Cross-file Conflict Detection
      it('ensures no conflicting connections exist between main and detour', () => {
        const conflicts = [...edgeSets.main].filter(id => edgeSets.detour.has(id));

        expect(conflicts, 
          `Duplicate edges found across files:\n${conflicts.join('\n')}`
        ).toHaveLength(0);
      });
    });
  });
});