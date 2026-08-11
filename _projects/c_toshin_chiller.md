---
layout: page
title: Chiller Monitoring Webbased
description: A web-based IoT system to monitor chiller machine operations in real time
img: assets/img/projects/work/toshin_chiller/fotobersama.jpg
importance: 2
category: work
---

## IoT Chiller Monitoring System

> Built an end-to-end IoT monitoring system for 2 critical factory chiller units — from sensor hardware to web dashboard — preventing unplanned downtime on the production floor.

{% include figure.liquid path="assets/img/projects/work/toshin_chiller/diagram.jpg" title="System Architecture" class="img-fluid rounded z-depth-1" %}

### The Problem

The **blanking machines** at PT Toshin depend on chiller units for cooling. When a chiller fails unexpectedly, the entire production line stops. The maintenance team had **no real-time visibility** into chiller health — they only knew about problems after a breakdown.

### What I Built

A full-stack IoT monitoring system: hardware sensors, data pipeline, and live web dashboard.

- Designed sensor nodes with **ESP32** to collect temperature, pressure, and current data from 2 chiller units
- Connected to **Raspberry Pi** as local server — running **MySQL** for data storage and **PHP** for backend
- Built a **web dashboard** for real-time data visualization
- Deployed on the **factory local network** — accessible by maintenance team from any browser

`ESP32` `Raspberry Pi` `MySQL` `PHP` `IoT`

### Impact

- Enabled **24/7 remote monitoring** — maintenance team sees anomalies before they become failures
- Helped detect **early warning patterns** in temperature and pressure fluctuations
- Reduced risk of **factory-wide production downtime** caused by chiller failure

---

## Documentation

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/projects/work/toshin_chiller/chiller-1.jpg" title="Hardware Setup" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/projects/work/toshin_chiller/chiller-2.jpg" title="Web Dashboard" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/projects/work/toshin_chiller/chiller-3.jpg" title="Sensor on Chiller" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
