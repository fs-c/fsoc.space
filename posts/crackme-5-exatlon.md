---
title: "CrackMe V: Exatlon"
date: 2022-08-20
description: "Reversing modern C++ is weird. Purely static analysis to lift out a flag generation algorithm... again!"
tags: [ctf]
---

The challenge is ["Exatlon"](https://app.hackthebox.com/challenges/121) from hackthebox. This was the first one that had cool ASCII art!

![](https://i.imgur.com/NfhNFdk.png)

It starts out by printing the aforementioned ASCII art with 1s sleeps between some of the lines. I assume this is done to discourage bruteforcing the password. Not a particularly elegant solution but admittedly it looks kind of cool.

```cpp
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
sleep(1LL, &unk_54B0D8);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
sleep(1LL, &unk_54B260);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
sleep(1LL, &unk_54B320);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
sleep(1LL, &unk_54B400);
```

As a side note: This was the first program I reversed that used the C++ STL extensively. It looks horrible, doesn't it?

After that comes the interesting part,

```cpp
std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::basic_string(input);
std::operator<<<std::char_traits<char>>((std::ostream *)&std::cout);
std::operator>><char>((std::istream *)&std::cin);
exatlon((__int64)transformed_input, (__int64)input);
is_equal = std::operator==<char>(
    transformed_input,
    "1152 1344 1056 1968 1728 816 1648 784 1584 816 1728 1520 1840 1664 784 1632 1856 1520 1728 816 1632 185"
    "6 1520 784 1760 1840 1824 816 1584 1856 784 1776 1760 528 528 2000 ");
```

the password is read, transformed and compared to a hardcoded string.

Taking a look at the `exatlon` function where the transformation happens

```cpp
__int64 __fastcall exatlon(__int64 transformed_out, __int64 input)
{
  __int64 input_end; // [rsp+18h] [rbp-78h] BYREF
  __int64 input_begin; // [rsp+20h] [rbp-70h] BYREF
  char v5; // [rsp+2Fh] [rbp-61h] BYREF
  char v6[32]; // [rsp+30h] [rbp-60h] BYREF
  char v7[39]; // [rsp+50h] [rbp-40h] BYREF
  char cur_char; // [rsp+77h] [rbp-19h]
  __int64 input_; // [rsp+78h] [rbp-18h]

  std::allocator<char>::allocator(&v5);
  std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::basic_string(
    transformed_out,
    &unk_54B00C,
    &v5);
  std::allocator<char>::~allocator(&v5);
  input_ = input;
  input_begin = std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::begin(input);
  input_end = std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::end(input_);
  while ( (unsigned __int8)__gnu_cxx::operator!=<char const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>(
                             &input_begin,
                             &input_end) )
  {
    cur_char = *(_BYTE *)__gnu_cxx::__normal_iterator<char const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>::operator*(&input_begin);
    std::__cxx11::to_string((std::__cxx11 *)v7, 16 * cur_char);
    std::operator+<char>((__int64)v6, (__int64)v7, (__int64)&ascii_space);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::operator+=(transformed_out, v6);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string(v6);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string(v7);
    __gnu_cxx::__normal_iterator<char const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>::operator++(&input_begin);
  }
  return transformed_out;
}
```

reveals even more STL goodness; great! The important part is the `while`-loop, which iterates over all characters in the input string. The loop body looks wild, so let's go through the steps

- multiply the current character by 16 (left shift by 4 bits) and convert it to a string
- add a space at the end
- append the resulting string to the final result

Recalling the hardcoded string we found earlier, we can now decode the password by applying the inverse transformations as the ones above. Hackers like Python apparently but I used NodeJS:

```js
> const encoded = "1152 1344 1056 1968 1728 816 1648 784 1584 816 1728 1520 1840 1664 784 1632 1856 1520 1728 816 1632 1856 1520 784 1760 1840 1824 816 1584 1856 784 1776 1760 528 528 2000 "
undefined
> encoded.split(" ").map((v) => String.fromCharCode(Math.floor(v / 16))).join('')
'HTB{***}\x00'
>
```

The password is also the flag.

## Conclusion

Figuring this one out took me significantly longer than I would like to admit. I found the STL function calls very challenging/confusing to read and understand. In particular, some appear to deviate heavily from what you would expect based on the name and the relevant STL documentation. (For example: I didn't know that `std::to_string` had a variant that accepted 2 arguments. And [officially, it doesn't](https://en.cppreference.com/w/cpp/string/basic_string/to_string)!) Presumably these are implementation details of the compiler (GCC, in this case).

I think that this is a symptom of me trying to understand the whole program before I even start looking for the flag. In this case I was held back by not being sure what some calls did, even though the actual steps to decode the password were trivially readable. This was a good learning experience.
