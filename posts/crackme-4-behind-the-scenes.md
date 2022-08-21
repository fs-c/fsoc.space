---
title: "CrackMe IV: Behind the Scenes"
date: 2022-08-19
description: I can see you! Reading the flag straight from the file. 
---

This is the ["Behind the Scenes"](https://app.hackthebox.com/challenges/301) challenge from hackthebox. The description reads

> After struggling to secure our secret strings for a long time, we finally figured out the solution to our problem: Make decompilation harder. It should now be impossible to figure out how our programs work!

Indeed, after opening the ELF binary in IDA and taking a look at `main`, it looks unusual.

```C
int __cdecl __noreturn main(int argc, const char **argv, const char **envp)
{
  struct sigaction s; // [rsp+10h] [rbp-A0h] BYREF
  unsigned __int64 v4; // [rsp+A8h] [rbp-8h]

  v4 = __readfsqword(0x28u);
  memset(&s, 0, sizeof(s));
  sigemptyset(&s.sa_mask);
  s.sa_handler = (__sighandler_t)segill_sigaction;
  s.sa_flags = 4;
  sigaction(4, &s, 0LL);
  BUG();
}
```

I decided to go another route and took a look at the strings embedded in the executable.

![](https://i.imgur.com/5iI23HL.png)

We can see what appears to be a usage message and another message that is probably passed to a `printf`-style function after entering the correct password. But taking a look at the section where these messages are stored,

![](https://i.imgur.com/wKMym4B.png)

trivially reveals the password and thus the flag. Yay?

## Conclusion

This one was a bit of a disappointment. The program uses signal handlers (see [`sigaction`](https://man7.org/linux/man-pages/man2/sigaction.2.html)), presumably to obfuscate control flow. The actual signal handler, `segill_sigaction` in the above snippet, looks complicated at first glance so it would have been a fun challenge to reverse how it works. Sadly while decompilation was hard (as promised), finding the flag wasn't.

I'm still in the process of setting up a proper debugging workflow for ELF binaries. I look forward to finding out how this obfuscation works once I get that done.
