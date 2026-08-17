# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (layer-cached)
COPY LoggerService.csproj ./
RUN dotnet restore

# Copy remaining source and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create log directory that FileLoggerService will write to
RUN mkdir -p /app/logs

# Copy published output from build stage
COPY --from=build /app/publish .

# Expose the ASP.NET Core default port
EXPOSE 8080

# Set ASP.NET Core to listen on all interfaces
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "LoggerService.dll"]
