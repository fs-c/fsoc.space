---
title: "CrackMe II: Hacky Bird"
date: 2022-08-17
description: Solving a CrackMe wrapped in a well-known game.
---

You can get the file at [hackthebox](https://www.hackthebox.com/home/challenges/download/192). The program looks to be a clone of [Flappy Bird](https://flappybird.io/).

![](https://i.imgur.com/GIfSqy3.png)

My first instinct was to open the program in IDA, which didn't prove to be very useful since it is very large and would likely be very time consuming to fully reverse. The given description hints at beating the game to get the flag, presumably requiring a certain score. Thus I attached Cheat Engine and its debugger to the game, trying to find the memory address of the score counter. After just two iterations (first searching for 3 after getting 3 points, then searching for 0 right after starting a new round) I had found what I was looking for.

I then tried to freeze the value at some arbitrary very large number, and got the following screen.

![](https://i.imgur.com/dF497tt.png)

No dice, doesn't look useful. So there appeared to be some other mechanism at work, which made me want to investigate the relevant parts of the binary. Using the "Find out what writes to this address" functionality of the Cheat Engine debugger yielded a promising `inc` instruction.

![](https://i.imgur.com/K2IUDrj.png)

This instruction is followed immediately by a conditional jump based on `score <= 999`. So 999 seems to have some significance. Sure enough, freezing the score at 999 yields the flag.

## Conclusion

It was fun to use Cheat Engine again, I hadn't touched it in a long time. Its UI still feels clunky though.

I'm not super happy with how I solved it, in the end it was mostly guesswork based on some very incomplete static analysis. But at the same time I already have the flag, so I don't feel like reversing more.
