# Krazy Kobe website

Static generated website using [elevently](https://www.11ty.dev/), using [nunjucks](https://mozilla.github.io/nunjucks/)
as templating language.

## Usage

### Start development server

    npm run start

### Generate website

    npm run build

## Configuration

Modify the options in `.eleventy.js`.

```js
eleventyConfig.addGlobalData("proofi", "http://localhost:4200");
eleventyConfig.addGlobalData("opensea", "https://testnets.opensea.io");
eleventyConfig.addGlobalData("contract", "0x61C13Bd0bFCF27F432e0D07cF4E02c8949E8Cb68");
eleventyConfig.addGlobalData("network", "0x5");
eleventyConfig.addGlobalData("network_name", "goerli");
```

### NFTs

A list with available NFTs is configured in `_data`.

## Deployment

The repository contains GitHub actions to deploy the website to GitHub pages.
