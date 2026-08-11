---
layout: page
title: Automatic Aerator for Traditional Fish Farmers
description: An upgraded prototype of an affordable automatic aerator system for traditional fish farmers
img: assets/img/projects/work/venambak_autove/autove-1.jpg
importance: 3
category: work
---

## AutoVE: Autonomous Mobile Aerator V2

> Upgraded a basic fish pond aerator into a Linux-powered autonomous mobile platform with smartphone control and solar charging — preparing for AI-based navigation.

{% include figure.liquid path="assets/img/projects/work/venambak_autove/autove-1.jpg" title="AutoVE V2 Prototype" class="img-fluid rounded z-depth-1" %}

### The Problem

Traditional fish farmers use **stationary aerators** that only oxygenate a small area of the pond. Moving them manually is labor-intensive. V1 used an ESP32 but was too limited for real-time processing and future AI features like obstacle avoidance.

### What I Built

Redesigned the entire platform from microcontroller-based to a **Mini PC (Linux)** architecture.

- Migrated control system from **ESP32 to Mini PC** — enabling Python, real-time processing, and future AI stack
- Redesigned **power system** from AC car battery to DC motors with **solar panel compatibility**
- Built **smartphone control interface** over local WiFi for manual operation
- Implemented **dual-mode framework**: manual control + autonomous waypoint navigation
- Designed **modular wiring and hardware schematics** for easy sensor/actuator expansion

`Linux` `Python` `Mini PC` `Solar Power` `WiFi Control` `Autonomous Navigation`

### Status

- Working prototype with **smartphone control** and **solar-compatible power**
- Foundation laid for **AI collision avoidance** and GPS waypoint navigation in next iteration
- Targeting deployment as affordable, off-grid mobile aerator for rural fish farmers

---

## Field Test

<div class="row justify-content-sm-center">
  <div class="col-sm-10 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/projects/work/venambak_autove/autove-2.jpg" title="AutoVE V2 Field Test" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

---

## Demo Video

<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7336785360493940736?compact=1" height="399" width="504" frameborder="0" allowfullscreen title="AutoVE Demo"></iframe>
