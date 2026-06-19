// Reads source files and checks import statements to enforce architectural rules.
// These tests fail if the implementation violates layer boundaries.
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "../../src");

function readSourceOrSkip(relativePath: string): string {
  const fullPath = path.join(SRC, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Source file not found: ${relativePath}\nRun /tdd-tests-to-code first to generate the implementation.`,
    );
  }
  return fs.readFileSync(fullPath, "utf-8");
}

function getImports(source: string): string[] {
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

const isHonoImport = (i: string) =>
  i === "hono" || i.startsWith("hono/") || i.startsWith("@hono/");

const isDbImport = (i: string) =>
  i.includes("lib/db") || i === "@prisma/client";

const isCrossModuleImport = (currentModule: string) => (i: string) => {
  // matches src/modules/<other-module>/... in a relative import
  const match = i.match(/modules\/([\w-]+)/);
  return match !== null && match[1] !== currentModule;
};

// ─── users.routes.ts ─────────────────────────────────────────────────────────

describe("users.routes.ts — layer boundaries", () => {
  let source: string;

  beforeAll(() => {
    source = readSourceOrSkip("modules/users/users.routes.ts");
  });

  test("does not import directly from users.repository", () => {
    const forbidden = getImports(source).filter((i) =>
      i.includes("users.repository"),
    );
    expect(forbidden).toEqual([]);
  });

  test("does not import from lib/db (no direct DB access in routes)", () => {
    const forbidden = getImports(source).filter(isDbImport);
    expect(forbidden).toEqual([]);
  });

  test("does not import from another feature module", () => {
    const forbidden = getImports(source).filter(isCrossModuleImport("users"));
    expect(forbidden).toEqual([]);
  });
});

// ─── users.service.ts ────────────────────────────────────────────────────────

describe("users.service.ts — layer boundaries", () => {
  let source: string;

  beforeAll(() => {
    source = readSourceOrSkip("modules/users/users.service.ts");
  });

  test("does not import from hono", () => {
    const forbidden = getImports(source).filter(isHonoImport);
    expect(forbidden).toEqual([]);
  });

  test("does not import from lib/db (service must not access DB directly)", () => {
    const forbidden = getImports(source).filter(isDbImport);
    expect(forbidden).toEqual([]);
  });

  test("does not import from another feature module", () => {
    const forbidden = getImports(source).filter(isCrossModuleImport("users"));
    expect(forbidden).toEqual([]);
  });
});

// ─── users.repository.ts ─────────────────────────────────────────────────────

describe("users.repository.ts — layer boundaries", () => {
  let source: string;

  beforeAll(() => {
    source = readSourceOrSkip("modules/users/users.repository.ts");
  });

  test("does not import from hono (repository is framework-agnostic)", () => {
    const forbidden = getImports(source).filter(isHonoImport);
    expect(forbidden).toEqual([]);
  });

  test("does not import from another feature module", () => {
    const forbidden = getImports(source).filter(isCrossModuleImport("users"));
    expect(forbidden).toEqual([]);
  });
});

// ─── app.ts ──────────────────────────────────────────────────────────────────

describe("app.ts — composition root only, no business logic", () => {
  let source: string;

  beforeAll(() => {
    // app.ts already exists; this test enforces it stays clean as the codebase grows
    source = readSourceOrSkip("app.ts");
  });

  test("does not import from any repository file", () => {
    const forbidden = getImports(source).filter((i) =>
      i.includes(".repository"),
    );
    expect(forbidden).toEqual([]);
  });

  test("does not import directly from lib/db", () => {
    const forbidden = getImports(source).filter(isDbImport);
    expect(forbidden).toEqual([]);
  });
});

// ─── Cross-module import scan (future-proofing) ───────────────────────────────

describe("all module files — no cross-module imports", () => {
  test("no file in modules/users/ imports from modules/orders/ or other modules", () => {
    const usersDir = path.join(SRC, "modules/users");
    if (!fs.existsSync(usersDir)) {
      throw new Error(`${usersDir} not found — run /tdd-tests-to-code first`);
    }

    const violations: string[] = [];
    for (const file of fs.readdirSync(usersDir)) {
      if (!file.endsWith(".ts")) continue;
      const content = fs.readFileSync(path.join(usersDir, file), "utf-8");
      const bad = getImports(content).filter(isCrossModuleImport("users"));
      if (bad.length > 0) violations.push(`${file}: ${bad.join(", ")}`);
    }

    expect(violations).toEqual([]);
  });
});
