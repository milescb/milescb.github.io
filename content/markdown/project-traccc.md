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

### GPU as a Service Architecture

Rather than directly coupling CPU and GPU on the same node, we implement a coprocessor-as-a-Service (aaS) paradigm that separates the GPU algorithm onto a dedicated GPU server as shown below:

<img src="/content/images/aas_picture.png" alt="GPU as a Service Architecture Comparison" style="max-width: 100%; height: auto; display: block; margin: 20px auto;">

*Comparison of Heterogeneous Computing (Direct Connection) and GPU as a Service paradigms. Direct connection couples CPU and GPU on the same node, while as-a-Service separates the GPU algorithm to a dedicated GPU server.*

This approach offers several key advantages:

**Motivation:**
- Heterogeneous computing can result in inefficient GPU utilization when many CPU processes cannot fully occupy a single GPU, or when a GPU algorithm cannot fully occupy a GPU even with concurrent CPU processes
- Traditional integration of complex GPU code into production frameworks like ATHENA is challenging and requires tight coupling
- Industry-proven containerization and backend approaches for serving machine learning models can be applied to particle tracking

**Implementation:**
We use the Triton Inference Server as our backend framework, with a custom C++ backend wrapping the TRACCC algorithm. This architecture provides:
- Multiple concurrent instances of the GPU backend on a single device
- Dynamic management of client requests from single or multiple sources
- Minimal data exchange between client and server via gRPC protocol
- Complete decoupling of CPU and GPU components, enabling seamless integration into production frameworks

**Client Integration:**
We have developed an ATHENA client to interface with our backend, with no direct dependencies on TRACCC—all TRACCC dependencies are compiled within the container image. The modular design allows future integration with other track finding algorithms by simply changing the ingress point, and supports flexibility in switching between different tracking pipelines.

## Expected Results

This GPU as a Service approach enables several key improvements:
- **Enhanced GPU Utilization:** Multiple model instances can be loaded onto a single GPU, overcoming the latency overhead introduced by the service architecture
- **Scalability:** The infrastructure scales gracefully by increasing concurrent requests and model instances without requiring CPU modifications
- **Future Performance Gains:** Less memory-hungry versions of TRACCC will enable significantly more model instances per GPU, approaching full GPU compute saturation
- **Production Ready:** The architecture provides a scalable and reliable path for deploying GPU-accelerated particle tracking within production frameworks

<img src="/content/images/throughput_gpu_util_old.pdf" alt="GPU Throughput and Utilization Scaling" style="max-width: 100%; height: auto; display: block; margin: 20px auto;">

*Performance scaling demonstrating throughput improvements and GPU utilization as multiple Triton model instances are deployed on a single GPU. The results show enhanced GPU efficiency through concurrent request management and multiple model instances.*

## Resources

- [GitHub Repository](https://github.com/milescb/traccc-aaS)
- [CERN Presentation](https://indico.cern.ch/event/1572204/contributions/6831725/attachments/3194328/5685546/uslua_traccc_aaS_2025.pdf)
