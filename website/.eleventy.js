const fs = require("fs");

module.exports = function(eleventyConfig) {
  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("svg");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("documents");
  eleventyConfig.addPassthroughCopy(
    {"node_modules/ethers/dist/ethers.esm.min.js" : "js/ethers.js"}
  );

  eleventyConfig.addGlobalData("proofi", "http://localhost:4200");
  eleventyConfig.addGlobalData("opensea", "https://testnets.opensea.io");
  eleventyConfig.addGlobalData("contract", "0x61C13Bd0bFCF27F432e0D07cF4E02c8949E8Cb68");
  eleventyConfig.addGlobalData("network", "0x5");
  eleventyConfig.addGlobalData("network_name", "goerli");

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // 404 page in dev mode
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(fs.readFileSync("../_site/404.html"));
          res.end();
        });
      }
    }
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html
    templateFormats: [
      "njk",
      "html",
    ],

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "../_site"
    }
  };
};
