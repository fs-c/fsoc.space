{ "title": "C++ Unit Testing With CMake and Catch2", "date": "2020-08-01" }

...and precompiled headers!

I've used CMake for around a year or so and programmed in C++ for maybe half of that time as of right now, and recently I've finally had a chance to write unit tests for a project of mine. Previous projects were either [too simple](https://github.com/fs-c/vt-space) or [too reliant](https://github.com/fs-c/maniac) [on third party software](https://github.com/fs-c/peko) to warrant the effort but this one really lent itself to it.

## Problem Statement

I wanted the workflow for building and testing the project to be

```
cd build
cmake ..
make
make test
```

and I wanted to see the test output when running `make test`. This disqualified utilities like `CTest` since they hide the ouput of the test driver without proving an option to show it.

I didn't realize this until I actually ran a test for the first time, but I also want test compiles and runs to be fast. This is why I spent quite a bit of time on figuring out how to precompile the Catch2 header.

## Solution

The unit test folder is split up in two groups: (1) the Catch2 `main` function and (2) the actual tetst.

```
└── tests
    ├── catch.h
    ├── CMakeLists.txt
    ├── main.cpp
    └── tests.cpp
```

_Directory listing of the `tests` folder in my project._

`main.cpp` contains the following two lines

```cpp
#define CATCH_CONFIG_MAIN
#include "catch.h"
```

while `tests.cpp` contains the `TEST_CASE`s.

The `CMakeLists.txt` in the `tests/` folder contains the following code:

```cmake
# This exclusively contains the catch2 main define, separated because precompiling
# headers would be a problem otherwise.
add_library(tests-main STATIC main.cpp)

# This contains the actual tests.
add_executable(tests-run tests.cpp)

target_link_libraries(tests-run tests-main)

target_compile_definitions(tests-run PRIVATE CATCH_CONFIG_FAST_COMPILE
	CATCH_CONFIG_DISABLE_MATCHERS)

# Important if you don't want the test compile to take >5s every time.
target_precompile_headers(tests-run PRIVATE catch.h)

add_custom_target(test "tests-run" "-d yes")
```

The comments in the first couple of lines reveal that the Catch2 `main` has to be its own file in order to allow headers to be precompiled. The reason for this is sneaky and (in my opinion) borders on being a bug: If `CATCH_CONFIG_MAIN` is defined, `#include "catch.h"` expands with the implementation code (which would usually reside in `.cpp` files), otherwise it expands without it.

Precompiling would therefore cause the same implementation code to be expanded for all instances of `#include "catch.h"` and not just the one time it should usually be expanded, leading to linking errors.

In the above CMake code, this problem is sidestepped by compiling Catch2's `main` as a library which is then linked to the actual tests. I got this idea from a [blog post](http://mochan.info/c++/2019/11/12/pre-compiled-headers-gcc-clang-cmake.html) by Mochan Shrestha, and it works beautifully so far.

The last line looks simple, and it really is simple: it adds a custom target called `target` which builds and runs `tests-run`.

That's it. `make test` works as expected. Test compilation is slow for the first compile but really quick afterwards.
