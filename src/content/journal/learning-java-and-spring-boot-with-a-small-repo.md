---
title: "Learning Java and Spring Boot With a Small Repo You Can Actually Change"
excerpt: "I built a small Java + Spring Boot learning repo that starts with classes, methods, variables, loops, collections, and exceptions, then grows into controllers, services, dependency injection, OpenAPI, Docker, and deployment. This is the structure, the concepts, and how I would study it."
date: 2026-03-17
tags: ["java", "spring boot", "backend", "learning", "gradle", "software architecture"]
readingTime: "12 min read"
image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80"
draft: false
---

I wanted a Java learning project that did not stop at "Hello World" and did not jump straight into enterprise complexity.

So I built a small repository that starts with plain Java fundamentals and then grows into a modern Spring Boot application.

The goal was simple:

- learn the language basics in real code
- see how those basics map into a framework
- keep everything small enough to modify safely
- leave behind tests, docs, OpenAPI, Docker, and deployment files so the project feels complete

This post is a walkthrough of that repo: what it teaches, why the structure matters, and how I would use it to learn Java properly instead of just copying snippets.

## What the repo is trying to teach

There are really two tracks in the project.

The first track is **plain Java**:

- classes and objects
- methods
- variables and types
- `if` and `for`
- constructors
- `List` and `Map`
- exceptions
- packages
- annotations
- interfaces, inheritance, generics, streams, and enums

The second track is **Spring Boot**:

- controllers
- services
- dependency injection
- request and response models
- validation
- persistence with MongoDB
- security
- OpenAPI / Swagger
- Docker and deployment setup

That split matters.

A lot of Java tutorials teach syntax in isolation, while a lot of Spring tutorials assume you already understand the language well enough to read framework-heavy code. I wanted a repo that makes the bridge between those two stages explicit.

## Why a small repo is better than a huge one for learning

A learning repository should be large enough to show real structure, but small enough that you can still hold the whole thing in your head.

That is the main design constraint here.

The project uses:

- a Gradle build
- a focused package structure
- tests for both basic Java examples and Spring endpoints
- generated OpenAPI documentation
- a Docker setup for local container runs
- a deployment-oriented production profile
- a `docs/` folder that explains the codebase as a learning path

That combination makes it useful for three different activities:

1. reading code
2. changing code
3. verifying what changed

That third step is where a lot of learning repos are weak. If you cannot test a change, you are mostly guessing.

## The Java basics section

The plain Java side of the repo is there to make the language itself concrete before the framework abstractions start stacking up.

At the core, there are simple models and examples that show how Java code is structured:

- classes define state and behavior
- objects are instances of those classes
- constructors define how objects start life
- methods define what they can do
- fields store data with explicit types

That sounds obvious when written as a list, but it is much easier to understand when the examples are connected to tests and slightly more realistic behavior.

### Classes and objects

This is the first concept that needs to feel natural.

Java is object-oriented by default, so a lot of later design choices make more sense once you are comfortable with the idea that:

- a class is a blueprint
- an object is an instance with its own state

If you understand that deeply, later Spring concepts like "service beans" and "controller beans" become much less mysterious. They are still objects. The framework is just managing their lifecycle for you.

### Methods, variables, and types

The repo keeps these examples explicit:

- primitive and object types
- method parameters
- return values
- local variables vs fields
- basic transformations on data

In Java, type information is not just a compiler formality. It shapes how APIs are designed and how errors are prevented. Learning to read method signatures carefully is one of the highest-value habits a beginner can build.

### Control flow: `if` and `for`

The learning examples use `if` and `for` for the same reason I still like them in teaching material: they reveal control flow plainly.

Before moving to streams and more abstract collection operations, it helps to understand the direct version:

- check a condition
- loop through a list
- build a result
- stop or continue based on rules

That makes later "modern Java" features easier to evaluate rather than magical.

### Constructors

Constructors are one of those topics that seem small until you start reading real code.

They answer a fundamental question:

**What does an object need in order to exist in a valid state?**

That same question comes back in Spring through constructor injection. So learning constructors well pays off twice.

### Collections: `List` and `Map`

Collections are where most business code lives.

Even in a Spring app with a database, you still spend a lot of time manipulating lists of objects, mapping IDs to values, grouping records, and transforming data into response models.

That is why `List` and `Map` deserve first-class attention in a learning repo instead of being treated as side details.

### Exceptions

The repo includes custom exception examples because error handling is part of understanding control flow.

Exceptions are not just "bad things happened." They are part of the contract of the code:

- what can fail
- where failure is turned into a message or response
- how callers react

This becomes even more useful once you see a Spring controller map exceptions into structured HTTP error responses.

### Packages and annotations

Packages teach organization. Annotations teach metadata-driven behavior.

Those are both essential if you want Spring to feel readable.

Packages answer:

- where does this class belong?
- what layer is this code in?

Annotations answer:

- is this a controller?
- is this a service?
- is this a bean?
- is this field validated?
- how should this endpoint be documented?

Once you start thinking of annotations as "instructions attached to code," a lot of the framework becomes easier to reason about.

## The next Java layer: modern language features

After the basic syntax examples, the repo also grows into the features that make modern Java more expressive:

- interfaces
- inheritance and polymorphism
- generics
- streams
- enums
- records and immutable-style DTOs

These concepts matter because they show how Java scales from simple exercises to maintainable application code.

### Interfaces and dependency boundaries

Interfaces are important long before you need advanced architecture.

They help answer:

- what behavior matters here?
- what should callers depend on?
- what can be replaced in tests later?

Even if a project only has one implementation today, the discipline of separating the contract from the implementation is a useful way to think.

### Generics and type safety

Generics can feel noisy at first, but they are one of Java's best tools for making reusable code safe.

Once you understand why `List<Student>` is better than "just a list of objects," you start to appreciate how much the compiler can do for you.

### Streams

I do not think streams should replace learning loops.

I do think they matter once you already understand loops.

Streams help express data transformation more clearly when the operation is genuinely about:

- filtering
- mapping
- sorting
- collecting

That is why it helps to learn both styles in the same repo. You can compare them directly.

## Where Spring Boot starts to matter

Once the language basics are familiar, the Spring Boot part of the project starts to feel much less intimidating.

At a high level, Spring Boot turns your code into a web application by wiring together objects with conventions and annotations.

The main pieces are straightforward:

- a **controller** receives HTTP requests
- a **service** contains business logic
- a **repository** talks to storage
- **models** carry request and response data
- the framework creates and injects these objects for you

That is the mental model I would hold onto.

Everything else is detail on top of that.

## Controllers, services, and dependency injection

If I had to pick the most important Spring Boot concept for beginners, it would be dependency injection.

Not because it is flashy, but because it explains how the application is assembled.

A controller should not manually construct every dependency it needs. Instead, it declares what it depends on, and Spring provides it.

That pattern does a few useful things:

- reduces hard wiring between classes
- makes tests easier
- makes responsibilities clearer
- encourages smaller, more focused classes

This also connects nicely back to basic Java constructors.

Constructor injection is not some totally new framework trick. It is just the framework using ordinary Java constructors to provide dependencies.

That is a good example of why language fundamentals matter so much.

## Request and response models

One thing I wanted the repo to show clearly is that API models are not the same thing as every other object in the system.

Request models exist to describe what the client sends.

Response models exist to describe what the server returns.

Domain or persistence models exist to represent internal application state.

Keeping those ideas separate makes the code easier to evolve. It also makes validation and API documentation much cleaner.

This is one of the first places where a small learning repo can teach good habits instead of accidental shortcuts.

## Validation, persistence, and security

Once a Spring project can receive and return JSON, the next important layer is realism:

- validate input
- persist data
- secure endpoints

That is where the repo starts to move from "framework demo" toward "small backend service."

### Validation

Validation is useful because it makes the API contract explicit.

Instead of checking everything manually, you can declare rules on request models and let the framework reject invalid input consistently.

That reduces boilerplate and teaches an important architectural habit: push input constraints as close to the boundary as possible.

### Persistence with MongoDB

The repo adds a MongoDB-backed flow because without persistence, many backend examples stay too abstract.

It is useful to see:

- documents
- repositories
- service-layer orchestration
- tests that verify the HTTP and service flow around persistence

MongoDB is also a useful learning step because it keeps the data model close to JSON, which makes the transition from request bodies to stored documents easier to follow.

That is a good fit for a beginner-friendly backend because the communication format at the API boundary is already JSON. You can look at a request body, a response body, and a MongoDB document and see the relationship more directly than in a heavier relational setup.

### Security

Security is one of those areas that beginners often postpone for too long because it looks intimidating.

But even a small example helps:

- what is public?
- what requires authentication?
- where do credentials come from?
- how do different environments change those settings?

The repo keeps this simple, but that simplicity is still enough to introduce the core idea that security is part of application design, not a later patch.

## OpenAPI, Swagger, and why generated docs matter

I added Swagger UI and generated OpenAPI YAML because documentation should not drift away from the code if you can avoid it.

For learning, generated API docs are valuable because they make the application visible from the outside:

- which endpoints exist
- what parameters they accept
- what request bodies look like
- what response shapes come back

That gives beginners a concrete way to connect Java classes to HTTP behavior.

It also creates a healthy feedback loop:

1. change code
2. run tests
3. regenerate the OpenAPI file
4. inspect what the API now looks like

That is a much better learning experience than staring only at source files.

## Docker and deployment: the "real project" layer

One reason many learning repos feel incomplete is that they stop before the application is packaged and deployed.

This project does not go all the way to production-grade platform engineering, but it does include:

- a runnable Spring Boot jar
- Docker files for container runs
- a production Compose setup
- a MongoDB service for local and production-style runs
- externalized environment variables
- a production profile
- a documented deployment path

That matters because software is not just written. It is built, configured, run, and observed.

Even if you are still learning Java basics, it helps to see the whole chain.

## How I would study this repo

If I were using this repository as a learning path from scratch, I would not read it top to bottom once and call it done.

I would use a tighter loop.

### Stage 1: plain Java first

Start with the basics packages and tests.

Read a class, then answer:

- what data does this object hold?
- how is it constructed?
- what methods change or use that state?
- what happens on invalid input?

Then change something small:

- add a new field
- add a new validation rule
- change a loop
- add a new test case

### Stage 2: map those ideas into Spring

Then move into the Spring packages and repeat the same exercise:

- which class handles the request?
- which class owns the business logic?
- which models are for the API?
- where does validation happen?
- where is data loaded or saved?

This is where the connection between Java basics and framework structure starts to click.

### Stage 3: use the tooling

After that, use the repo like a real project:

- run the tests
- run the app
- hit the endpoints
- open Swagger UI
- inspect the generated `openapi.yaml`
- package the jar

That is how code turns from abstract material into working mental models.

## What I think this repo still teaches well even for experienced developers

Even if you are not new to Java, there is value in a compact repo like this.

It is a useful reminder that good learning material usually has these properties:

- small enough to understand
- realistic enough to matter
- documented enough to revisit later
- tested enough to change with confidence

That combination is harder to get right than it looks.

## Final thought

The main thing I wanted from this project was not "a Java repo."

I wanted a repo that makes it easier to answer questions like:

- what is Java actually doing here?
- what part is Spring adding?
- how do requests turn into code execution?
- where should logic live?
- how do I know a change still works?

That is the kind of project that helps you learn faster, because it gives you both examples and feedback.

If you are learning Java, I think that is the right bar.

Not the biggest repo.

Not the most "advanced" one.

Just one that is clear enough to read, structured enough to grow, and complete enough that changing it teaches you something real.
