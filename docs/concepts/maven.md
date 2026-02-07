# Maven

## What Is It?

Maven is a build automation and dependency management tool for Java projects. It uses an XML file called `pom.xml` (Project Object Model) to define project structure, dependencies, and build lifecycle.

## Why We Chose It

### 1. Dependency Management
Instead of manually downloading JAR files and managing classpath hell, we declare dependencies:

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Maven downloads this from the Maven Central repository, including all transitive dependencies.

### 2. Standardized Project Structure
Maven enforces a conventional layout:

```
src/
├── main/
│   ├── java/          # Production code
│   └── resources/     # Configuration files
└── test/
    └── java/          # Test code
```

Any developer familiar with Maven instantly knows where to find things.

### 3. Build Lifecycle
Maven defines phases that execute in order:

```
validate → compile → test → package → verify → install → deploy
```

Running `mvn package` executes all phases up to and including `package`, producing a runnable JAR.

### 4. Reproducible Builds
The `pom.xml` locks dependency versions. Anyone cloning the project gets identical dependencies.

## POM File Structure

```
<project>
    <parent>...</parent>           <!-- Inherit from Spring Boot parent -->
    <groupId>com.neo</groupId>     <!-- Organization identifier -->
    <artifactId>neo-engine</artifactId>   <!-- Project name -->
    <version>1.0.0</version>       <!-- Semantic version -->
    
    <dependencies>                 <!-- External libraries -->
        <dependency>...</dependency>
    </dependencies>
    
    <build>                        <!-- Build configuration -->
        <plugins>...</plugins>
    </build>
</project>
```

## The Alternative Considered

**Gradle** uses Groovy/Kotlin DSL instead of XML. It's faster for large projects, but:
- Steeper learning curve
- Less widespread adoption
- For our project size, build speed difference is negligible

Maven's ubiquity means better IDE support and more Stack Overflow answers.

