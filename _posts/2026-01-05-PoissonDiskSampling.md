---
layout: post
title: Poisson-Disk Sampling
date: 2026-01-05 09:00:00
description: Sampling Algorithm
tags:
categories:
thumbnail: assets/img/Blog/PoissonDiskSampling/
featured: false
---

<br>

**Poisson-Disk sampling** is an algorithm used to generate random samples within a user-defined domain, such that each two points are seperated by a minimum distance $$r$$. It produces a well-distributed set of random samples that are tightly-packed, yet not clumped or clustered together.

<br>
#### **Dart-Throwing Algorithm** <br>
<br>

One **naive** implementation of Poisson-Disk sampling is the **dart-throwing algorithm**. It is described as follows: 

1. Initialize an empty set $$S$$. This set will contain the final sample points. 

2. While $$
|S| < N
$$: 

    - Generate a random sample $$P$$ within $$E$$.
    
    - Check the distance $$d_i$$ between each point $$s_i$$ in $$S$$ and $$P$$. If there is at least one point $$s_i$$ in $$S$$ where $$d_i < r$$, then we discard $$P$$ and try again with a new point. Otherwise, $$P$$ is added to $$S$$.

> One problem with this algorithm is that at some point when the area is fully saturated, and there are still remaining samples to be generated, it will be difficult for any newly generated point to be approved, causing the algorithm to run forever. Hence, as a precaution, a maximum number of attempts $$A$$ is enforced, where $$A >= N$$. If all $$A$$ attempts are used, then the algorithm will terminate regardless of whether $$N$$ approved sample points were generated or not. 

Below is an **C++** implementation of the dart-throwing algorithm: 

<br>

```c++
#include <random>


float Random(float min, float max)
{
    static std::default_random_engine rng(std::random_device{}());
    std::uniform_real_distribution<float> dist(min, max);

    return dist(rng);
}

std::vector<float> Random(std::vector<float> min, std::vector<float> max, int n)
{
    std::vector<float> P(n);
    
    for(int i = 0; i < n; i++)
        P[i] = Random(min[i], max[i]);
    
    return P;
}

float ComputeDistanceSquared(const std::vector<float>& P, const std::vector<float>& Q, int n)
{
    float distance = 0.0f;
    for(int i = 0; i < n; i++)
        distance += ( (P[i] - Q[i]) * (P[i] - Q[i]) );
    
    return distance;
}

std::vector<std::vector<float>> DartThrowingAlgorithm(int N, int n, int A, float r, const std::vector<float>& min, const std::vector<float>& max)
{
    if((min.size() != n) || (max.size() != n))
        return {};
        
    float rSquared = r * r;
    std::vector<std::vector<float>> S;
    
    int a = 0;
    while( (samples.size() < N) && (a < A) ){
        std::vector<float> P = Random(min, max, n);
        bool isApproved = true;
        for(int i = 0; i < samples.size(); i++){
            float dSquared = ComputeDistanceSquared(P, S[i], n);
            if(dSquared < rSquared){
                isApproved = false;
                break;
            }
        }
        if(isApproved)
            S.push_back(P);
        a++;
    }
    
    return S;
}
```

<br>

As discussed before, the Dart-Throwing algorithm is naive and inefficient. The best-case scenario for the algorithm happens when each generated point $$P$$ is approved and added to the set $$S$$. That is, the best-case time complexity of the algorithm is

$$
T(N) = \sum_{k=1}^N D + Dk 
$$

$$
\sum_{k=1}^N D(k + 1) = D \sum_{k=1}^N (k + 1) 
$$

$$
= D \frac{N(N+3)}{2} = \Omega(D N^2)
$$

The worst-case scenario for the algorithm happens when $$N-1$$ points are generated and approved, and the $$N^{th}$$ point keeps getting rejected till the $$A-N+1$$ attempts left are used and the algorithm terminates. That is, the worst-case time complexity of the algorithm is

$$
T(N) = \sum_{k=1}^{N-1} k + (A-N+1)(N-1) 
$$

$$
= \frac{(N-1)(N-2)}{2} + (AN - A - N^2 + N + N - 1) 
$$

$$
= \frac{N^2}{2} - \frac{3N}{2} + 1 + AN - A - N^2 + 2N - 1 
$$

$$
= \frac{N^2}{2} - \frac{3N}{2} + AN - A - N^2 + 2N 
$$

$$
= -\frac{N^2}{2} + (\frac{1}{2} + A)N - A 
$$

$$
= O(N^2) + O(AN) 
$$

$$
= O(AN)
$$

<br>
#### **Bridson's Algorithm** <br>
<br>

**Bridson's algorithm** is another technique for implementing Poisson disk sampling that is much more efficient than the dart-throwing algorithm. It is described as follows: 

<br>
The algorithm takes as input the extent $$E$$ of the sample domain in $$R^n$$, the minimum distance $$r$$ between samples, and a constant $$k$$. 

1. Initialize an $$n$$-dimensional grid $$G$$ with cell size $$\frac{r}{\sqrt(n)}$$. Each cell in the grid $$G$$ will contain only **one** sample. 

2. Initialize an empty set $$A$$. This set will contain the "active samples".

3. Initialize another empty set $$S$$. This set will contain the final sample points. 

4. Generate an initial sample $$x \in E$$ and add it $$A$$, $$S$$ and $$G$$. 

5. While $$A$$ is non-empty:

    - Randomly choose sample $$a_i \in A$$.
    
    - Generate $$k$$ random candidate samples $$\{ w_1, w_2, ...., w_k\}$$ from the spherical annulus between radius $$r$$ and $$2r$$ around $$a_i$$
    
    - For each candidate $$w_j$$:
    
        - Locate the cell in $$G$$ in which $$w_j$$ will be stored. Say the cell is $$C_j$$
        
        - Around $$C_j$$, there are $$3^n - 1$$ distinct neighbouring cells. Each one of these cells is either empty or have one existing sample $$q_m$$.
        
        - For each sample $$q_m$$: 
        
            - Calculate its distance from $$w_j$$. 
            
            - If the distance is less than $$r$$, then $$w_j$$ is rejected.
            
        - If all the samples $$q_m$$ were adequately far from $$w_j$$, then $$w_j$$ is approved, and is added to $$S$$, $$A$$ and $$G$$. 
        
    - If all the candidates $$w_j$$ were rejected, then remove $$a_i$$ from $$A$$.

<blockquote>
Each cell in the grid \(G\) has \(3^n - 1\) <b>distinct</b> neighbors.
<br>
<br>
<b><b>Proof</b></b>
<br>
<br>
Let \(C\) be a cell in \(G\) with index \(i\), such that 

$$
i = (i_1, i_2, ......, i_n)
$$

A cell with index \(j\) is a neighbor to \(C\) if and only if

$$
\forall_{1 \, \leq \, k \, \leq \, n} \; \; j_k = i_k ± d
$$

where \(d \in \{ -1, 0, 1\} \). That is, 

<br>
<br>

<ul><li> If \(d = -1\), then we get the previous cell in dimension \(k\)</li></ul>
<ul><li> If \(d = 0\), then we get the same cell in dimension \(k\)</li></ul>
<ul><li> If \(d = 1\), then we get the next cell in dimension \(k\)</li></ul>

<br>

This means that for every dimension \(1 \, \leq \, k \, \leq \, n\), there are \(3\) neighboring cells. Hence, the total number of neighbors to \(C\) is 

$$
3 \times 3 \times ... \times 3 = 3^n
$$

However, this count includes the cell \(C\) itself, which is the case when \(d = 0\) in all \(k\) dimensions. Thus, the total number of <b>distinct</b> neighbors is 

$$
3^n - 1
$$

\(\blacksquare\)
</blockquote>

<br>


Let $$C$$ be a cell in $$G$$ with index $$i = (i_1, i_2, ......, i_n)$$. We know that $$C$$ has $$3^n$$ neighbors $$\{N_1, N_2, ..., N_{3^n -1}\}$$, including $$C$$ itself. We can calculate the cell index of $$N_j$$ using the following function: 

```c++
std::array<int, n> ComputeNeighborCellIndex(std::array<int, n> C, int n, int j)
{
    std::array<int, n> index = C;
    
    for(int i = 0; i < n; i++){
        int offset = (j % 3) - 1;
        j /= 3;
        index[i] += offset;
    }
    
    return index;
}
```

The idea of this function is that we represent each index $$j$$, where $$1 \leq j \leq 3^n$$ as a base-3 number (Ternary). Then using this ternary representation, we extract the offset $$d$$ by subtracing $$1$$ from every digit. This offset will be added to the index of cell $$C$$ to calculate the index of the neighbouring cell. That is, 

<br>

| Decimal  | Ternary | Offset  |
| -------- | ------- | ------- |
| $$0$$        | $$000$$     | $$\{-1, -1, -1\}$$|
| $$1$$        | $$001$$     | $$\{-1, -1, 0\}$$|
| $$2$$        | $$002$$     | $$\{-1, -1, 1\}$$    |
| $$3$$        | $$010$$     | $$\{-1, 0, -1\}$$     |
| $$4$$        | $$011$$     | $$\{-1, 0, 0\}$$     |
| $$5$$        | $$012$$     | $$\{-1, 0, 1\}$$     |
| $$6$$        | $$020$$     | $$\{-1, 1, -1\}$$     |
| $$7$$        | $$021$$     | $$\{-1, 1, 0\}$$     |
| $$8$$        | $$022$$     | $$\{-1, 1, 1\}$$     |
| $$9$$        | $$100$$     | $$\{0, -1, -1\}$$     |
| $$10$$       | $$101$$     | $$\{0, -1, 0\}$$     |

<br>

<blockquote>
The size of each cell in the grid \(G\) must be at most \(\frac{r}{\sqrt(n)}\). 
<br>
<br>
<b><b>Proof</b></b>
<br>
<br>
We know that the distance between any two points must be at least \(r\). We also know that each cell in the grid \(G\) must have only one point. Consider the cell \(C\) in \(G\). Let \(d\) be the length of the diagonal of \(C\) and \(s\) be its cell size. Suppose for the sake of contradiction that \(d > r\). This means that two points can be placed inside \(C\) whose distance is greater than or equal to \(r\). This violates the requirement that each cell in the grid \(G\) must have only one point. Thus, \(d \leq r\). Using Pythagoras theorem: 

$$
d^2 = s_1^2 + s_2^2 + ...... + s_n^2 = n \; s^2
$$

$$
s^2 = \frac{d^2}{n}
$$

$$
s = \sqrt(\frac{d^2}{n}) = \frac{d}{\sqrt(n)}
$$

Since \(d \leq r\), then

$$
s \leq \frac{r}{\sqrt(n)} 
$$

\(\blacksquare\)

</blockquote>

<br>

**Bridson's** algorithm is much faster than the **dart-throwing** algorithm. The number of iterations of the loop in Step $$5$$ is exactly $$2N-1$$, where $$N$$ is the number of samples. Each iteration takes $$O(k)$$ time. This means that the time complexity $$T(N)$$ of the algorithm is 

$$
T(N) = k(2N-1) = 2kN - k = O(2kN) - O(k) = O(kN)
$$

Since $$k$$ is constant, then $$T(N) = O(N)$$ time. That is, the algorithm is **linear**.

<blockquote>
Step \(5\) is executed exaclty \(2N-1\) times. 
<br>
<br>
<b><b>Proof</b></b>
<br>
<br>
The loop in step \(5\) of the algorithm terminates only if the active set \(A\) is empty. For each iteration of the loop, exactly <b>one</b> of the following <b>two</b> events occur: 
<br>
<br>
<ul><li> A new sample is added to \(A\)</li></ul>
<ul><li> An existing active sample is removed from \(A\)</li></ul>
<br>
Each sample point \(s_i \in S\) must <b>once</b> be added to \(A\) and <b>once</b> be removed from \(A\). After it is removal from \(A\), it can never be readded back into \(A\). This means that the total number of insertions is \(N\) and the total number of removals is \(N\). Since only one event happens in each iteration of the loop, then the number of iterations of the loop is \(2N\). However, the insertion of the first sample \(x\) into \(A\) is done in step \(4\) before the loop. Thus, the total number of iterations of the loop in step \(5\) is exactly \(2N-1\). 

<br>
<br>

\(\blacksquare\)
<br>
</blockquote>

<br>

Below is a full C++ implementation of **Bridson's** algorithm: 

<br>

```c++
#include <random>
#include <map>

struct Extent{
    std::vector<float> min;
    std::vector<float> max;
};

float Random(float min, float max)
{
    static std::default_random_engine rng(std::random_device{}());
    std::uniform_real_distribution<float> dist(min, max);

    return dist(rng);
}

int Random(int min, int max)
{
    static std::default_random_engine rng(std::random_device{}());
    std::uniform_int_distribution<int> dist(min, max);

    return dist(rng);
}

std::vector<float> Random(std::vector<float> min, std::vector<float> max, int n)
{
    std::vector<float> P(n);
    
    for(int i = 0; i < n; i++)
        P[i] = Random(min[i], max[i]);
    
    return P;
}

float ComputeDistanceSquared(std::vector<float> P, std::vector<float> Q, int n)
{
    float distanceSquared = 0.0f;
    for(int i = 0; i < n; i++)
        distanceSquared += ( (P[i] - Q[i]) * (P[i] - Q[i]) );
    
    return distanceSquared;
}

std::vector<int> ComputeCellIndex(std::vector<float> p, std::vector<float> min, int n, float cellSize)
{
    std::vector<int> j(n);
    
    for(int i = 0; i < n; i++)
        j[i] = (p[i] - min[i])/cellSize;
    
    return j;
}

std::vector<int> ComputeNeighborIndex(std::vector<int> i, int n, int j)
{
    std::vector<int> b = i;

    for(int d = 0; d < n; d++){
        int offset = (j % 3) - 1;
        j /= 3;
        b[d] += offset;
    }
    
    return b;
}

float ComputeMagnitude(std::vector<float> v)
{
    float magnitude = 0.0f;
    for(int i = 0; i < v.size(); i++)
        magnitude += (v[i]*v[i]);
        
    return std::sqrt(magnitude);
}

std::vector<float> Normalize(std::vector<float> v)
{
    std::vector<float> u = v;
    float magnitude = ComputeMagnitude(v);
    
    for(int i = 0; i < u.size(); i++)
        u[i] /= magnitude;
            
    return u;
}

std::vector<std::vector<float>> BridsonAlgorithm(int n, int k, float r, Extent E)
{
    float rSquared = r * r;
    int numNeighbors = pow(3, n);
    float cellSize = r / sqrt(n);
    std::vector<float> minDirection(n, -1.0f);
    std::vector<float> maxDirection(n, 1.0f);
    
    std::vector<float> x = Random(E.min, E.max, n);
    
    std::vector<std::vector<float>> S;
    S.push_back(x);
    
    std::vector<std::vector<float>> A;
    A.push_back(x);
    
    std::map<std::vector<int>, std::vector<float>> G; 
    G[ComputeCellIndex(x, min, n, cellSize)] = x;
        
    while(!A.empty()){
    
        // Pick the last element of A
        std::vector<float> a = A[A.size() - 1];
        
        bool retire = true;
        
        for(int t = 0; t < k; t++){
        
            // Generate a random sample from the spherical annulus between radius r and 2r around a
            std::vector<float> w = a + Normalize(Random(minDirection, maxDirection, n)) * Random(r, 2.0f*r);
            
            // i is the cell index of w in G
            std::vector<int> i = ComputeCellIndex(w, E.min, n, cellSize);
            
            bool approved = true;
            
            // Check every neighbor of w
            for(int m = 0; m < numNeighbors; m++){
            
                // j is the cell index of neighbor m
                std::vector<int> j = ComputeNeighborIndex(i, n, m);
                
                // Ignore if its the same cell as w
                if(i == j)
                    continue;
                    
                std::vector<float> q = G[j];
                
                if(q.empty())
                    continue;
                
                float dSquared = ComputeDistanceSquared(q, w, n);
                if(dSquared < rSquared){
                    approved = false;
                    break;
                }                    
            }
            
            // Candidate sample w is approved
            if(approved){ 
                S.push_back(w);
                A.push_back(w);
                G[i] = w;
                retire = false;
            }
        }
        
        // Remove the sample from A
        if(retire)
            A.pop_back();
    }
    
    return S;
}
```

<br>

***

<br>
#### **References** <br>
<br>

**[1]** [Fast Poisson Disk Sampling in Arbitrary Dimensions by Robert Bridson](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf)
