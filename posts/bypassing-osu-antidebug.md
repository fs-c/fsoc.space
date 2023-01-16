---
title: "Bypassing osu! Anti-Debug"
date: 2023-01-11
description: 
---

Since the last time I've looked at it, [osu!](https://osu.ppy.sh/home) has received some anti-cheat improvements with new anti-debugging measures among them. Most of them are bypassed just fine by [ScyllaHide](https://github.com/x64dbg/ScyllaHide), but at least one isn't. For each new process that is started, osu! calls [`GetFileVersionInfo`](https://learn.microsoft.com/en-us/windows/win32/api/winver/nf-winver-getfileversioninfoa) and checks the executable description against a blacklist. I found the process of discovering and bypassing this interesting enough to be worth sharing.

First, let me establish what we're working with. Osu! is written in C# and the binaries are obfuscated heavily, I wasn't able to decompile them to something readable in a reasonable amount of time. So I figured this would be an interesting exercise in dynamic analysis. The binary on disk is a black box, I only looked at what is happening at runtime. The symptom we are looking to alleviate: Osu will immediately close itself if it detects that a debugger is running.

The first thing that came to my mind was to (blindly) hook some Windows APIs that I suspected osu! might use to detect that a debugger is running, for example `EnumWindows` to read window titles. I can't think of all of them anymore, but nothing I tried worked. Really, what I wanted was to hook _all_ Windows APIs. After some searching I ended up with [API Monitor](http://www.rohitab.com/apimonitor) from rohitab, which appears to do exactly that. It's important to note that the osu! executable is only a launcher for the real game, so API Monitor needs to be attached after full startup. I also had to change the monitoring method when attaching to processes to "Remote Thread (Extended)".

When selecting all supported APIs, this will log _a lot_ of calls and significantly slow down execution of the monitored program. I played around with this for a little and ended up purposefully triggering the shutdown by opening x64dbg. As expected, we see API calls in reaction to this originating from osu!auth.dll, which appears to contain the anti-debug logic. 

![](https://i.imgur.com/aeGbPWh.png)

This just initializes a string with the program that was just started, but taking a look at the stack reveals that this is called as a part of `GetFileVersionInfoW`.

![](https://i.imgur.com/B91ed1S.png)

The buffer returned by `GetFileVersionInfoW` contains (predictably) version information, but crucially it also optionally contains other values like a company name or a file description. The usual call structure for fetching and querying this buffer appears to be something like

```cpp
const auto size = GetFileVersionInfoSizeW("path/to/file.exe");

if (size) {
    GetFileVersionInfoW("path/to/file.exe", ..., version_info_buffer);

    VerQueryValueW(version_info_buffer, "\StringFileInfo\lang-codepage\string-name", &value, ...);
}
```

Accordingly, when hooking these functions we get the following output for every program that is started while osu! is running.

![](https://i.imgur.com/APibLGu.png)

So osu! is reading the `FileDescription` and appears to be checking it against a blacklist. To confirm this theory I used [Resource Hacker](http://www.angusj.com/resourcehacker/) to change the version info of x32dbg.

![](https://i.imgur.com/RqcOlg3.png)

Indeed, changing it to anything but x64dbg will cause osu! to ignore it. This is the solution that I actually use. But for completeness sake, it is also possible to hook `GetFileVersionInfoSizeW` and always return zero. That way osu! will never even call `GetFileVersionInfoW`. But this requires injecting a DLL every time osu! is started, which is somewhat cumbersone.
