---
title: Using ImGui to Create a Simple GUI in C++
date: 2022-08-21
description: The tale of how a side project of mine got a GUI with minimal effort and super convenient usage.
---

A while ago I added a GUI to a side project of mine, [maniac](https://github.com/fs-c/maniac). I had never written an application with a GUI before, but I had previously used [ImGui](https://github.com/ocornut/imgui) to create [a custom HUD](https://github.com/fs-c/acchud) for [a racing game](https://www.assettocorsa.it/competizione/). That project consisted of a DLL which hijacked the game's drawing function to render the custom interface. I hope to get around to writing about that in the future, it was a fun project.

This time was different, since I didn't have a drawing function to hijack. Luckily ImGui has a very extensive collection of [examples](https://github.com/ocornut/imgui/tree/master/examples) and it was easy enough to just start out with one of them as the baseline. (For reference: I chose the DirectX 9 example because I am somewhat familiar with the API, but Vulkan or a more recent DX version would have probably been better.)

Integrating ImGui into a build system is kind of wacky because they seem to want you to just copy the files you need into your project. I didn't want to do that, so I added the ImGui repository as a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) with

```bash
$ git submodule add https://github.com/ocornut/imgui app/dependencies
```

and adjusted the relevant CMakeList file to

```cmake
add_executable(maniac-app app.cpp window.cpp
    dependencies/imgui/imgui.cpp
    dependencies/imgui/backends/imgui_impl_dx9.cpp
    dependencies/imgui/backends/imgui_impl_win32.cpp
    dependencies/imgui/imgui_demo.cpp
    dependencies/imgui/imgui_draw.cpp
    dependencies/imgui/imgui_tables.cpp
    dependencies/imgui/imgui_widgets.cpp)

target_include_directories(maniac-app PRIVATE dependencies)
target_include_directories(maniac-app PRIVATE dependencies/imgui)

target_link_libraries(maniac-app PRIVATE maniac d3d9.lib)
```

I added the dependencies folder to the includes so I could write `#import <imgui/...>`, but had to add the imgui subfolder itself to the includes as well to avoid having to rewrite all the imports in the imgui implementation files.

Now it's just a matter of adjusting the example code to fit into a larger project. I moved the code that was previously in `main` into a separate function and made it accept a "content" function that would be rendered inside the main loop.

```C++
void gui::render(std::function<void()> body) {
    // imgui setup...

    while (!done) {
        // check if we should exit...

        // create new frame, handle viewport/window position, ...

        body();

        // end frame, render it, post-frame cleanup...
    }
}
```

(This is really just to give you an idea of what I did to integrate the example code into my project. Take a look at [one of the examples](https://github.com/ocornut/imgui/tree/master/examples), it will be clearer.)

In the `main` of my project I could now do

```C++
int main (int, char **) {
    // ...

    gui::render([&message] {
        ImGui::Begin("maniac", nullptr, ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoResize);

        ImGui::Text("Status: %s", message.c_str());

        ImGui::DragIntRange2("Randomization", &maniac::config.randomization_range.first,
            &maniac::config.randomization_range.second);

        // ...
    });
}
```

Simple and clean!

Now for actually writing the GUI code: I recommend taking a look at the code of the [ImGui Demo window](https://github.com/ocornut/imgui/blob/master/imgui_demo.cpp), which showcases an impressive amount of features in an easy-to-read fashion. I was originally somewhat put-out by the fact that ImGui doesn't have any traditional documentatio; all of it is inside the actual source files. Looking back though, doing it this way is pretty neat. The starting point for most inquiries (and when just starting out learning) is the demo code, which is often self-explanatory and otherwise well commented. When something is not immediately clear, a quick search through the imgui codebase will quickly yield the relevant function declarations alongside documentation comments.

This workflow wasn't immediately intuitive to me, but it sure works well once you get used to it!
