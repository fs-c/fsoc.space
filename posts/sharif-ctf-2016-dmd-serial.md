---
title: "SUT CTF 2016: dMd & serial"
date: 2022-09-25
description: Writeups for two tasks from the Sharif University CTF 2016.
tags: [ctf]
---

Two challenges today, both from the Sharif University CTF 2016. I usually stick to one per post for ease of reference, but the first one didn't feel like it warranted it's own writeup so I tacked it on to a more interesting one.

## dMd

This is the `dMd` challenge which I got from [this collection](https://github.com/N4NU/Reversing-Challenges-List/blob/master/Baby/Sharif_University_CTF_2016_dMd/README.md) of reversing challenges.

Opening the single provided file in Binary Ninja reveals it to be an ELF binary. Taking look inside the `main` function shows that it takes some user input, hashes it with MD5 and (very crudely) compares it to a baked-in hash.

![](https://i.imgur.com/Vql4sQz.png)

The expected hash is trivially (if labourously) readable

```
780438d5b6e29db0898bc4f0225935c0
```

I decoded it using a [free online service](https://www.md5online.org/md5-decrypt.html).

## serial

This is the `serial` challenge, I got it from the same collection as the previous ones. Also like the previous one, the single provided file is an ELF binary.

But it is significantly less straightforward than its predecessor: Straight off the bat Binary Ninja warns of apparent non-code branches and the pseudocode generation seems off. (Note the checks on seemingly uninitialized variables.)

![](https://i.imgur.com/IUuFKhJ.png)

Taking a look at the disassembly reveals the supposed non-code branches to be obviously unreachable by the main code, I would have expected Binary Ninja to catch this.

![](https://i.imgur.com/dQMR6Fb.png)

That aside, the initial workings of the executable are straightforward. Like `dMd` it prompts the user for a key. It then calls `strlen` to ensure the length of the given key is `16`.

After this initial length check follows a pattern of

- ensure character at position `x` is `c`
- ensure character at position `n - x` is `some constant - c`

which is repeated eight time (as expected, for a total of 16 checks). Once this pattern is determined, working out the key is straightforward. I've found the graph view to be useful for this.

![](https://i.imgur.com/7faHwxS.png)

Small blocks are the first check, larger blocks the second one. Unreachable code is helpfully absent, and the structure is clearly visible.

A detail that tripped me up at first is the fact that the input string is stored on the stack, and thus in reverse order--the first character is at `byte [rbp - 0x200]`, the last one at `byte [rbp - 0x1f1]`.

## Conclusion

It was fun to do some reversing again, I got sidetracked with other projects in the past weeks. Still, as mentioned in the preface, the `dMd` challenge felt lackluster and uninspired--recovering the hash from the binary (ie. copying down the values) probably took me longer than the rest of the challenge combined.

The `serial` challenge was fun, I like that it forced me to not use the pseudocode views for the additional challenge. The input string being stored on the stack probably wasn't intended to make things harder, but I hadn't encountered it before so it added some spice.

Both challenges are rated `baby`-level by the guy who maintains the collection where I got them from, and for experienced reverse engineers they probably really are trivial. But at least the second one took me a bit to figure out. 
