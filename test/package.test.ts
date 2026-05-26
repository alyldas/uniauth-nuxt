import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface PackageExport {
  readonly types: string;
  readonly import: string;
}

interface PackageJson {
  readonly types: string;
  readonly files: readonly string[];
  readonly exports: Record<string, PackageExport>;
}

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

describe("package surface", () => {
  it("points package exports at existing dist files", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.files).toEqual(
      expect.arrayContaining([
        "dist/**/*.js",
        "dist/**/*.mjs",
        "dist/**/*.d.ts",
        "dist/**/*.d.mts",
      ]),
    );
    expect(packageJson.types).toBe("./dist/types.d.mts");
    expect(packageJson.exports).toEqual({
      ".": {
        types: "./dist/types.d.mts",
        import: "./dist/module.mjs",
      },
      "./server": {
        types: "./dist/runtime/server/utils/index.d.ts",
        import: "./dist/runtime/server/utils/index.js",
      },
      "./types": {
        types: "./dist/runtime/types.d.ts",
        import: "./dist/runtime/types.js",
      },
    });

    const exportTargets = [
      packageJson.types,
      ...Object.values(packageJson.exports).flatMap((exportEntry) => [
        exportEntry.types,
        exportEntry.import,
      ]),
    ];

    await Promise.all(
      exportTargets.map(async (target) => {
        await access(join(packageRoot, target.replace(/^\.\//, "")));
      }),
    );
  });

  it("loads the built public entrypoints", async () => {
    const moduleEntry = (await import("../dist/module.mjs")) as {
      default: unknown;
    };
    const serverEntry =
      (await import("../dist/runtime/server/utils/index.js")) as Record<
        string,
        unknown
      >;
    const typesEntry = (await import("../dist/runtime/types.js")) as Record<
      string,
      unknown
    >;

    expect(typeof moduleEntry.default).toBe("function");
    expect(typeof serverEntry.createUniAuthBackendClient).toBe("function");
    expect(typeof serverEntry.getUniAuthSession).toBe("function");
    expect(typeof serverEntry.requireUniAuthSession).toBe("function");
    expect(Object.keys(typesEntry)).toEqual([]);
  });

  it("does not ship the removed current-user API surface", async () => {
    const distFiles = await readDistTextFiles();
    const forbiddenTerms = [
      "currentUser",
      "useCurrentUser",
      "getUniAuthCurrentUser",
      "current-user",
    ];

    for (const file of distFiles) {
      const content = await readFile(file, "utf8");

      for (const term of forbiddenTerms) {
        expect(content, `${file} contains ${term}`).not.toContain(term);
      }
    }
  });
});

async function readPackageJson(): Promise<PackageJson> {
  return JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  ) as PackageJson;
}

async function readDistTextFiles(): Promise<string[]> {
  const distRoot = join(packageRoot, "dist");
  const files: string[] = [];
  const pending = [distRoot];

  while (pending.length > 0) {
    const directory = pending.pop();

    if (!directory) {
      continue;
    }

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        pending.push(path);
      } else if (/\.(?:[cm]?[jt]s|json)$/.test(entry.name)) {
        files.push(path);
      }
    }
  }

  return files;
}
