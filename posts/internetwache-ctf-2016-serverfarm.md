---
title: "Internetwache CTF 2016: SeverfARM"
date: 2022-09-29
description: Writeup for the ServerfARM task from the Internetwache CTF 2016.
tags: [ctf]
---

This is the `ServerfARM` task from the Internetwache CTF 2016, I got it from [their official repository](https://github.com/internetwache/Internetwache-CTF-2016/tree/master/tasks/rev70/task).

The provided file is an ELF binary for ARM7. We're asked to extract a key from it. It looks like binja has some problems with ARM; looking at the main function reveals

```c
int32_t main(int32_t argc, char** argv, char** envp)
    char* r0
    mstate r1
    r0, r1 = malloc(bytes: 0x65)
    char* var_c = nullptr
    mstate r2_1
    while (true)
        r2_1 = argc - 1
        if (r2_1 s<= var_c)
            break
        printf("Enter Solution for task %d:", format: var_c, r2_1, var_c, argv, argc, r0, var_c)
        r1 = handle_task(var_c, r0, __isoc99_scanf(&string_format, format: r0))
        var_c = &var_c[1]  // wrong? var_c += 1 (00010704)
    free(mem: r0, r1, r2_1, var_c)
    return 0
```

I have added a comment to the line I think is wrongly decompiled. Why do I think it's wrong? Take a look at the disassembly:

```asm
ldr     r3, [r11,  #-0x8] {var_c}
add     r3, r3, #0x1
str     r3, [r11,  #-0x8] {var_c} ; (00010704)
```

Clearly, `var_c` is incremented by one, right? LLIL and MLIL seem to agree with me:

```asm
  26 @ 000106fc  r3 = [r11 - 8 {var_c}].d
  27 @ 00010700  r3 = r3 + 1
  28 @ 00010704  [r11 - 8 {var_c}].d = r3
  
  18 @ 000106fc  r3_1 = var_c
  19 @ 00010700  r3_2 = r3_1 + 1
  20 @ 00010704  var_c = r3_2
```

But HLIL messes up for some reason. Anyways, with that mental correction to the HLIL code we see that `handle_task()` is called until our loop counter `var_c` is `>= argc - 1`.

The `handle_task` function is quite big, but it's important to remember that we just want to extract a string (that is presumably printed out under some condition). We don't need to care too much about the inner workings of the program. So, with that out of the way, notice that `handle_task` is called with the loop counter as the first argument. The function is basically a big switch case that does entirely different things based on the loop counter.

So let us go through the possible cases and take a look at what is being printed.

For `0`:

```c
// the switch case for 0 is effectively empty but at the end of 
// the function we find:
if (arg1 == 0)
    if (r0_5 s<= 0x23)
        printf(&string_format, format: &data_10e70)  // IW{
        putchar(c: 'S')
        arg1 = printf("%c%c\n", format: '.', 'E')
    else
        arg1 = puts(str: "I{WAQ3")
```

It is either `IW{S.E.` or `I{WAQ3`.

For `1`:

```c
printf(&string_format, format: "Here's your 2. block:", arg3, arg1, var_20, arg1)
if (__aeabi_idivmod(zx.d(*var_20), zx.d(var_20[1])) != 'A')
    arg1 = puts(str: "WI{QA3")
else
    printf(&string_format, format: &data_10e94)
    putchar(c: 'V')
    arg1 = printf("%c%c\n", format: '.', 'E')

```

it is either `WI{QA3` or `.R.V.E`

For `2`:

```c
printf(&string_format, format: "Here's your 3. block:", arg3, arg1, var_20, arg1)
if (strcmp(p1: var_20, p2: "1337") != 0)
    arg1 = printf("%c%s%c\n", format: '.', 0x10ec8, '!')  {"Q.D.Q"}
else
    arg1 = puts(str: ".R>=F:")

```

it is either `.Q.D.Q!` or `.R>=F:`.

For `3`:

```c
if (zx.d(*var_20) != 0)
    arg1 = printf("%c%s%c\n", format: 'A', 0x10ed8, '}', var_20, arg1)  {":R:M"}
```

it is `A:R:M}`.

Notice that exactly one combination spells out an English word, I think it is safe to say that we found the required key.

## Conclusion

I'm somewhat disappointed I didn't have to debug this, an ARM debugging setup would probably have been interesting. That aside it was a fun, short challenge.
