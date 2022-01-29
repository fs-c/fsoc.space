---
title: Clean code (working title)
date: 2021-04-29
description: TODO
listed: false
---

https://enos.itcollege.ee/~jpoial/oop/naited/Clean%20Code.pdf

## Vertical Ordering

"(...) a function that is called should be below a function that does the calling."

Not possible (in a nice way) in many languages and generally not very useful. The opposite (bottom-up) provides basically equal readability but works for more languages. Agree with the core statement of keeping related functions close together but dislike the Java-centric view.

## Horizontal Openness

It's suggested to use white space "to accentuate the precedence of operators". As in `return b*b - 4*a*c;` vs `return b * b - 4 * a * c`. I wouldn't do that. Relying on operator precedence in a situation where some horizontal space can significantly alter readability is probably not a good idea in any case, just use braces and there will never be any confusion `return (b * b) - (4 * a * c)`.

## Data/Object Anti-Symmetry

Not sure I understood that properly, might be worth doing an example. P. 95.

## Typos

p. 110, peristentStore
p. 128, turnOnLoTempAlarmAtThreashold
p. 139, SRP is one of the more important concept in OO...

202
