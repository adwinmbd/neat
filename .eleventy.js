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
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: '_output',
    },
  };
};
