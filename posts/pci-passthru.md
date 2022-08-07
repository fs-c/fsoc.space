---
title: PCI passthrough
date: 2022-08-22
description: TODO
listed: false
---

https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF
https://askubuntu.com/questions/1406888/ubuntu-22-04-gpu-passthrough-qemu


1. enable iommu (vt-d) in mainboard

2. enable iommu support in kernel (edit /etc/default/grub and run update-grub)

3. install liquorix kernel, enable acs override (pcie_acs_override=downstream in grub), reboot

5. identify iommu groups to isolate
```bash
#!/bin/bash
shopt -s nullglob
for g in $(find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V); do
    echo "IOMMU Group ${g##*/}:"
    for d in $g/devices/*; do
        echo -e "\t$(lspci -nns ${d##*/})"
    done;
done;
```
ensure it only contains gpu/audio not a bus or something.
```
IOMMU Group 13:
	01:00.0 VGA compatible controller [0300]: NVIDIA Corporation TU106 [GeForce RTX 2070] [10de:1f02] (rev a1)
IOMMU Group 14:
	01:00.1 Audio device [0403]: NVIDIA Corporation TU106 High Definition Audio Controller [10de:10f9] (rev a1)
```

6. isolate the gpu. identify the drivers which are currently in use for the devices in the given groups with lspci -nnk and blacklist them. create /etc/modprobe.d/vfio.conf
```
blacklist nouveau
blacklist snd_hda_intel
blacklist i2c_nvidia_gpu
```
then tell vfio to isolate the devices in the groups you identified earlier
```
options vfio-pci ids=10de:1f02,10de:10f9,10de:1ada,10de:1adb
```

then do sudo update-initramfs -u to apply the changes

7. reboot and ensure lspci -nnk shows vfio-pci in use

8. 
