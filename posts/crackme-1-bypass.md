---
title: "CrackMe I: Bypass.exe"
date: 2022-08-16
description: Solving a very simple .NET CrackMe using dnSpy.
tags: [ctf]
---

I'm trying to solve (or work on) one reversing challenge on [HackTheBox](https://www.hackthebox.com/home/challenges/Reversing) every day, to work on my reversing knowledge. This is day one, with a very easy one: [Bypass.exe](https://www.hackthebox.com/home/challenges/download/114).

The given file is a .NET executable, which I discovered upon opening it with IDA. Probably not the best way to find out, but it works. I then switched to using dnSpy because, while IDA supports it, their decompiled IL code isn't very readable to me. DnSpy was much more comfortable to work with in this case.

The program starts out with

```cs
public static void 0()
{
    bool flag = global::0.1();
    bool flag2 = flag;
    if (flag2)
    {
        global::0.2();
    }
    else
    {
        Console.WriteLine(5.0);
        global::0.0();
    }
}
```

Here, `global::0.1` is clearly the authentication mechanism. If it returns true the program proceeds, if it is false we get some kind of message and the mechanism restarts. Looking at the disassembly of the function,

```cs
public static bool 1()
{
    Console.Write(5.1);
    string text = Console.ReadLine();
    Console.Write(5.2);
    string text2 = Console.ReadLine();
    return false;
}
```

...it looks like it always returns false? I have to admit, this confused me for a bit. At first I was considering that there might be some arcane way of reading the values of local variables from other places in the program flow and stuff like that. But this is a crackme, the program doesn't have to actually work.

So I started debugging the game under dnSpy, changing `flag2` to be true (something that could not be possible without external manipulation) and stepped into `global::0.2`.

```cs
public static void 2()
{
    string <<EMPTY_NAME>> = 5.3;
    Console.Write(5.4);
    string b = Console.ReadLine();
    bool flag = <<EMPTY_NAME>> == b;
    if (flag)
    {
        Console.Write(5.5 + global::0.2 + 5.6);
    }
    else
    {
        Console.WriteLine(5.7);
        global::0.2();
    }
}
```

At this point, the program asks for a "secret key" which is in `5.3` and trivially readable from the debugger. But knowledge of the key is not required in any case, since I again just set the if-condition to true.

This causes the flag to be printed out.

## Conclusion

When working with .NET: dnSpy > IDA.

Regarding the challenge: This felt a little too easy, getting IDA and dnSpy installed probably took more time than actually solving the challenge. But reversing unobfuscated IL code can only be so difficult, so I suppose this was to be expected. It was fun though.
