---
layout: page
title: Balancing Submarine Drone with MultiWii
description: A personal project repurposing the MultiWii flight controller for underwater balancing, simulating AUV dynamics with low-cost open-source hardware.
img: assets/img/projects/fun/submarinedrone/submarnedrone.png
importance: 1
category: fun
---

## Balancing Submarine Drone with MultiWii

{% include figure.liquid path="assets/img/projects/fun/submarinedrone/submarnedrone.png" title="Submarine Drone Prototype" class="img-fluid rounded z-depth-1" %}

### Overview
This **personal project** explores the development of a **self-balancing submarine drone** using the **MultiWii flight controller**, originally designed for aerial drones.  
The system integrates an **MPU6050 IMU** and applies **PID-based control** to maintain stability in pitch and roll while submerged.  
The aim was to simulate the control behavior of an **Autonomous Underwater Vehicle (AUV)** with a focus on **low-cost, open-source hardware**.  

### Contribution
- Interfaced the **MPU6050 sensor** with the MultiWii system using I2C.  
- Modified the **MultiWii firmware** to enable underwater balancing logic.  
- Implemented **PID tuning** for dynamic stability.  
- Performed testing and logging data in controlled water environments.  

### Results
- Repurposed the **MultiWii system** for **underwater stabilization**.  
- Achieved **basic pitch and roll balance control** underwater.  
- Built a testable prototype demonstrating key principles in **AUV dynamics**.  
- Shared the complete source code and documentation publicly for community learning and future development.  

📂 **GitHub Repository**: [Balancing Submarine Drone](https://github.com/achadansori/Balancing_Submarine_Drone.git)  

---

## MultiWii GUI

{% include figure.liquid path="assets/img/projects/fun/submarinedrone/multiwiigui.png" title="MultiWii GUI for Submarine Drone" class="img-fluid rounded z-depth-1" %}

---

## Prototype Video
<iframe width="560" height="315" src="https://www.youtube.com/embed/45Yhy4n-Zzc?si=Q8YMVFe3EgpgdgAc" 
title="Prototype Video – Balancing Submarine Drone with MultiWii" frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

