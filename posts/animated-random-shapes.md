---
title: Animated Random Shapes
date: 2024-01-04
description: TODO
listed: false
---

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points"
        version="1.1" xmlns="http://www.w3.org/2000/svg"
    >
        <path class="stroke-indigo-500 fill-indigo-500/20">
            <animate id="random-points-animate" attributeName="d" dur="25s" repeatCount="indefinite"></animate>
        </path>
    </svg>
</div>

<script type="module" src="/blog-modules/posts/animated-random-shapes.mjs">
