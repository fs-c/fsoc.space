---
title: "Nuit du Hack CTF 2016: Matriochka"
date: 2022-09-28
description: Writeup for the Matriochka task(s) from the Nuit du Hack CTF Quals 2016.
---

This is the "matriochka" task from the Nuit du Hack CTF 2016 Quals, which is divided into three stages. I got them from [this repository](https://github.com/N4NU/Reversing-Challenges-List/tree/master/Baby). All stages are ELF binaries without any overt binary trickery.

The README reads

```
Can you help me?
Recently, I found an executable binary.
As I'm a true newbie,
Certainly, to solve it, I will have difficulties.
Keep in mind, the first step is quite easy.
Maybe the last one will be quite tricky.
Emulating it could be a good idea.
```

## Stage 1

As the README hints at, the first stage is "quite easy"; taking a look at the binary ninja HLIL output:

```c
int32_t main(int32_t argc, char** argv, char** envp)
    int32_t rax_2
    if (argc != 2)
        rax_2 = fprintf(stream: stdout@@GLIBC_2.2.5, format: "Usage: %s <pass>\n", *argv)
    else
        if (strcmp(argv[1], "Much_secure__So_safe__Wow") != 0)
            fwrite(buf: "Try again...\n", size: 1, count: 0xd, fp: stdout@@GLIBC_2.2.5)
        else
            fwrite(buf: "Good good!\n", size: 1, count: 0xb, fp: stdout@@GLIBC_2.2.5)

            // ...
```

The key is immediately readable.

## Stage 2

The second stage also decompiles nicely into HLIL:

```c
int32_t main(int32_t argc, char** argv, char** envp)
    int32_t rax_2
    if (argc != 2)
        rax_2 = fprintf(stream: stdout, format: "Usage: %s <pass>\n", *argv)
    else
        int32_t var_1c_1 = 1
        uint64_t x = strlen(argv[1]) + 1
        uint64_t magic_length = x * 0x15
        int32_t is_correct
        if (magic_length + magic_length == 0x1f8)
            is_correct = 1
            if (*argv[1] != 0x50)  // key[0]
                is_correct = 0
            int32_t a = sx.d(*(argv[1] + 3))
            if (a + a != 0xc8)  // key[3]
                is_correct = 0
            if (sx.d(*argv[1]) + 0x10 != sx.d(*(argv[1] + 6)) - 0x10)  // key[6]
                is_correct = 0
            if (sx.q(*(argv[1] + 5)) != strlen(argv[1]) * 9 - 4)  // key[5]
                is_correct = 0
            if (*(argv[1] + 1) != *(argv[1] + 7))  // key[1] = key[7]
                is_correct = 0
            if (*(argv[1] + 1) != *(argv[1] + 0xa))  // key[1] = key[10]
                is_correct = 0
            if (sx.d(*(argv[1] + 1)) - 0x11 != sx.d(*argv[1]))  // key[1]
                is_correct = 0
            if (*(argv[1] + 3) != *(argv[1] + 9))  // key[3] = key[9]
                is_correct = 0
            if (*(argv[1] + 4) != 0x69)  // key[4]
                is_correct = 0
            if (sx.d(*(argv[1] + 2)) - sx.d(*(argv[1] + 1)) != 0xd)  // key[2]
                is_correct = 0
            x = zx.q(sx.d(*(argv[1] + 8)) - sx.d(*(argv[1] + 7)))
            if (x.d != 0xd)  // key[8]
                is_correct = 0
            if (is_correct != 0)
                rax_2 = success_message(argv[1])
        if (magic_length + magic_length != 0x1f8 || (magic_length + magic_length == 0x1f8 && is_correct == 0))
            rax_2 = fprintf(stream: stdout, format: "Try again...\n", x)
    return rax_2
```

First, the length is verified. We have

```
x = length + 1
magic_length = x * 0x15
2 * magic_length = 0x1f8
```

and thus 

```
2 * ((length + 1) * 0x15) = 0x1f8
length = 11
```

So the correct password has eleven characters. What follows is eleven if-statements that each verify the correctness of a single character, not in order. I have annotated the statements with the index that they are verifying. None of them are particularly complex, and a table of key indices and expected values can be built quickly.

```
0:  = 0x50                     
1:  key[1] - 0x11 = key[0]
2:  key[2] - key[1] = 0xd
3:  2 * key[3] = 0xc8
4:  0x69
5:  key[5] = (length * 9) - 4
6:  key[0] + 0x10 = key[6] - 0x10
7:  = key[1]
8:  key[8] - key[7] = 0xd
9:  = key[3]
10: = key[1]
```

(As usual I have omitted the final results.)

## Stage 3

This one is more interesting. Once again decompilation into HLIL produces good results:

```c
int32_t main(int32_t argc, char** argv, char** envp)
    int32_t rax_3
    if (argc != 2)
        rax_3 = printf(format: "Usage: %s <pass>\n", *argv)
    else
        strncpy(&input_buffer, argv[1], 0x3ff)
        int32_t pid = getpid()
        signal(sig: 0xb, handler: _1st_segfault_handler)  // segfault handler
        signal(sig: 8, handler: fpe_handler)  // floating point exception handler
        for (int32_t var_10_1 = 0; var_10_1 s<= 0x3ff; var_10_1 = var_10_1 + 1)
            kill(zx.q(pid), 0xb)  // send segfault signal to current process
        puts(str: "Try again!")
        rax_3 = 1
    return rax_3
```

The main function loads the given password into a buffer and then registers two signal handlers, one for segfaults and one for floating point exceptions. (I had to look floating point exceptions up, the only example I found for it which I could reproduce was division by zero.) It then goes on to trigger a total of `0x3ff` segfaults.

Let's take a look at the segfault handler then. I've given it away already by calling it the first segfault handler above, and it is indeed far from the only one.

```c
uint64_t _1st_segfault_handler()
    int32_t rdi
    int32_t var_1c = rdi
    int32_t rcx = sx.d(input_buffer[0]) * 0x3e8
    int32_t high
    int32_t temp1
    high:temp1 = muls.dp.d(rcx, 0x78787879)
    uint64_t rax_6 = zx.q((high s>> 5) - (rcx s>> 0x1f))
    int32_t var_c_1 = rax_6.d
    if (var_c_1 s> 0x3e7 && var_c_1 s<= 0x3e8)
        rax_6 = signal(sig: 0xb, handler: _2nd_segfault_handler)
    return rax_6
```

It performs some transformations on the first character of the given password (recall that main loaded the input string into `input_buffer`). If the transformation results in a certain value, it registers another segfault handler--effectively overwriting itself with the new handler.

We know that this second handler will be called immediately after the first because `main` will keep sending segfaults. Taking a look at the second handler reveals it to be similar to the first:

```c
uint64_t _2nd_segfault_handler()
    int32_t rdi
    int32_t var_1c = rdi
    int32_t var_10 = 0
    int32_t rcx = sx.d(input_buffer[1]) * 0x3e8
    int32_t temp0
    int32_t temp1
    temp0:temp1 = muls.dp.d(rcx, 0x9c09c09d)
    uint64_t rax_8 = zx.q(((temp0 + rcx) s>> 6) - (rcx s>> 0x1f))
    int32_t var_c_1 = rax_8.d
    if (var_c_1 s> 0x3e7 && var_c_1 s<= 0x3e8)
        rax_8 = signal(sig: 0xb, handler: sub_4008c7)
    return rax_8
```

It again performs some transformations on a character (this time the second one, naturally) and verifies that it then results in a certain value. Then it registers another segfault handler.

There are a total of 21 such handlers, that each verify that a certain character in the input buffer is correct and set up the next signal handler if it is. The chain terminates with

```c
uint64_t final_segfault_handler()
    int32_t rdi
    int32_t var_1c = rdi
    int32_t temp2
    int32_t temp3
    temp2:temp3 = sx.q(sx.d(input_buffer[0x15]) * 0x3e8)
    // trigger floating point exception
    uint64_t rax_5 = zx.q(divs.dp.d(temp2:temp3, 0))
    int32_t var_c_1 = rax_5.d
    return rax_5
```

...which triggers a floating point exception by dividing some arbitrary value by zero. (I never checked but it should be 0/0, since I would expect `input_buffer[0x15]` to be zero since `argv[1]` is null-terminated.) The floating point exception handler then goes on to print a congratulatory message.

Okay, so for every character in the password we have a function that verifies its validity. Thankfully the signal handlers follow a pattern, there are two clear types/classes of handlers that are always used. (And a third class with a single instance, but we'll ignore that for now.) The first handler is an example of the first class, the second handler an example of the second. Handlers inside either class differ only by some immediate values used in the calculations.

Let us take a look at the first signal handler again. The calculation can be simplified to

```
x = input[0] * 0x3e8
y = (x * magic_factor) >> 32
z = (y >> magic_shift) - (x >> 0x1f)
```

where `magic_factor` and `magic_shift` are the values that change for each function.

Noting down which handler class and magic values is used for a given character index allows one to build a table much like the one from stage 2, except that this time I didn't solve the equations but just bruteforced it.

For example, for handlers of the first class:

```c
for (char c = CHAR_MIN; c < CHAR_MAX; c++) {
    int64_t x = c * 0x3e8;
    int64_t y = (x * magic_factor) >> 32;
    uint64_t z = (y >> magic_shift) - (x >> 0x1f);

    if (z == 0x3e8) {
        return c;
    }
}
```

In fact, this turned out to be enough. Since the majority of the handlers are of the first class running the above on all values already returns a solid portion of the key. Since the key is made up of English words, filling in the gaps (the characters that used a handler of a different class) was trivial with some manual trial and error.

## Conclusion

The gradual build-up of difficulty was enjoyable. (Although the first stage could have been omitted entirely, in my opinion.) This isn't the first challenge I've seen using signals to obfuscate control flow, but it's certainly an interesting technique.

But both the second and third stage were kind of laborious to solve. The second one had its pile of trivial equations, the third was just mindnumbingly going through functions and spotting tiny differences. I would've liked to use scripting to make this easier but it appears that my binja license doesn't cover that.

Still, it was enjoyable to figure out how the stages worked. So even though getting the keys themselves turned out to be more annoying than difficult, I liked the challenge overall.
