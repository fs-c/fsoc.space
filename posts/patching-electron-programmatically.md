---
title: "Patching an Electron Application Programmatically"
date: 2022-09-08
description: Writing a small patcher to remove ads from an electron app with NodeJS.
---

__TL;DR__

1. Find `app.asar`
2. Extract it with `npx asar extract app.asar extracted/`,
3. Modify source code in `extracted/` as you please
4. Repackage the code with `npx asar pack extracted/ app.asar`

## Intro

My objective was to remove some annoying ads from the [OP.GG client](https://www.op.gg/desktop/), a companion application to a game I occasionaly play. Like many other modern applications, it is built using [electron](https://www.electronjs.org/). These applications use web technologies like JS, HTML and CSS on top of a thin browser, pretending to be a native application. 

The source code of electron applications is usually packaged inside `resources/app.asar` in the installation directory of the app. The `asar` file format is [open source](https://github.com/electron/asar) and well documented, it is a "simple extensive tar-like archive format with indexing". But more importantly, the package used to create these archives (see previous link) can also be used to extract their contents.

Choose an electron application, as mentioned I will use the OP.GG client, and find its `app.asar` file. For me this was the default directory, i.e. `resources/`, but you might have to poke around a bit. Open a terminal in that folder and run

```bash
$ npx asar extract app.asar extracted/
```

and you will find the source code behind the application. Depending on the complexity of the application and the extent to which the developers expended effort to keep their code private you will get varying results. For example, when unpacking Discord's `app.asar` I only found bootstrapping code. Perhaps I'll take a look at this in more detail in the future.

Back to OP.GG, and likely to what the majority of small to medium sized electron applications will look like.

![](https://i.imgur.com/ON4KZEJ.png)

Full client side source code, complete with comments in korean and everything.

## Go away, ads

Now to get to the initial objective, removing the advertisements. A quick search yielded the following snippet

```jsx
// ...

return (
    <>
        {/* ... render the application ... */}

        {!isOverlay &&
        <>
            {(!isNMP && playwireAds.includes(localRegion))
                ? <Ads/>
                : <>
                    {(adsenseAds.includes(localRegion))
                        ? <GlobalAds/>
                        : <>
                            {(nitropayAds.includes(localRegion) && adsense)
                            ? <KrAds/>
                            : <NoAds/>
                            }
                        </>
                    }
                </>
            }
            {isNMP &&
                <NMPAds/>
            }
        </>
        }
    </>
);
```

which is located in `App.tsx` and obviously responsible for showing different kinds of advertisements. Taking a look at the different kinds of `*Ads` arrays revealed

```js
const {isNMP} = require("./nmp");

export const playwireAds = isNMP ? [] : ["NA"];
export const nitropayAds = isNMP ? [] : ["KR"];
export const adsenseAds = isNMP ? [] : ["EUW", "BR", "LAN", "LA1", "LAS", "LA2", "EUNE",
    "JP", "OCE", "OC1", "TR", "RU", "TENCENT", "TW", "VN", "SG", "PH", "TH", "ID"];
```

So it looks like either setting `isNMP` to true or emptying out the array initializers would do the trick. I didn't want to set `isNMP` to true because I didn't know what it stood for and was used in many other parts of the application. (Also I would have had to deal with removing `<NMPAds/>`, see the JSX snippet.) Getting the arrays to be empty somehow would definitely do the trick, though. The fallback in case none of the arrays included `localRegion` is `<NoAds/>` which was exactly what I wanted.

But just changing the above snippet wouldn't work. This was already clear the moment I saw them using TypeScript, there had to be some transpilation process--the files I was looking at weren't what was actually running. 

Skimming over some of the bootstrapping code clued me in to what was going on. The `WindowProvider` in the file of the same name referenced `assets/react/react.html`, which in turn referenced `renderer.${hex code}.js`.

![](https://i.imgur.com/ixKDrhk.png)

The file was clearly the product of a build system ([parcel](https://parceljs.org/) to be specific, as seen from the `parcelRequire` definition). Some global searches told me that this was where the `.tsx` files I had been looking at earlier got built into--the build system kept export names intact. This is an important point, because it meant I could reliably find the `*Ads` exports from earlier inside the mangled file.

Here's the relevant part of the built file, demangled for readability and of course equivalent in functionality to the above snippet.

```js
const { isNMP: s } = require("./nmp"),
    e = s ? [] : ["NA"];
exports.playwireAds = e;
const r = s ? [] : ["KR"];
exports.nitropayAds = r;
const t = s ? [] : ["EUW", "BR", "LAN", "LA1", "LAS", "LA2", "EUNE",
    "JP", "OCE", "OC1", "TR", "RU", "TENCENT", "TW", "VN", "SG", "PH", "TH", "ID"];
exports.adsenseAds = t;
```

This file is what is actually getting executed, so I emptied out all the arrays. Repacking is as simple as extracting, just run

```bash
$ npx asar pack extracted/ app.asar
```

and replace the old `app.asar` with the one you just generated. This removed the advertisements. Success! Of course, I would have to do this every time the application was updated because the patches were applied in the built file, not in the config file itself. (The config file is probably changed very rarely, the built file will change for virtually every update.) So I started looking into...

## Automation

The asar library provided by electron is probably primarily intended to be used as a command line utility, but it also exports all of its functionality as a Node module. After having obtained the path to the `app.asar` file, one can now use it's functionality along with some custom patching code to extract, patch and repackage the found asar. 

```js
const asarPath = /* ... */;
const extractionPath = /* ... */;

await asar.extractAll(asarPath, extractionPath);
await patch(extractionPath);
await asar.createPackage(extractionPath, asarPath);
```

The `patch` function isn't complicated, it just looks for the file it is supposed to patch, reads its contents and runs some RegEx replaces over it. 

```js
const patch = async (unpackedPath) => {
    const reactPath = path.join(unpackedPath, '\\assets\\react\\');

    const rendererFile = (await fs.readdir(reactPath))
        .filter((e) => e.startsWith('renderer') && e.endsWith('.js'))[0];
    const rendererPath = path.join(reactPath, rendererFile);

    let renderer = await fs.readFile(rendererPath, { encoding: 'utf8' });

    renderer = renderer.replace(/Terms of Use/g, 'T3rms 0f Us3'); // :)

    // these are the strings used in renderer/utils/ads*.js
    // a more robust solution would be to look for the exports themselves and replace those
    renderer = renderer.replace(/\["NA","KR"\]/g, '[]');
    renderer = renderer.replace(/\["NA"\]/g, '[]');
    renderer = renderer.replace(/\["KR"\]/g, '[]');
    renderer = renderer.replace(/\["EUW","BR","LAN","LA1","LAS","LA2","EUNE","JP","OCE","OC1","TR","RU","TENCENT","TW","VN","SG","PH","TH","ID"\]/g, "[]");

    await fs.writeFile(rendererPath, renderer);
};
```

Then it's just a matter of making the file executable by adding

```js
#!/usr/bin/env node
```

at the top and amending the `package.json` to include a `bin` field like

```js
{
    // ...
    "bin": "src/index.mjs",
    // ...
}
```

After publishing, running the patcher is as convenient as

```bash
$ npx @fsoc/opgg-adblock
```

You can take a look at the final product over at [fs-c/opgg-adblock](https://github.com/fs-c/opgg-adblock).
