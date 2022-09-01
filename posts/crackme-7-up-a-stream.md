---
title: "CrackMe VII: Up a Stream"
date: 2022-09-01
description: "Reversing an encryptor written in Java, decidedly overusing streams."
---

This is the recently released ["Up a Stream"](https://app.hackthebox.com/challenges/392) challenge from hackthebox. The download contains a JAR file and its output.

Decompiling JAR files is unsurprisingly quite easy considering that it is compiled to an IL. I used [quiltflower](https://github.com/QuiltMC/quiltflower/releases) to do it.

```java
private static List<String> dunkTheFlag(String var0) {
    return Arrays.asList(
        ((String)((List)((String)((List)((String)((List)var0.chars().mapToObj(var0x -> (char)var0x).collect(Collectors.toList()))
                        .stream()
                        .peek(var0x -> hydrate(var0x))
                        .map(var0x -> var0x.toString())
                        .reduce("", (var0x, var1) -> var1 + var0x))
                    .chars()
                    .mapToObj(var0x -> (char)var0x)
                    .collect(Collectors.toList()))
                    .stream()
                    .map(var0x -> var0x.toString())
                    .reduce(String::concat)
                    .get())
                .chars()
                .mapToObj(var0x -> var0x)
                .collect(Collectors.toList()))
            .stream()
            .map(var0x -> moisten(var0x))
            .map(var0x -> var0x)
            .map(Challenge::drench)
            .peek(Challenge::waterlog)
            .map(Challenge::dilute)
            .map(Integer::toHexString)
            .reduce("", (var0x, var1) -> var0x + var1 + "O"))
        .repeat(5)
    );
}

private static Integer hydrate(Character var0) {
    return var0 - 1;
}

private static Integer moisten(int var0) {
    return (int)(var0 % 2 == 0 ? (double)var0 : Math.pow((double)var0, 2.0));
}

private static Integer drench(Integer var0) {
    return var0 << 1;
}

private static Integer dilute(Integer var0) {
    return var0 / 2 + var0;
}

private static byte waterlog(Integer var0) {
    var0 = ((var0 + 2) * 4 % 87 ^ 3) == 17362 ? var0 * 2 : var0 / 2;
    return var0.byteValue();
}
```

True to the challenge description, basically everything important happens through streaming mechanics. I really like functional programming so this was perhaps easier on the eyes to me than for some others. I'm sorry for the overly long lines, I'll summarize what's going on without the (de)compiler-generated fluff. 

1. Invert the string (see the `reduce` in the most-indented part)
2. Apply `moisten` to every character
3. Apply `drench` to every value
4. Apply `dilute` to every value
5. Convert value to string in hexadecimal notation
6. Add them together to form a string, with `O` (not a zero!) in between

You might have noticed that I left out two supposed additional operations -- `hydrate` and `waterlog`. Those are applied inside a `peek` on the stream, which doesn't actually modify the stream (as a `map` or a `filter` would). I didn't know about `peek` beforehand and I figured that it worked similarly to `map`, but it turns out that they were just included as an anti-reversing measure.

Writing out the above operations in reverse order is straightforward, I used JS to create a simple decoder.

´´´js
const decode = (code) => {
    return code
        // undo encoding
        .split('O').slice(0, -1).map((h) => parseInt(h, 16))
        // undo dilute
        .map((e) => e - Math.floor(e / 3))
        // undo drench
        .map((e) => Math.floor(e / 2))
        // undo moisten (this isn't a perfect inversion but it works)
        .map((e) => e > 255 ? Math.sqrt(e) : e)
        // invert
        .reverse()
        // make readable
        .map((e) => String.fromCharCode(e)).join('')
};
´´´

## Conclusion

I'd never had reason to decompile Java code before, so this was a welcome opportunity. I loved the word-plays on hydration in the helper functions.

I feel like I did okay on this one, I finished it in a decent time and in one sitting. I'm still frustrated that it took me so long to figure out that `peek` didn't work like I assumed it would, I really should have checked that earlier. I think I spent almost have of my time trying to figure out how `waterlog` could possibly work, considering that it returned a byte, but the values that it supposedly generated vastly exceeded the size of one. Only to find out that its results were never even used.

This is the first post after more than a week of not working on these challenges. I originally set out to complete (or work on) one per day, but the moment I broke my streak I lost all motivation. Maybe this says something about overly valuing rituals as (motivational) support, considering that once one is broken everything falls? I'm still thinking about this. But I'm happy to be back. 
