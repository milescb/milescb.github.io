# Physics-Informed Neural Networks (PINNs)

## Overview

This is my undergraduate senior thesis exploring the application of physics-informed neural networks to solve partial differential equations. The work implements neural networks to directly learn solutions to PDEs by embedding physical laws into the training process, leveraging the Universal Approximation Theorem to show that neural networks can approximate arbitrary PDE solutions.

## Motivation

Traditional numerical methods for solving PDEs—such as finite element and finite difference methods—are computationally expensive and struggle with complex boundary conditions or high-dimensional problems. Physics-informed neural networks (PINNs) offer an alternative paradigm by combining scientific machine learning with differential equations, enabling efficient and accurate solutions across a wide variety of PDE systems.

## Technical Approach

### Core Concept

Rather than discretizing space and time into grids, PINNs use neural networks $\mathcal{N}(x;w)$ to approximate PDE solutions directly. The key innovation is encoding the PDE constraint into the loss function:

$$\mathcal{L}(w) = \int_{\Omega} \left\|f(\mathcal{N}(x;w); \lambda)\right\| dx + \text{boundary condition terms}$$

where $f$ represents the PDE operator. This allows the network to learn both the solution and automatically satisfy the differential equation.

### Neural Network Architecture

- Input layer: spatial and temporal coordinates
- Hidden layers: fully connected with activation functions (sigmoid or tanh)
- Output layer: solution approximation $u(x,y,z,t)$

The Universal Approximation Theorem guarantees that with sufficient capacity, networks can approximate any continuous solution arbitrarily well.

## Applications

The thesis demonstrates the method on increasingly complex systems:

1. **Ordinary Differential Equations**: Solving initial value problems without analytical solutions
2. **Linear and Nonlinear PDEs**: Heat equations, advection problems, and coupled systems
3. **Complex Systems**: An ambitious application solving Einstein's field equations to obtain the Schwarzschild metric

The final application stretched the limits of current automatic differentiation tools by implementing differential programming—computing derivatives through an ODE solver within the loss function to match gravitational physics with Newtonian limits.

## Key Results

- Successfully solved multiple PDE systems with high accuracy compared to analytical solutions
- Demonstrated the flexibility of the PINN framework for diverse problem types
- Identified current limitations in automatic differentiation and memory management for complex loss terms
- Showed promise of the approach while revealing directions for future development in scientific machine learning

## Technical Details

The implementation uses the `NeuralPDE.jl` package in Julia, which provides symbolic PDE specification and automatic loss function construction. Training employs gradient-based optimization with carefully chosen learning rate schedules to balance convergence and accuracy.

## Code

[View on GitHub](https://github.com/milescb/solve_PDEs_with_PINN)
