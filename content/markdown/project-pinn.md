# Physics-Informed Neural Networks (PINNs)

## Overview

This project explores the application of Physics-Informed Neural Networks to solve partial differential equations (PDEs) without relying on traditional numerical methods.

## Motivation

Traditional numerical methods for solving PDEs can be computationally expensive and may struggle with complex boundary conditions. PINNs offer a novel approach by embedding physical laws directly into the neural network's loss function.

## Methodology

### Neural Network Architecture

The PINN architecture consists of:
- Input layer: spatial and temporal coordinates $(x, y, z, t)$
- Hidden layers: fully connected layers with activation functions
- Output layer: solution to the PDE $u(x, y, z, t)$

### Loss Function

The loss function combines:
$$\mathcal{L} = \mathcal{L}_{PDE} + \mathcal{L}_{BC} + \mathcal{L}_{IC}$$

where:
- $\mathcal{L}_{PDE}$: residual of the PDE
- $\mathcal{L}_{BC}$: boundary condition loss
- $\mathcal{L}_{IC}$: initial condition loss

## Results

The PINN successfully solved the heat equation with 95% accuracy compared to analytical solutions, while reducing computation time by 40% compared to finite element methods.

## Code

[View on GitHub](https://github.com/milescb/solve_PDEs_with_PINN)
