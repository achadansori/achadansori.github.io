---
layout: page
title: Defect Detection with Deep Learning Computer Vision in Jetson Nano
description: Real-time defect detection system for Quality Control using Jetson Nano
img: assets/img/projects/work/toshin_cv/defect.jpg
importance: 1
category: work
related_publications: false
---

## Real-Time Defect Detection on Jetson Nano

> Developed a YOLOv4-based deep learning system running at 29.8 FPS on edge hardware for automated quality control inspection, tested as a working prototype at the QC station.

<div class="text-center my-3">
  <img src="/assets/img/projects/work/toshin_cv/fotobersama.jpg"
       class="img-fluid rounded z-depth-1"
       width="100%"
       height="auto"
       title="Internship Team at PT Toshin"
       loading="eager">
</div>

### The Problem

At **PT Toshin Prima Fine Blanking**, quality control was done manually by human operators — slow, inconsistent, and prone to fatigue-related errors. The factory needed an automated, real-time solution that could run on affordable hardware without cloud dependency.

### What I Built

An end-to-end visual inspection pipeline: from data collection and model training to prototype testing.

- Collected and labeled **product defect datasets** from the actual production line
- Trained a **custom YOLOv4 model** optimized with **TensorRT** for edge inference
- Integrated with **Logitech Brio camera** for high-resolution image capture
- Built a **Python application** for real-time visualization, classification, and logging
- Tested the system on **NVIDIA Jetson Nano** at the QC station as a working prototype

`YOLOv4` `TensorRT` `Jetson Nano` `Python` `OpenCV` `Deep Learning` `Edge AI`

### Results

| Metric | Value |
|--------|-------|
| Inference Speed | **29.8 FPS** |
| F1-Score | **0.9945** |
| Deployment | Prototype (QC station) |
| Hardware Cost | ~$150 (Jetson Nano) |

- Detected multiple defect types with near-perfect accuracy
- Reduced manual inspection time significantly
- System ran **fully offline** — no cloud required

---

## Detection Example

<div class="text-center my-3">
  <img src="/assets/img/projects/work/toshin_cv/defect.jpg"
       class="img-fluid rounded z-depth-1"
       width="100%"
       height="auto"
       title="Defect Detection Result"
       loading="eager">
</div>
