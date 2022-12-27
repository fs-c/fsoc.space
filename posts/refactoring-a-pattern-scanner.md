---
title: "Refactoring a Pattern Scanner"
date: 2022-12-27
description: Patterns and offsets in the context of game hacking, motivated by a refactor of an old pattern scanning implementation 
---

Recently, I was refactoring a pattern scanner implementation in [maniac](https://github.com/fs-c/maniac). In the context of game cheating, a pattern scanner basically looks for a sequence of bytes, with optional wildcards. I will first give some background on what this is all about and then go over the actual rewrite of a rather badly implemented pattern scanner.

## Background

Consider the following sample application

```C++
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

First, static analysis. I will use Binary Ninja here. I didn't want to make this needelessly annoying so I compiled the sample application with debug information, which generates a PDB. Taking a look at the disassembled `main` reveals

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

But while code changes _anywhere_ will break our offsets, these code changes will very often not be local to the place in the assembly we are getting our address from. This motivates the concept of pattern scanning, often also called signature scanning. For each offset we create a pattern, made up of surrounding instructions (bytes), taking care to add wildcards for things we expect to change --- like the offset we are looking for.

A signature for our `global counter` could be `83 EC ? A1 ? ? ? ? 8b 0D`. This signature is probably too long, signatures should be as short as possible while making sure that they are still unique, the shorter it is the more resilient it is to code changes near our offset location. We can now scan the process memory for this signature and thus dynamically obtain our offset, and would still be able to get it even if the sample application was expanded with some additional logic somewhere.

## Signature Scanning

A couple of years ago I added the following signature scanning implementation to maniac. This section will be about improving this implementation.

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

But first, let's take a look at what is going on. We read chunks of some predefined size (`read_size`) starting at address `0` until we hit `INT_MAX`. Some immediate comments: This should iterate up to `UINTPTR_MAX` and use `uintptr_t` instead of `size_t` for `off`. It also has a potential bug where a signature that happens to be between these arbitrarily sized chunks won't be found. So: this is a very bad implementation, and not only because of that. At the time I wrote it I had no clue about reverse engineering and had only a very vague idea about what a signature was. But someone gave me some signatures so I figured I might as well use them.

Another issue with it is that it encounters a _lot_ of read errors. Some years after first implementing it, trying to improve its performance, I set out to fix this by using `VirtualQueryEx` to check the permissions of memory regions before trying to read from them, and then skipping the entire region.

This never made it in a maniac release, but here's a sketch of what I was going for:

```c++
// iterate over all regions (subsequent pages with equal attributes) of the process
// with the given handle, call given callback function for each
void map_regions(HANDLE handle, const std::function<void(MEMORY_BASIC_INFORMATION *)> &callback) {
    uintptr_t cur_address = 0;
    // ensure architecture compatibility, UINTPTR_MAX is the largest (data) pointer i.e. address
    // for 32bit this is 0xFFFFFFFF or UINT32_MAX
    const uintptr_t max_address = UINTPTR_MAX;

    while (cur_address < max_address) {
        MEMORY_BASIC_INFORMATION info;

        if (!VirtualQueryEx(handle, reinterpret_cast<void *>(cur_address), &info, sizeof(info))) {
            std::cout << std::format("couldn't query at {}\n", cur_address);

            // can't really recover from this gracefully
            return;
        }

        callback(&info);

        // don't just add region size to current address because we might have
        // missed the actual region boundary
        cur_address = reinterpret_cast<uintptr_t>(info.BaseAddress) + info.RegionSize;
    }
}
```

This could then be used like

```c++
map_regions(handle, [](MEMORY_BASIC_INFORMATION *info) {
    std::cout << std::format("scanning region at {}\n", info->BaseAddress);

    if (/* permissions are fine */) {
        const auto buffer = /* read the region */;
        const auto offset = /* scan the region */;

        if (offset) {
            std::cout << std::format("found offset {}\n", offset);
        }
    }
});
```

or something like that, which would vastly improve performance because we would read or skip entire regions (adjacent pages with the same permissions) at once, instead of tiny chunks. I don't want to go into detail about this implementation because I will strip it down even more in the next step. It's included here because I can imagine situations where it would be useful.

So, as promised, we can throw away even more reads. We know the module our signature is in (because we just did some reversing to find it), in this case it's in the main executable module, named like the executable file itself: `sample.exe`. This means we can just iterate the modules with

```c++
Module Process::find_module(std::string_view name) const {
    MODULEENTRY32 entry;
    entry.dwSize = sizeof(MODULEENTRY32);

    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, id);
    if (!snapshot || snapshot == INVALID_HANDLE_VALUE) {
        throw std::runtime_error(std::format("couldn't enumerate modules of process {}", id));
    }

    Module32First(snapshot, &entry);

    if (name == entry.szModule) {
        CloseHandle(snapshot);
        return Module(this, reinterpret_cast<uintptr_t>(entry.modBaseAddr), entry.modBaseSize);
    }

    while (Module32Next(snapshot, &entry)) {
        if (name == entry.szModule) {
            CloseHandle(snapshot);
            return Module(this, reinterpret_cast<uintptr_t>(entry.modBaseAddr), entry.modBaseSize);
        }
    }

    CloseHandle(snapshot);
    throw std::runtime_error(std::format("couldn't find module '{}' in process {}", name, id));
}
```

which creates and returns a `Module` instance. I might want to do some other stuff with the module later so I figured I might as well allow saving it for later, so the search doesn't have to be repeated. But the method we are interested here is 

```c++
uintptr_t Module::find_signature(const Signature &&signature) const {
    auto buffer = std::vector<uint8_t>(size);

    if (!process->read_memory<uint8_t>(base, buffer.data(), buffer.size())) {
        throw std::runtime_error(std::format("couldn't read module memory at {} ({})", base, size));
    }

    const auto offset = signature.scan(buffer);

    if (!offset) {
        throw std::runtime_error("couldn't find signature");
    }

    return base + offset;
}
```

which accepts a `Signature` object, reads the entire module memory and scans it for the given signature. I wanted to make `Signature` into an object because when finding a pattern like we have previously, one also needs to store an offset into the pattern alongside it. For our pattern of `83 EC ? A1 ? ? ? ? 8b 0D` this offset would be `4`, because the address we are looking for is at index four in the pattern.

The scanning method in the `Signature` class,
```c++
uintptr_t scan(const std::vector<uint8_t> &buffer) const {
    const auto comparator = [](auto byte, auto pair) {
        return pair.second || byte == pair.first;
    };

    const auto result = std::search(buffer.begin(), buffer.end(),
        pattern.begin(), pattern.end(), comparator);

    return result == buffer.end() ? 0 : (result - buffer.begin() + offset);
}
```
uses `std::search` with a custom comparator. This not only simplifies the code but will also internally use a significantly faster algorithm than the one I initially used. (Probably [Boyer-Moore](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm).)

Taken together, this can be used to write the following

```c++
try {
    const auto process = Process::find_process(process_name);
    
    const auto counter_ptr = process.find_module("sample.exe")
        .find_signature(Signature{ "83 EC ? A1 ? ? ? ? 8b 0D", 4 });
    const auto counter = process.read_memory<uintptr_t>(counter_ptr);

    std::cout << std::format("found counter at {:#x} -> {:#x}\n", counter, counter_ptr);

    while (true) {
        std::cout << process.read_memory<int32_t>(counter) << std::endl;

        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
} catch (const std::runtime_error &err) {
    std::cout << std::format("runtime error: {}\n", err.what());
}
```
