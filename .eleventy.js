module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('admin');

  return {
    templateFormats: [
      'html',
      'md',
      'njk',
      'css',
      'jpeg',
      'jpg',
      'njk',
      'png',
      'svg',
      'txt',
      'yml',
    ],
    // templateFormats: ["md", "njk", "html", "liquid"],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    // dataTemplateEngine: "njk",
    // passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: '_output',
    },
  };
};
