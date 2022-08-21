---
title: "CrackMe VI: Simple Encryption"
date: 2022-08-21
description: "Decrypting file contents by reversing the encryption algorithm."
---

This is the ["Simple Encryptor"](https://app.hackthebox.com/challenges/366) challenge from hackthebox. The download contains an ELF binary ("encrypt") that was used to encrypt another given file ("flag.enc"), containing the flag.

True to its name, the encryption routine is rather simple.

```C
int __cdecl main(int argc, const char **argv, const char **envp)
{
  // ...
  
  in_stream = fopen("flag", "rb");
  fseek(in_stream, 0LL, 2);
  size = ftell(in_stream);
  fseek(in_stream, 0LL, 0);
  content = malloc(size);
  fread(content, size, 1uLL, in_stream);
  fclose(in_stream);
  seed[0] = time(0LL);
  srand(seed[0]);
  for ( i = 0LL; i < (__int64)size; ++i )
  {
    *((_BYTE *)content + i) ^= rand();
    v3 = rand();
    v5 = *((_BYTE *)content + i);
    seed[1] = v3 & 7;                           // never used
    *((_BYTE *)content + i) = __ROL1__(v5, v3 & 7);
  }
  out_stream = fopen("flag.enc", "wb");
  fwrite(seed, 1uLL, 4uLL, out_stream);
  fwrite(content, 1uLL, size, out_stream);
  fclose(out_stream);
  return 0;
}
```

The encryption routine in prose-pseudocode is

```
for every character in the input sequence:
    XOR it with (random value 1)
    rotate its bits to the left by ((random value 2) & 7)
```

The random number generator is initialized with a seed of `time(0)` which just [returns the seconds since the epoch](https://man7.org/linux/man-pages/man2/time.2.html). This seed is stored in the first four bytes of the encrypted file. Interestingly, `seed` in the above IDA snippet is declared as `int seed[2]`. The first entry is the actual seed, but the second entry changes with every iteration and is never used.

Writing a decryption routine is straightforward, and consists of performing the inverse of the above steps in reverse order. Care needs to be taken to preserve the order in which the random numbers are generated.

```C
unsigned int seed = *(unsigned int *)buffer;
srand(seed);

for (int i = 4; i < size; i++) {
    int r = rand();

    buffer[i] = __builtin_ia32_rorqi(buffer[i], rand() & 7);

    buffer[i] ^= r;
}
```

The trickiest part to this was probably finding `__builtin_ia32_rorqi` which rotates the bits of the given 8 bit value to the right. Using these builtins [is apparently discouraged](https://gcc.gnu.org/bugzilla//show_bug.cgi?id=92137), but I didn't feel like searching for an alternative considering it's a one-off that worked just fine.

## Conclusion

Figuring out how an algorithm works is always fun. I feel like it could have been a little more complex (even considering the challenges "easy" rating) but I suppose adding more steps would have just made it more tedious, not particularly more difficult.
