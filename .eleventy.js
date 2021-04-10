const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs/promises");
const htmlmin = require("html-minifier");
const markdownIt = require("markdown-it");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");


const INPUT_DIR = "src";
const OUTPUT_DIR = "_site";

// This will change both Eleventy's pathPrefix, and the one output by the
// vite-related shortcodes below. Double-check if you change this, as this is only a demo :)
const PATH_PREFIX = '/';

module.exports = function (eleventyConfig) {
  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);
  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // To Support .yaml Extension in _data
  // You may remove this if you can use JSON
  eleventyConfig.addDataExtension("yml", (contents) =>
    yaml.load(contents)
  );

  // Disable whitespace-as-code-indicator, which breaks a lot of markup
  const configuredMdLibrary = markdownIt({ html: true }).disable("code");
  eleventyConfig.setLibrary("md", configuredMdLibrary);
    
  /*
  Add date tags for Nunjucks
  */
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addFilter("readableDate", require("./utils/dates-filter.js") );

  // Read Vite's manifest.json, and add script tags for the entry files
  // You could decide to do more things here, such as adding preload/prefetch tags
  // for dynamic segments
  // NOTE: There is some hard-coding going on here, with regard to the assetDir
  // and location of manifest.json
  // you could probably read vite.config.js and get that information directly
  // @see https://vitejs.dev/guide/backend-integration.html
  eleventyConfig.addNunjucksAsyncShortcode("viteScriptTag", viteScriptTag);
  eleventyConfig.addNunjucksAsyncShortcode(
    "viteLegacyScriptTag",
    viteLegacyScriptTag
  );
  eleventyConfig.addNunjucksAsyncShortcode(
    "viteLinkStylesheetTags",
    viteLinkStylesheetTags
  );
  eleventyConfig.addNunjucksAsyncShortcode(
    "viteLinkModulePreloadTags",
    viteLinkModulePreloadTags
  );

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static");
  eleventyConfig.addPassthroughCopy("./src/admin");

  async function viteScriptTag(entryFilename) {
    const entryChunk = await getChunkInformationFor(entryFilename);
    return `<script type="module" src="${PATH_PREFIX}${entryChunk.file}"></script>`;
  }

  /* Generate link[rel=modulepreload] tags for a script's imports */
  async function viteLinkModulePreloadTags(entryFilename) {
    const entryChunk = await getChunkInformationFor(entryFilename);
    if (!entryChunk.imports || entryChunk.imports.length === 0) {
      console.log(
        `The script for ${entryFilename} has no imports. Nothing to preload.`
      );
      return "";
    }
    /* There can be multiple import files per entry, so assume many by default */
    /* Each entry in .imports is a filename referring to a chunk in the manifest; we must resolve it to get the output path on disk.
     */
    const allPreloadTags = await Promise.all(
      entryChunk.imports.map(async (importEntryFilename) => {
        const chunk = await getChunkInformationFor(importEntryFilename);
        return `<link rel="modulepreload" href="${PATH_PREFIX}${chunk.file}"></link>`;
      })
    );

    return allPreloadTags.join("\n");
  }

  async function viteLinkStylesheetTags(entryFilename) {
    const entryChunk = await getChunkInformationFor(entryFilename);
    if (!entryChunk.css || entryChunk.css.length === 0) {
      console.warn(`No css found for ${entryFilename} entry. Is that correct?`);
      return "";
    }
    /* There can be multiple CSS files per entry, so assume many by default */
    return entryChunk.css
      .map((cssFile) => `<link rel="stylesheet" href="${PATH_PREFIX}${cssFile}"></link>`)
      .join("\n");
  }

  async function viteLegacyScriptTag(entryFilename) {
    const entryChunk = await getChunkInformationFor(entryFilename);
    return `<script nomodule src="${PATH_PREFIX}${entryChunk.file}"></script>`;
  }

  async function getChunkInformationFor(entryFilename) {
    // We want an entryFilename, because in practice you might have multiple entrypoints
    // This is similar to how you specify an entry in development more
    if (!entryFilename) {
      throw new Error(
        "You must specify an entryFilename, so that vite-script can find the correct file."
      );
    }

    // TODO: Consider caching this call, to avoid going to the filesystem every time
    const manifest = await fs.readFile(
      path.resolve(process.cwd(), "_site", "manifest.json")
    );
    const parsed = JSON.parse(manifest);

    let entryChunk = parsed[entryFilename];

    if (!entryChunk) {
      const possibleEntries = Object.values(parsed)
        .filter((chunk) => chunk.isEntry === true)
        .map((chunk) => `"${chunk.src}"`)
        .join(`, `);
      throw new Error(
        `No entry for ${entryFilename} found in _site/manifest.json. Valid entries in manifest: ${possibleEntries}`
      );
    }

    return entryChunk;
  }

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  return {
    templateFormats: ["md", "njk", "html"],
    pathPrefix: PATH_PREFIX,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      // NOTE: These two paths are relative to dir.input
      // @see https://github.com/11ty/eleventy/issues/232
      includes: "_includes",
      data: "_data",
      layouts: "_layouts",
    },
  };
};
