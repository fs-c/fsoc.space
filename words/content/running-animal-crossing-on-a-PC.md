{ "title": "Running Animal Crossing on a PC", "date": "2020-04-13" }

_Unless you are willing to resort to [online piracy](https://en.wikipedia.org/w/index.php?title=Online_piracy&oldid=947274838) you are required to own a Nintendo Switch and a copy of Animal Crossing: New Horizons to follow this guide. Do remember that this is the internet, though -- there's very few things you can't find here and certainly not the kind of things that are required for this process._

_The contents of this guide deal with experimental technology and may be outdated at the time you're reading this, although I will try to keep it updated._

The goal of this guide is to set up a Nintendo Switch [emulator](https://en.wikipedia.org/w/index.php?title=Emulator&oldid=947215529) in order to run the game [Animal Crossing: New Horizons](https://en.wikipedia.org/w/index.php?title=Animal_Crossing:_New_Horizons&oldid=950659793), developed by Nintendo.

## Setting up the emulator

[Ryujinx](https://ryujinx.org/), a "simple, experimental Nintendo Switch emulator written in C#" is the only emulator currently capable of running ACNH. Even then, a preview build is required which can be downloaded openly from their [Patreon page](https://www.patreon.com/posts/animal-crossing-35196813).

Download the archive which is appropiate for your operating system (builds are only provided for Windows and Linux) and extracted it in an appropiate location -- for Linux this is `/usr/local/ryujinx`, for Windows it's `C:\Program Files\ryujinx`. The folder you extracted it to should now contain a `Ryujinx` executable.

On Linux, the relevant commands are something like
```
$ cd /usr/local
$ tar -xzf ~/Downloads/ryujinx-1.0.0-acnh4-linux_x64.tar.gz publish
$ mv publish ryujinx
```

When executing Ryujinx you will get a warning that a key file was not found, to find out how to get said key file take a look at [`KEYS.md`](https://github.com/Ryujinx/Ryujinx/blob/master/KEYS.md) in the Ryujinx repository. For running ACNH only the `prod.keys` file is required, which contains commom keys used by all Nintendo Switch devices (and which should also make it very easy to find online).

Once you have your `prod.keys` file, move it to `~/.switch/prod.keys`.

You will now be able to start Ryujinx without any warnings, but you will still need to install the Nintendo Switch firmware in order to run any game. Again, you can dump this yourself from your own device using a tool like the [Firmware Dumper](https://gbatemp.net/threads/firmware-dumper.522522/) by GBATemp user f0mey or simply search for it on the internet.

Once you have obtained the firmware (either as a .zip or .xci file or extracted to a directory) navigate to `Tools > Install Firmware` in the taskbar and select the relevant option.

## Setting up the game

In order to run ACNH you will naturally first have to obtain a copy of it. I'd recommend using [nxdumptool](https://github.com/DarkMatterCore/nxdumptool) to dump the game from your Nintendo Switch, but there exist a number of alternatives.

I recommend creating a dedicated directory for your Switch games and adding it to the list of 'Game Directories', which Ryujinx checks for .xci files, by navigating to `Options > General > Add (under Game Directories)`. Once you've created and added said directory, simply move the .xci file you obtained there.

__This concludes the guide.__ Assuming your keys are good and your firmware is reasonably up to date you should be able to start the game without any problems. If your game is crashing in the introduction you can use a save file which skips it completely -- said file can be downloaded from the [Ryujinx Patreon post](https://www.patreon.com/posts/animal-crossing-35196813) from which you also got the preview build. Under 'How to install a save file?' the post also contains step by step instructions to install the file.
