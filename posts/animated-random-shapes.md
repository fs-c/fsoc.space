---
title: Animated Random Shapes
date: 2024-21-07
description: Animating randomly generated (SVG) shapes for no good reason
tags: [art?]
---

Some time ago I wrote [Drawing Squiggly Lines](/words/drawing-squiggly-lines), which describes how to generate blobs with some aesthetic properties, in particular with a focus on dynamically generating background shapes. But every time I tried to use these dynamic shapes in a project I felt like I would prefer just having a static shape. This is mostly because random shapes just don't look great consistently, even when limiting the randomness substantially (and at some point you limit it so much that you might as well have not bothered with it in the first place).

But one area where it really doesn't matter if a shape doesn't look great once in a while is when when cycling through multiple in an animation (because it will soon be replaced anyways), in particular when a blur is applied (because you can't see it that well in the first place). So this post explores animated random shapes.

This idea is inspired by design elements such as

<div class="not-prose w-full grid grid-cols-2 gap-4">
    <img class="h-full" src="https://i.imgur.com/FTdMKnL.jpeg" />
    <img class="h-full"src="https://i.imgur.com/1yZsYXD.png">
</div>

both taken from [tiptap.dev](https://tiptap.dev), which motivated me to start experimenting with this. (Those shapes aren't animated, but I think it would be cool if they were, so I'm doing it.)

Because I used SVG path descriptions to describe blobs from the beginning, animating them is pretty simple with the SVG `animate` tag. Just have it animate the path `d` attribute (the path description), and throw in a large-ish number of pre-generated paths. (I use 20 here, it just has to be large enough that it doesn't obviously look like a cycle, and I don't want to regenerate them all the time to save resources.)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <svg class="w-full h-full dark:stroke-white"
        id="simple-single-animation"
        version="1.1" xmlns="http://www.w3.org/2000/svg"
    >
        <path class="stroke-indigo-500 fill-indigo-500/20">
            <animate id="simple-single-animation-animate" attributeName="d" dur="25s" repeatCount="indefinite"></animate>
        </path>
    </svg>
</div>

Okay, so that looks boring, but it moves. The following is three of these layered on top of each other, with slight opacity and some blurring applied through CSS. Also the radius and center are randomized slightly.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <svg class="w-full h-full dark:stroke-white"
        id="multiple-animation"
        version="1.1" xmlns="http://www.w3.org/2000/svg"
    >
    </svg>
</div>

That is pretty close to what I had in mind when I started this experimentation. I have some more ideas that I want to try out in regards to this, but since they go in a different direction I will reserve them for another post.

As always, if you want to know how this works in detail, just take a look at the source code of this page either through your devtools or through github.

<script type="module" src="/blog-modules/posts/animated-random-shapes.mjs">
