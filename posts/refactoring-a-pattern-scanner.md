---
title: "Refactoring a Pattern Scanner"
date: 2022-12-27
description: Patterns and offsets in the context of game hacking, motivated by a refactor of an old pattern scanning implementation 
---

In the context of game cheating, a pattern scanner looks for a sequence of bytes in the memory of a (game) process, usually with optional wildcards to account for parts that will always change. Recently, I was refactoring a pattern scanner implementation in [maniac](https://github.com/fs-c/maniac), which is what motivated this post -- hence the title.

But since it fits the topic and I have been asked to explain it before, I have also added a preface that illustrates some concepts behind pattern scanning in more detail. This first section is particularly aimed at those with little to no experience in the game cheating/reversing world.

Then I introduce the original implementation, highlight some of its problems, and develop improved versions for different use-cases. 

## Preface/Background

Consider the following sample application

```cpp
int global_counter = 0;

int main() {
    while (true) {
        std::cout << ++global_counter << std::endl;

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}
```

which increments a global counter each second. It will serve as the example for the rest of this post. (I have compiled it with a recent MSVC, RelWithDebInfo, x86.)

Let's say we want to read and keep track of the `global_counter` from another application, much like a cheat might want to read things like player locations. We know that we can use Windows APIs like `ReadProcessMemory` to read the memory of a foreign process, so all that is left is finding where in the process memory our counter is located.

### Finding the location manually

First, static analysis. I will use Binary Ninja here. I didn't want to make this needlessly annoying so I compiled the sample application with debug information, which generates a PDB. Taking a look at the disassembled `main` reveals

```asm
int32_t main() __noreturn
83ec08             sub     esp, 0x8
a130810000         mov     eax, dword [global_counter]
8b0d9c900000       mov     ecx, dword [std::cout]
40                 inc     eax
50                 push    eax {var_c_1}
a330810000         mov     dword [global_counter], eax
ff1570900000       call    dword [??6?$basic_ostream@DU?$char_traits@D@std@@@std@@QAEAAV01@H@Z]
6828100000         push    0x1028 {var_c}
8bc8               mov     ecx, eax
ff1574900000       call    dword [??6?$basic_ostream@DU?$c...d@@@std@@QAEAAV01@P6AAAV01@AAV01@@Z@Z]
8d0424             lea     eax, [esp {var_8}]
c7042401000000     mov     dword [esp {var_8}], 0x1
50                 push    eax {var_8} {var_c_2}
c744240800000000   mov     dword [esp+0x8 {var_4_1}], 0x0
e811edffff         call    j_std::this_thread::sleep_for<__int64,std::ratio<1,1> >
83c404             add     esp, 0x4
ebbe               jmp     0x2393
```

which tells us that our value is at `30810000`, little endian for `0x8103`. I have rebased the disassembly to address `0` since binary ninja naturally can't know what base address `sample.exe` will end up getting.

We can now already conclude that `global_counter` will be at `base_address + 0x8103`, but it might be instructive to take a look in a debugger as well. I will use xdbg here.

![](https://i.imgur.com/7UhZLOD.png)

Again, converting from little endian the final address ended up to be `0x3A8130`, which suggests that `0x3A0000` is the base address. Taking a look at Process Hacker,

![](https://i.imgur.com/bEcD0LE.png)

this is indeed the case. Again, we could have known this just from looking at the disassembly but I have found it very helpful to double check this kind of stuff. It helps catch errors of sloppiness and (more importantly) understanding. Confirming our findings, this address contains the counter.

![](https://i.imgur.com/MdRtUo3.png)

(Note that `0x20 = 32`.)

### Building a pattern

We could stop right here, assuming the program we are reading from remains the same, we will always be able to get the correct address now. But, particularly when working with games, the program will not remain the same and any update will invariably change the location of our pointer in the assembly. At this point, some resign themselves to updating their offsets after every update, perhaps choosing to use something like [dumps.host](https://dumps.host/) to essentially offload the work.

(The situation is somewhat more convoluted when the target program is written in an interpreted language, where the location of the actual machine code might not always be the same.)

But while code changes _anywhere_ will break our offsets, these code changes will very often not be local to the place in the assembly we are getting our address from. This motivates the concept of pattern scanning, often also called signature scanning. For each offset we create a pattern, made up of surrounding instructions (bytes), taking care to add wildcards for things we expect to change --- like the offset we are looking for.

A signature for our `global counter` could be `83 EC ? A1 ? ? ? ? 8B 0D`. We can now scan the process memory for this signature, doing a byte comparison for regular bytes and allowing any byte for the wildcard `?`, and thus dynamically obtain our offset. If some logic in the program changes somewhere that isn't very close to our value, its signature won't have changed and we will still be able to obtain it.

## Signature Scanning

A couple of years ago I added the following signature scanning implementation to maniac. This section will first highlight some of the issues of this implementation, and then go through the thought process of developing an improved version.

```c
void *find_pattern(const unsigned char *signature, unsigned int sig_len)
{
	const size_t read_size = 4096;
	unsigned char chunk[read_size];

	// Get reasonably sized chunks of memory...
	for (size_t off = 0; off < INT_MAX; off += read_size - sig_len) {
		if (!(read_game_memory((void *)off, chunk, read_size))) {
			continue;
		}

		// ...and check if they contain our signature.
		void *hit = check_chunk(signature, sig_len, chunk, read_size);

		if (hit) {
			return (void *)(off + (intptr_t)hit);
        }
	}

	return NULL;
}

static inline void *check_chunk(const unsigned char *sig, size_t sig_size,
	unsigned char *buf, size_t buf_size)
{
	// Iterate over the buffer...
	for (size_t i = 0; i < buf_size; i++) {
		int hit = true;

		// ...to check if it includes the signature.
		for (size_t j = 0; j < sig_size && hit; j++) {
			hit = buf[i + j] == sig[j];
		}

		if (hit) {
			return (void *)(i + sig_size);
		}
	}

	return NULL;
}
```

But first, let's take a look at what is going on. We read chunks of some predefined size (`read_size`) starting at address `0` until we hit `INT_MAX`. These chunks are then searched using the most basic search algorithm.

Some issues, in no particular order:

- `INT_MAX` isn't necessarily the highest address, this should use something like `UINTPTR_MAX`.
- not all parts of a process address space are readable; since this implementation doesn't even know about paging, let alone page permissions, it runs into a lot of permission errors
- because the buffer size is arbitrary and not tied to page sizes or regions there is a possibility that a signature might span two buffers, und thus be missed
- the search algorithm used is very naiive, better algorithms exist
- it doesn't allow specifying a module name, which could significantly narrow down the region of memory that needs to be searched 

Let's first tackle the issue of our search algorithm, because the structure that I will introduce will be used throughout the rest of this post. The key idea here is to separate "finding the region to search" from "searching the region". This is already roughly the case in the above implementation, but it can be taken a step further:

```cpp
class Signature {
    uintptr_t offset;
    std::vector<std::pair<uint8_t, bool>> pattern;

    // converts a pattern like "AB CD EF ? ? FF" to [ [171, false], ..., [0, true], ... ]
    // where the second pair member signifies whether the byte is a wildcard
    constexpr void parse_string_pattern(const std::string &string_pattern) {
        // ...
    }

public:
    Signature(const std::string &pattern, uintptr_t offset) : offset(offset) {
        parse_string_pattern(pattern);
    }

    template<typename T>
    uintptr_t scan(T begin, T end) const {
        const auto comparator = [](auto byte, auto pair) {
            // treat everything as equal to a wildcard, compare others normally
            return pair.second || byte == pair.first;
        };

        const auto result = std::search(begin, end, pattern.begin(), pattern.end(), comparator);

        return result == end ? 0 : (result - begin + offset);
    }
};
```

From [`signature.h`](https://github.com/fs-c/sigscan/blob/main/sigscan/signature.h).

We intruduce a type for signatures that internally handles conversion from the human-readable signature format to a more computationally practical one and also provides a method to search for "itself" in a given buffer. The particularly nice bit here is the usage of [`std::search`](https://en.cppreference.com/w/cpp/algorithm/search) which has a significantly better runtime complexity than the previous implementation while also cleaning up the code. Note the custom comparator to add support for our wildcards. Note that the class also stores an offset -- for a signature of `AA BB ? ? ? ? CC DD` the offset would be two, because the value we are searching for is two bytes beyond the address of the start of the signature.

The rest of this code will live in the context of a `Process` class, which provides access to memory and (importantly) manages the lifetime of required handles. I won't go over most utility methods in detail, if you're curious take a look at [`process.h`](https://github.com/fs-c/sigscan/blob/main/sigscan/process.h).

That takes care of the point about our slow search algorithm. Let's now work on the permissions issue, by making sure that we can actually read at a particular address before trying. The Windows API function [`VirtualQueryEx`](https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualqueryex) does all the heavy lifting here, by letting us get information about the region a given address is in. In this context a region is made up of subsequent pages with equal attributes.

Using this information (I'd recommend taking a look at the documentation for [`MEMORY_BASIC_INFORMATION`](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-memory_basic_information) and [Process Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights)) we can avoid read errors by checking the type and protection. We can also fix the bug where a signature might be between two of our previously arbitrarily sized buffers by just reading whole regions at once.

```cpp
intptr_t Process::find_signature(const Signature &signature, uintptr_t initial_address, const uintptr_t max_address) const {
    auto cur_address = initial_address;

    MEMORY_BASIC_INFORMATION info;

    auto buffer = std::vector<std::uint8_t>{};

    while (cur_address < max_address) {
        if (!VirtualQueryEx(handle, reinterpret_cast<void *>(cur_address), &info, sizeof(info))) {
            throw std::runtime_error(std::format("couldn't query at {}", cur_address));
        }

        const auto base = reinterpret_cast<uintptr_t>(info.BaseAddress);

        bool invalid_type = (info.Type != MEM_IMAGE && info.Type != MEM_PRIVATE);
        bool invalid_protection = (info.Protect == PAGE_EXECUTE || info.Protect == PAGE_NOACCESS || info.Protect == PAGE_TARGETS_INVALID);

        if (!info.RegionSize || info.State != MEM_COMMIT || invalid_type || invalid_protection) {
            cur_address = base + info.RegionSize;

            continue;
        }

        buffer.resize(info.RegionSize);
        read_memory<std::uint8_t>(base, buffer.data(), buffer.size());

        const auto offset = signature.scan(buffer.begin(), buffer.end());

        if (offset) {
            return base + offset;
        }

        cur_address = base + info.RegionSize;
    }

    return 0;
}
```

The method accepts a signature to search for and memory addresses between which to search for it. It then walks the regions of memory in this span, verifies that the type and protection make it relevant and readable to us, and searches the regions. This code isn't very exciting, if it looks intimidating take a look at the documentation pages that I linked at above.

This method is private, but with it we can trivially create a public version that just searches _all_ regions of memory in a given process -- useful for interpreted programs.

```cpp
uintptr_t Process::find_signature(const Signature &&signature) const {
    return find_signature(signature, 0, UINTPTR_MAX);
}
```

We've now taken care of all read errors, improved performance by reading more at once and skipping irrelevant or unreadable regions and fixed a bug where a signature wouldn't be found. The only point remaining is to allow specifiying a particular module to search in, further reducing the memory that needs to be searched significantly.

Entries of the module list of a process are described by [`MODULEENTRY32`](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/ns-tlhelp32-moduleentry32), which can be queried using [`Module32First`](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-module32first)/[`Module32Next`](https://learn.microsoft.com/en-us/windows/win32/api/tlhelp32/nf-tlhelp32-module32next). I implemented a small wrapper over this, called `for_each_module`, which calls a given callback for every module and passes it a pointer to the relevant struct.

Thus we don't have to look at the ugly module iteration, and the implementation is as simple as

```cpp
uintptr_t Process::find_signature(const Signature &&signature, std::string_view module_name) const {
    uintptr_t address = 0;

    for_each_module([&](MODULEENTRY32 *mod) -> bool {
        if (mod->szModule != module_name) {
            return true;
        }

        const auto base = reinterpret_cast<uintptr_t>(mod->modBaseAddr);
        address = find_signature(signature, base, base + mod->modBaseSize);

        return false;
    });

    return address;
}
```

Here, `for_each_module` expects the callback to return true if it should continue iterating.

Taken together, these methods can be used like

```cpp
try {
    const auto process = Process::find_process(process_name);

    // ...leaving out the last parameter if the module is not known
    const auto value_ptr_addr = process.find_signature(Signature{ "40 50 A3 ? ? ? ? FF 15", 3 }, "sample.exe");

    if (!value_ptr_addr) {
        throw std::runtime_error("couldn't find signature");
    }

    const auto value_ptr = process.read_memory<uintptr_t>(value_ptr_addr);

    std::cout << std::format("found value at {:#x} -> {:#x}\n", value_ptr, value_ptr_addr);

    while (true) {
        std::cout << process.read_memory<int32_t>(value_ptr) << std::endl;

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
} catch (const std::runtime_error &err) {
    std::cout << std::format("runtime error: {}\n", err.what());
}
```

which, at least to my eyes, is pretty clean. You can take a look at the final example code in [fs-c/sigscan](https://fsoc.space/words/refactoring-a-pattern-scanner/).
