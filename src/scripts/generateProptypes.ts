import * as path from "path";
import glob from "fast-glob";
import * as fse from "fs-extra";
import * as ttp from "typescript-to-proptypes";
// import * as ttp from "../ts-pt";
import * as prettier from "prettier";
import * as _ from "lodash";
const os = require("os");

const { flatten } = _;

const fixBabelIssuesRegExp = new RegExp(/(?<=(\/>)|,)(\r?\n){2}/g);
function fixBabelGeneratorIssues(source: string) {
  return source.replace(fixBabelIssuesRegExp, "\n");
}

function sortBreakpointsLiteralByViewportAscending(a: ttp.LiteralNode, b: ttp.LiteralNode) {
  // default breakpoints ordered by their size ascending
  const breakpointOrder: unknown[] = ['"xs"', '"sm"', '"md"', '"lg"', '"xl"'];

  return breakpointOrder.indexOf(a.value) - breakpointOrder.indexOf(b.value);
}
// Custom order of literal unions by component
const getSortLiteralUnions: ttp.InjectOptions["getSortLiteralUnions"] = (component, propType) => {
  if (
    component.name === "Hidden" &&
    (propType.name === "initialWidth" || propType.name === "only")
  ) {
    return sortBreakpointsLiteralByViewportAscending;
  }

  return undefined;
};

const useExternalPropsFromInputBase = [
  "autoComplete",
  "autoFocus",
  "color",
  "defaultValue",
  "disabled",
  "endAdornment",
  "error",
  "id",
  "inputProps",
  "inputRef",
  "margin",
  "maxRows",
  "minRows",
  "name",
  "onChange",
  "placeholder",
  "readOnly",
  "required",
  "rows",
  "startAdornment",
  "value",
];

enum GenerateResult {
  Success,
  Skipped,
  NoComponent,
  Failed,
  TODO,
}

const todoComponents: string[] = [];

const __dirname = path.resolve(path.dirname(""));
// console.log("__dirname", __dirname);

const allFiles = async () =>
  Promise.all(
    [path.resolve(__dirname, "src/components")].map(async (folderPath) => {
      const g = glob("src/**/*.{ts,tsx,d.ts}");
      // {
      //   absolute: true,
      //   cwd: folderPath,
      // }
      return g;
    }),
  );

const a = allFiles().then((files) => {
  const result = flatten(files)
    // Filter out files where the directory name and filename doesn't match
    // Example: Modal/ModalManager.d.ts
    .filter((filePath) => {
      const folderName = path.basename(path.dirname(filePath));
      const fileName = path.basename(filePath).replace(/(\.d\.ts|\.tsx|\.ts)/g, "");

      return fileName === folderName;
    });
  return result;
});

const run = async () => {
  a.then((files) => {
    const tsconfig = ttp.loadConfig(
      path.resolve(__dirname, "./src/scripts/tsconfig.generate.json"),
    );
    // May not be able to understand all files due to mismatch in TS versions.
    // Check `programm.getSyntacticDiagnostics()` if referenced files could not be compiled.
    const program = ttp.createProgram(files, tsconfig);
    // console.log("program", program);

    const promises = files.map<Promise<GenerateResult>>(async (tsFile) => {
      const componentName = path.basename(tsFile).replace(/(\.d\.ts|\.tsx|\.js)/g, "");

      if (todoComponents.includes(componentName)) {
        return GenerateResult.TODO;
      }

      const sourceFile = tsFile.includes(".d.ts") ? tsFile.replace(".d.ts", ".js") : tsFile;
      return generateProptypes(program, sourceFile, tsFile);
    });
    console.log("promises", promises);
  });
};

async function generateProptypes(
  program: ttp.ts.Program,
  sourceFile: string,
  tsFile: string = sourceFile,
): Promise<GenerateResult> {
  const proptypes = ttp.parseFromProgram(tsFile, program, {
    shouldResolveObject: ({ name }) => {
      if (name.toLowerCase().endsWith("classes") || name === "theme" || name.endsWith("Props")) {
        return false;
      }
      return undefined;
    },
    checkDeclarations: true,
  });

  if (proptypes.body.length === 0) {
    return GenerateResult.NoComponent;
  }

  // proptypes.body.forEach((component) => {
  //   component.types.forEach((prop) => {
  //     if (
  //       !prop.jsDoc ||
  //       (ignoreExternalDocumentation[component.name] &&
  //         ignoreExternalDocumentation[component.name].includes(prop.name))
  //     ) {
  //       prop.jsDoc = "@ignore";
  //     }
  //   });
  // });

  const sourceContent = await fse.readFile(sourceFile, "utf8");

  const isTsFile = /(\.(ts|tsx))/.test(sourceFile);

  // const unstyledFile = getUnstyledFilename(tsFile, true);

  // const generatedForTypeScriptFile = sourceFile === tsFile;

  const result = ttp.inject(proptypes, sourceContent, {
    // disablePropTypesTypeChecking: generatedForTypeScriptFile,
    removeExistingPropTypes: true,
    babelOptions: {
      filename: sourceFile,
    },
    comment: [
      "-------------- !!!! --------------",
      "These PropTypes are generated",
      'Update TypeScript types and run "yarn proptypes"',
      "-------------- !!!! --------------",
    ].join("\n"),

    getSortLiteralUnions,
    reconcilePropTypes: (prop, previous, generated) => {
      const usedCustomValidator = previous !== undefined && !previous.startsWith("PropTypes");
      const ignoreGenerated =
        previous !== undefined &&
        previous.startsWith("PropTypes /* @typescript-to-proptypes-ignore */");
      console.log("prop, previous, generated", prop, previous, generated);
      // @ts-ignore
      // console.log('prop', prop?.propType);

      if (
        ignoreGenerated &&
        // `ignoreGenerated` implies that `previous !== undefined`
        previous!
          .replace("PropTypes /* @typescript-to-proptypes-ignore */", "PropTypes")
          .replace(/\s/g, "") === generated.replace(/\s/g, "")
      ) {
        throw new Error(
          `Unused \`@typescript-to-proptypes-ignore\` directive for prop '${prop.name}'.`,
        );
      }

      if (usedCustomValidator || ignoreGenerated) {
        // `usedCustomValidator` and `ignoreGenerated` narrow `previous` to `string`
        return previous!;
      }

      return generated;
    },
    shouldInclude: ({ component, prop }) => {
      if (prop.name === "children") {
        return true;
      }
      let shouldDocument;

      prop.filenames.forEach((filename) => {
        const isExternal = filename !== tsFile;
        // const implementedByUnstyledVariant = filename === unstyledFile;
        if (!isExternal) {
          shouldDocument = true;
        }
      });

      const { name: componentName } = component;
      // if (
      //   useExternalDocumentation[componentName] &&
      //   (useExternalDocumentation[componentName] === "*" ||
      //     useExternalDocumentation[componentName].includes(prop.name))
      // ) {
      //   shouldDocument = true;
      // }

      return shouldDocument;
    },
  });
  console.log("result", result);
  if (!result) {
    return GenerateResult.Failed;
  }

  // console.log('path.join(__dirname, "./src/scripts/prettier.config.js")', path.join(__dirname, "./src/scripts/prettier.config.js"))

  const prettierConfig = prettier.resolveConfig.sync(process.cwd(), {
    config: path.join(__dirname, "./src/scripts/prettier.config.js"),
  });

  const prettified = prettier.format(result, {
    ...prettierConfig,
    filepath: sourceFile,
  });

  const formatted = fixBabelGeneratorIssues(prettified);
  const correctedLineEndings = fixLineEndings(sourceContent, formatted);
  function getLineFeed(source: string) {
    const match = source.match(/\r?\n/);
    return match === null ? os.EOL : match[0];
  }
  function fixLineEndings(source: string, target: string) {
    return target.replace(/\r?\n/g, getLineFeed(source));
  }

  await fse.writeFile(sourceFile, correctedLineEndings);
  return GenerateResult.Success;
}

run();
