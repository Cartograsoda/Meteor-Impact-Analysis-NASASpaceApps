# Spring Boot

## What Is It?

Spring Boot is a framework built on top of the Spring Framework that provides a convention-over-configuration approach to building Java applications. It eliminates the tedious XML configuration that plagued early Spring projects.

## Why We Chose It

### 1. Embedded Server
Spring Boot packages an embedded Tomcat server. This means our application is a self-contained JAR file. No separate server installation required.

```
Traditional Java:   App.war → Deploy to Tomcat → Configure server
Spring Boot:        App.jar → Just run it
```

### 2. Dependency Injection
The framework manages object lifecycles. When our `NeoController` needs a `NasaProxyService`, Spring creates and injects it automatically:

```
@RestController
public class NeoController {
    private final NasaProxyService service; // Spring injects this
    
    public NeoController(NasaProxyService service) {
        this.service = service;
    }
}
```

### 3. Annotation-Driven Development
Annotations replace configuration files:

| Annotation | Purpose |
|------------|---------|
| `@RestController` | Marks a class as HTTP endpoint handler |
| `@GetMapping` | Maps GET requests to methods |
| `@Service` | Marks a class for dependency injection |
| `@Value` | Injects configuration values |

### 4. Auto-Configuration
Spring Boot scans the classpath and configures beans automatically. Adding `spring-boot-starter-web` to Maven enables:
- Embedded Tomcat
- JSON serialization with Jackson
- Exception handling
- CORS configuration

## The Alternative Considered

**Express.js (Node)** is lighter, but:
- No compile-time type checking
- Manual dependency management
- Less mature for enterprise patterns (caching, metrics)

Spring Boot gives us production-ready infrastructure with minimal setup.

