---
title: "Adding Live Reload to Dhow"
date: 2022-09-05
description: "So I added live reloading to dhow, why do I think this is such a big deal"
---

I recently implemented live reloading in [dhow](https://github.com/fs-c/dhow), a static site generator. When you run `dhow dev` and make a change inside the project folder, two things happen: The static site is rebuilt and, (this is the new feature) if it is currently open in a browser, the page is refreshed. Let me first show you how I did it, then I'll share some thoughts.

When you run `dhow dev`, the function [`buildDevelopment`](https://github.com/fs-c/dhow/blob/rewrite/src/cli.ts) is called, which starts a static server, builds the page and listens for changes, after which it rebuilds the page. The problem is, of course, figuring out how to communicate to the browser that it should reload the page when a rebuild is done. The first inspiration I got from a stackoverflow answer: Injecting some JS into the built pages to poll itself in some given interval and reload the page if it detected changes. (I can't find the relevant post anymore.)

This was a hacky solution that I was unhappy with, either you poll every couple of seconds and get an unresponsive development experience or you poll every couple hundred milliseconds and you hammer your server and lag your browser. I didn't like it. So, with the trivial solution out of the way, I turned to something else that I saw mentioned somewhere, but with which I had effectively no experience. Websockets! The idea is that you start a websocket server alongside your regular static file serving server and inject some code into every page that listens for a command to refresh. Essentially the first idea, but using more complex technology for better results.

In concrete terms (or concrete code I guess), I amended `buildDevelopment` to look something like

```js
// ...

import { WebSocketServer } from 'ws'

// ...

const buildDevelopment: DevelopmentBuild = async (/* ... */) => {
    // start static file server...

    const wss = new WebSocketServer({ port: 29231 })

    head.static = [
        new VNode('script', [], [`
            const socket = new WebSocket('ws://localhost:29231')
            socket.addEventListener('message', (event) => {
                if (event.data === 'reload') {
                    window.location.reload();
                }
            })
        `])
    ]

    watch('.', async (/* ... */) => {
        // build the thing...

        for (const client of wss.clients) {
            client.send('reload')
        }
    })
}
```

(Implementation details specific to dhow: `head` is basically a global store for stuff to be added to the `<head>` of pages, a `VNode` is a DOM element.)

Now the development workflow looked like this:

![](https://i.imgur.com/aeG0Nd7.gif)

__This was the serious part of the post, now some rambling.__ This stuff might not be particularly exciting if you're used to frameworks like [NextJS](https://nextjs.org/) (which have an even more advanced version, hot reload) but two things: My first encounter with hot reload was, probably when I first used [NextJS](https://nextjs.org/). And yeah sure, as someone who also works with compiled languages a lot, the iteration speed that I discovered to be possible is beyond what I could achieve with C++ or something. But more importantly (for me, at the time, but also generally I think) hitting save and immediately seeing your changes come to life feels magical. I remember when I discovered that hot reload worked on other devices too--i.e. when you open the locally hosted page on a smartphone or whatever. I was fascinated. I'm repeating myself, but making a change on my laptop and seeing it immediately on a smartphone and a different computer is really cool tech.

And it's not even particularly complicated. Granted, the tech that powers the hot reload of NextJS et al is vastly more complicated than what I implemented. But the general idea (hit save, see change) is like 15 lines of code and a websocket server. (Yes a websocket server is probably also very, very complicated but you don't need a fully featured one for this.) Maybe I'm just easily impressed or something, but this is kind of inspiring to me. Fascinating stuff doesn't have to be technically (technologically?) complex. This insight isn't worth much alone, but I still feel it comes to live nicely with this example.
