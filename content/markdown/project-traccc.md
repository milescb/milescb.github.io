# Track Reconstruction with GPU Acceleration

## Overview

Development of GPU-accelerated track reconstruction algorithms for high-energy physics experiments at CERN's Large Hadron Collider (LHC).

## Background

The High-Luminosity LHC will produce unprecedented amounts of collision data, requiring advanced algorithms to reconstruct particle trajectories in real-time.

## Objectives

- Accelerate track reconstruction algorithms using GPUs
- Implement inference-as-a-service architecture
- Achieve sub-millisecond latency for real-time processing

## Technical Approach

### GPU Acceleration

Using CUDA and SYCL to parallelize:
- Hit clustering
- Seed finding
- Track following
- Track fitting

### Performance Metrics

| Algorithm | CPU Time | GPU Time | Speedup |
|-----------|----------|----------|---------|
| Clustering | 45 ms | 2.1 ms | 21.4× |
| Seeding | 120 ms | 5.8 ms | 20.7× |
| Fitting | 80 ms | 3.2 ms | 25.0× |

## Infrastructure

The project leverages cloud infrastructure to provide tracking reconstruction as a service, enabling distributed processing across multiple GPU nodes.

## Publications

This work has contributed to several publications in high-energy physics conferences and journals.

## Links

- [GitHub Repository](https://github.com/milescb/traccc-aaS)
- [CERN Presentation](https://indico.cern.ch/event/1603161/contributions/6755302/attachments/3159774/5613472/general_exam_milescb.pdf)
