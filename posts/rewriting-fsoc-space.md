---
title: Rewriting fsoc.space
date: 2021-04-29
description: TODO
listed: false
---



## Refactoring the archive (`/files`)

Basically, I have a bunch of files that I want to have available online. I also want those files to
- be "searchable" in the sense of there being an easy to navigate index.
- have a "nice-looking" URL (`https://raw.githubusercontent.com/fs-c/files/archive/docs/c_programming_language.pdf` is not nice-looking but `https://fsoc.space/files/docs/c_programming_language.pdf` is)
- not be in the main `fsoc.space` repository in the sense that they shouldn't be downloaded by default when someone clones it.

There should be an index page for every directory with and entry for every file and directory in it. An index entry should
- link to the resource
- contain the name, date of last change and file size (the latter two only apply to files)

Entries should be sorted by type (directory, file) and then by name.
