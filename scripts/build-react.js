const fs = require("fs").promises;
const dedent = require("dedent");
const camelcase = require("camelcase");
const { promisify } = require("util");
const rimraf = promisify(require("rimraf"));
const svgr = require("@svgr/core").default;

console.log(svgr);

function svgToReact(svg, componentName) {
  return svgr(svg, { typescript: true }, { componentName });
}

const BASE_DIR = "./optimized";

console.log("Building React components...");

rimraf("./react/outline/*")
  .then(() => {
    return rimraf("./react/solid/*");
  })
  .then(() => {
    return Promise.all([
      fs.readdir(`${BASE_DIR}/solid`).then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ""), {
              pascalCase: true,
            })}`;
            return fs
              .readFile(`${BASE_DIR}/solid/${file}`, "utf8")
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`);
              })
              .then((component) => {
                const fileName = `${componentName}.tsx`;
                const content = component;
                return fs
                  .writeFile(`./react/solid/${fileName}`, content)
                  .then(() => fileName);
              });
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(
                fileName.replace(/\.tsx$/, ""),
                {
                  pascalCase: true,
                }
              )}`;
              return `export { default as ${componentName} } from './${fileName.replace(
                /\.tsx$/,
                ""
              )}'`;
            })
            .join("\n");

          return fs.writeFile("./react/solid/index.ts", exportStatements);
        });
      }),

      fs.readdir(`${BASE_DIR}/outline`).then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ""), {
              pascalCase: true,
            })}`;
            return fs
              .readFile(`${BASE_DIR}/outline/${file}`, "utf8")
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`);
              })
              .then((component) => {
                const fileName = `${componentName}.tsx`;
                const content = component;
                return fs
                  .writeFile(`./react/outline/${fileName}`, content)
                  .then(() => fileName);
              });
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(
                fileName.replace(/\.tsx$/, ""),
                {
                  pascalCase: true,
                }
              )}`;
              return `export { default as ${componentName} } from './${fileName.replace(
                /\.tsx$/,
                ""
              )}'`;
            })
            .join("\n");

          return fs.writeFile("./react/outline/index.ts", exportStatements);
        });
      }),
    ]);
  })
  .then(() => console.log("Finished building React components."));
