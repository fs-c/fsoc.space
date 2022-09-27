---
title: "Netzwache CTF 2016: filechecker"
date: 2022-09-27
description: Writeup for the filechecker task from the Netzwache CTF 2016.
---

This is the `filechecker` task from the Netzwache CTF 2016, which I got from the [same repository](https://github.com/N4NU/Reversing-Challenges-List/tree/master/Baby/Internetwache_CTF_2016_File_Checker) as the tasks from the last post.

It's an ELF binary, no non-code branches or stack shenanigans so decompilation into Binja HLIL is quite informative.

```c
int32_t main(int32_t argc, char** argv, char** envp)
    int32_t exit_code
    if (password_file_exists() == 0)
        printf(format: "Fatal error: File does not exist")
        exit_code = 1
    else
        FILE* stream = fopen(filename: ".password", mode: &data_4008f9)
        if (stream == 0)
            puts(str: "Error: Could not read file")
            exit_code = 1
        else
            int32_t checksum = 0
            for (int32_t i = 0; i s< 15; i = i + 1)
                int32_t c = fgetc(fp: stream)
                if (feof(fp: stream) != 0)
                    checksum = checksum | 0x1337
                    break
                convert_character(index: i, char_ptr: &c)
                checksum = checksum | c
            if (checksum s<= 0)
                fclose(fp: stream)
                puts(str: "Congrats!")
                exit_code = 0
            else
                puts(str: "Error: Wrong characters")
                exit_code = 1
    return exit_code
```

It checks for the existence of a file named `.password` and then iterates over its characters. Every character is transformed in some way and `OR`-ed onto a checksum. (I called the variable checksum but going by a strict definition it really isn't one. I couldn't think of a better term and I think the meaning is clear.) If that checksum is greater than zero after all characters have been examined, the password is invalid.

Right off the bat it is thus clear that the file should contain at least 15 characters, where only the first 15 are relevant. Any less than that and `feof()` would return true inside the loop body and the checksum would be tainted. It is also reasonable to guess at this point that `convert_character()` should return zero for a valid character. (I think that a negative value would also be fine, but this will turn out to be a moot point.)

Taking a look at `encrypt_character` reveals a curious (to me) construct.

```c
uint64_t encrypt_character(int32_t index, int32_t* char_ptr)
    int32_t var_48 = 0x12ee
    int32_t var_44 = 0x12e0
    int32_t var_40 = 0x12bc
    int32_t var_3c = 0x12f1
    int32_t var_38 = 0x12ee
    int32_t var_34 = 0x12eb
    int32_t var_30 = 0x12f2
    int32_t var_2c = 0x12d8
    int32_t var_28 = 0x12f4
    int32_t var_24 = 0x12ef
    int32_t var_20 = 0x12d2
    int32_t var_1c = 0x12f4
    int32_t var_18 = 0x12ec
    int32_t var_14 = 0x12d6
    int32_t var_10 = 0x12ba
    int32_t x = (&var_48)[sx.q(index)] + *char_ptr
    int32_t y
    int32_t temp1
    y:temp1 = muls.dp.d(x, 0x354ac933)
    uint64_t z = zx.q(x - ((y s>> 0xa) - (x s>> 0x1f)) * 0x1337)
    *char_ptr = z.d
    return z
```

There are 15 magic numbers, that are accessed and added to the passed-in character based on its index in the password file. The appropriate value is fetched with a memory access offset from the address of the first variable. I'm certain that this file isn't handwritten assembly, and I would be surprised if the above code worked with compiler optimizations enabled.

Anyways, this modified version of the passed in character, `x`, is then multiplied by another, this time pretty large, magic number. I was originally very confused about the High-Level IL output for the multiplication so let's take a look at the disassembly.

```asm
mov     edx, 0x354ac933
mov     eax, ecx        ; eax now contains the modified character
imul    edx             ; the source of confusion in HLIL
```

I hadn't encountered `imul` before and it reminded me of something that should have been obvious: The result of a multiplication of two 32-bit variables must be stored in a 64-bit variable. The instruction in question does this by returning the lower 32 bits in `eax` and the upper 32 bits in `edx`. The meaning behind the `temp0:temp1` naming scheme of the result of the multiplication is now obvious, the first variable are the upper, the second the lower bits of the result.

Only the upper bits of the result are actually used, I've called them `y`. The final result, `z`, is then an amalgation of shifts and another multiplication. Interestingly, this multiplication doesn't use the wild syntax. Taking a look at the disassembly, that particular part corresponds to

```asm
imul    eax, eax, 0x1337
```

And the three-operand version of `imul` truncates its result, no second register required. At this point I decided to experiment a bit and reproduced the logic in `encrypt_character()` in C.

```c
// add_magic is the index-dependent magic number, mult_magic is the large magic 
// number that is multiplied onto the modified char

long int x = add_magic + c;
long int y = (x * mult_magic) >> 32;

long long int z = x - ((y >> 0xa) - (x >> 0x1f)) * 0x1337;

if (!z) {
    printf("c(%c) i(%d)", c, (int)c);
}
```

It was quickly apparent that every `add_magic` had a character that produced zero as the final result. Iterating over the `add_magic`s in order and then iterating over every possible character produces the flag.

## Conclusion

This was a fairly generic one (look at me, I'm jaded already!), but learning something new about assembly and binjas HLIL was cool. I'm kind of unhappy with my final solution of just bruteforcing the password given the algorithm, but by the time it became clear to me that bruteforcing was even an option (when I had already implemented the algorithm myself) I basically already had the flag.
