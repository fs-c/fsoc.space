---
title: "CrackMe III: Impossible Password"
date: 2022-08-18
description: Purely static analysis to lift out a flag generation algorithm. Fun!
---

This is the ["Impossible Password"](https://app.hackthebox.com/challenges/26) challenge from hackthebox. The file is an ELF binary, so I couldn't run it on my Windows box (without using a VM). It turns out that I didn't need to in any case.

The start routine nicely cleans up to

```C
int __fastcall main(int a1, char **a2, char **a3)
{
  const char *second_key; // rax
  int result; // eax
  char flag_alphabet[32]; // [rsp+10h] [rbp-40h] BYREF
  char input[20]; // [rsp+30h] [rbp-20h] BYREF
  char *first_key; // [rsp+48h] [rbp-8h]

  first_key = "SuperSeKretKey";
  qmemcpy(flag_alphabet, "A]Kr=9k0=0o0;k1?k81t", 20);
  printf("* ");
  __isoc99_scanf("%20s", input);                // read first input
  printf("[%s]\n", input);
  if ( strcmp(input, first_key) )
    exit(1);
  printf("** ");
  __isoc99_scanf("%20s", input);                // read second input
  second_key = generate_second_key(20);
  result = strcmp(input, second_key);
  if ( !result )
    result = print_flag(flag_alphabet);
  return result;
}
```

which reveals the program to be a two-step process: First a trivially readable key is requested. Second, another key is generated and requested. Finally, the flag is printed out.

Taking a look at the key generation algorithm

```C
BYTE *__fastcall generate_second_key(int size)
{
  int v1; // eax
  _BYTE *buffer; // [rsp+20h] [rbp-10h]
  int i; // [rsp+2Ch] [rbp-4h]

  v1 = time(0LL);
  ++dword_601074;
  srand(size * v1 + dword_601074);
  buffer = malloc(size + 1);
  if ( !buffer )
    exit(1);
  for ( i = 0; i < size; ++i )
    buffer[i] = rand() % 94 + 33;
  buffer[size] = 0;
  return buffer;
}
```

reveals that it uses both `time` and `rand`, so it is very much nontrivial to generate a key ahead of time. This is presumably also where the challenge gets its name from, it would be impossible for a regular user to get past this check.

I was basically already resigned to spinning up a Linux box and using a debugger at this point. But taking a look at the flag printing method

```C
// alphabet = A]Kr=9k0=0o0;k1?k81t
int __fastcall print_flag(_BYTE *alphabet)
{
  int i; // eax
  int j; // [rsp+14h] [rbp-Ch]

  j = 0;
  while ( *alphabet != 9 )
  {
    i = j++;
    if ( i > 19 )
      break;
    putchar((char)(*alphabet++ ^ 9));
  }
  return putchar(10);
}
```

reveals that nothing about it depends on any random variables. Compiling the above code function and feeding it with the given alphabet prints the correct flag. It's interesting to note that the `while` loop condition is never true, it's just an anti-reversing decoy. The real loop condition is the check for `i > 19`.

## Conclusion

This was a really fun one, first time I've used exclusively IDA to solve a crackme. Usually I only understand very little about what is going on in a program when analyzing it, but this one was simple enough to fully grasp in a couple of minutes. That made it more enjoyable I think.

It would have probably been easier to patch out the offending checks in a debugger and just plow straight to the flag, but this was certainly more interesting.
