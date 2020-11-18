# TI IoT Pocket Gateway Demo and Testing Web App

This is a [Blazor](https://docs.microsoft.com/en-us/aspnet/core/blazor/?view=aspnetcore-5.0) server side app created from the default [dotnet templates](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-new).

Only the [`IotHub.razor`](https://github.com/ncsuseniordesign-project4/TI-IoT-Pocket-Gateway/blob/main/PocketBeagleWebDemo/PocketBeagleWebDemo/Pages/IotHub.razor) and [`IotHub.razor.cs`](https://github.com/ncsuseniordesign-project4/TI-IoT-Pocket-Gateway/blob/main/PocketBeagleWebDemo/PocketBeagleWebDemo/Pages/IotHub.razor.cs) files are new and where core functionality of this project resides.

This web app can be run locally or it can be hosted on Azure or another hosting platform. The Azure interaction functionality requires an existing IoT Hub and existing IoT Hub devices.

# Requirements

* [.NET 5 SDK](https://dotnet.microsoft.com/download)

## Optional Requirements

* [Docker](https://www.docker.com/) if wanting to run / host app in a Docker container.

# How to run

Clone the repo to a local folder, then build and run using `dotnet run -p <path to PocketBeagleWebDemo>`. For example, to run from the root of the repo, use `dotnet run -p PocketBeagleWebDemo/PocketBeagleWebDemo`
