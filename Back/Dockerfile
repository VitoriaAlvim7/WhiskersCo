# 1) Compila o projeto com Maven (as dependências ficam em cache entre builds)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B package -DskipTests

# 2) Roda só o .jar numa imagem enxuta com o Java 21
FROM eclipse-temurin:21-jre
WORKDIR /app
# A API usa o horário local (agenda, lembretes); o banco usa o mesmo fuso.
ENV TZ=America/Sao_Paulo
COPY --from=build /app/target/Back-*.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
