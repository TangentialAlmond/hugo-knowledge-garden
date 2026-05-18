import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const GARDEN_CONTENT_PATH = './content/garden';
const GARDEN_DATA_PATH = './data/garden';
const GARDEN_ARCHETYPE_PATH = './archetypes/garden.md';

/*
 * Dynamically extracts keys from the archetype frontmatter.
 * This ensures that if you add fields to your archetype later, 
 * the test automatically enforces them.
 */
const getRequiredKeys = (archetypePath) => {
  if (!fs.existsSync(archetypePath)) return [];
  const content = fs.readFileSync(archetypePath, 'utf8');
  const parts = content.split('---');
  if (parts.length < 3) return [];
  
  const archetypeData = yaml.load(parts[1]);
  return Object.keys(archetypeData);
};

// Helper to get gardens
const getGardens = () => {
  if (!fs.existsSync(GARDEN_CONTENT_PATH)) return [];
  return fs.readdirSync(GARDEN_CONTENT_PATH).filter((file) =>
    fs.statSync(path.join(GARDEN_CONTENT_PATH, file)).isDirectory()
  );
};

describe('Garden Index Schema Validation', () => {
  const requiredKeys = getRequiredKeys(GARDEN_ARCHETYPE_PATH);
  const gardens = getGardens();

  // Raise error for archetype if the requiredKeys is an empty array
  it('should have a valid archetype schema', () => {
    expect(requiredKeys.length, 
      `No keys found in ${GARDEN_ARCHETYPE_PATH}. Check if the file exists and has valid YAML frontmatter.`
    ).toBeGreaterThan(0);
  })

  it.each(gardens)('validates %s/index.md against archetype schema', (gardenDir) => {
    const indexPath = path.join(GARDEN_CONTENT_PATH, gardenDir, 'index.md');
    expect(fs.existsSync(indexPath)).toBe(true);

    const fileContent = fs.readFileSync(indexPath, 'utf8');
    const parts = fileContent.split('---');
    const data = yaml.load(parts[1]);

    // Ensure valid frontmatter delimiters
    expect(parts.length).toBeGreaterThanOrEqual(3);

    // Ensures every key defined in your archetype exists in the instance
    requiredKeys.forEach(key => {
      expect(data, `Field "${key}" is missing in ${gardenDir}/index.md`).toHaveProperty(key);
    });

    // Structural Constraint: Layout must be 'single'
    expect(data.layout).toBe('single');

    // Structural Constraint: Ensure the 'garden' field correctly points to a directory in data/garden/
    expect(data.garden).toBe(gardenDir);
    const dataDirExists = fs.existsSync(path.join(GARDEN_DATA_PATH, data.garden));
    expect(dataDirExists, `Associated data directory data/garden/${data.garden} not found`).toBe(true);

    // Ensures a boolean type for draft status if any
    if (data.hasOwnProperty('draft')) {
      expect(typeof data.draft).toBe('boolean');
    }

  });
});