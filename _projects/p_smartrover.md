---
layout: page
title: Smart Rover – Version 1 & 2
description: A personal robotics project developing an omnidirectional autonomous ground vehicle, enhanced with robotic arm and computer vision.
img: assets/img/projects/fun/smartrover/smartrover.png
importance: 1
category: fun
---

## Smart Rover: Version 1 & Version 2

{% include figure.liquid path="assets/img/projects/fun/smartrover/smartrover.png" title="Smart Rover Prototype" class="img-fluid rounded z-depth-1" %}

### Overview
A personal robotics project that focuses on developing an **omnidirectional autonomous ground vehicle** using an **MPU6050 IMU** and **Arduino** to control four omni-wheels.  
The project was divided into two development stages:

- **Version 1**: Focused on **yaw stabilization** and added a **4-DOF robotic arm** for manipulation tasks.  
- **Version 2**: Enhanced with **YOLOv4 object detection** powered by **Jetson Nano**, enabling the rover to recognize and react to objects in real-time.  

### Contribution
- Designed the mechanical chassis and integrated omni-wheels for holonomic motion.  
- Implemented IMU-based yaw control using **PID algorithms**.  
- Designed and controlled the **4-DOF robotic arm** using inverse kinematics on Arduino.  
- Set up **YOLOv4 on Jetson Nano** for object detection and communication with the motor controller.  

### Results
- Developed two functioning rover prototypes demonstrating key robotic concepts: orientation control, object detection, and manipulation.  
- Enabled basic autonomous responses based on computer vision input.  
