FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/ClinicNext.Api/ClinicNext.Api.csproj backend/ClinicNext.Api/
RUN dotnet restore backend/ClinicNext.Api/ClinicNext.Api.csproj

COPY backend/ClinicNext.Api backend/ClinicNext.Api
RUN dotnet publish backend/ClinicNext.Api/ClinicNext.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=7860

COPY --from=build /app/publish .

EXPOSE 7860

ENTRYPOINT ["dotnet", "ClinicNext.Api.dll"]
