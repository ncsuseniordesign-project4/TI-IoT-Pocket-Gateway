using System;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Devices;
using Azure.Messaging.EventHubs.Consumer;

namespace PocketBeagleWebDemo.Pages
{
    ///<summary>
    /// Azure Client info class. Holds the connection info required for connecting to
    /// and authenticating with Azure.
    ///</summary>
    public class ClientInfo
    {
        ///<summary>
        /// Azure IoT Hub connection string, found on the Azure Dashboard.
        ///</summary>
        [Required]
        public string ConnectionString { get; set; }

        ///<summary>
        /// Azure Event Hub connection string, found on the Azure Dashboard.
        ///</summary>
        [Required]
        public string EventHubConnectionString { get; set; }

        ///<summary>
        /// Azure Event Hub compatible name, found on the Azure Dashboard.
        ///</summary>
        [Required]
        public string EventHubName { get; set; }
    }

    ///<summary>
    /// Implements functionality for sending and receiving remote device messages
    /// via Azure IoT Hub.
    ///</summary>
    public partial class IotHub
    {
        private readonly ClientInfo _clientInfo = new ClientInfo();
        private ServiceClient _client;
        private FeedbackReceiver<FeedbackBatch> _feedbackReceiver;
        private string _statusMsg = string.Empty;
        private string _currentValue = "Stream not started";
        private string _currentpHValue = "No data read yet";
        private bool _temperatureStreamActive;
        private CancellationTokenSource _cts;
        private StringBuilder _sb = new StringBuilder();

        ///<summary>
        /// Prepends the <paramref name="msg"/> to the Activity Log.
        ///</summary>
        /// <param name="msg">Message to prepend.</param>
        private void PrependStatus(string msg)
        {
            if (string.IsNullOrEmpty(msg))
            {
                return;
            }

            _sb.Insert(0, "</p>");
            _sb.Insert(0, msg);
            _sb.Insert(0, "<p>");
            _statusMsg = _sb.ToString();
        }

        ///<summary>
        /// Clears the Azure client info form.
        ///</summary>
        private void ClearClientForm()
        {
            PrependStatus("Client Form cleared");
            _clientInfo.ConnectionString = string.Empty;
            _clientInfo.EventHubName = string.Empty;
            _clientInfo.EventHubConnectionString = string.Empty;
        }

        ///<summary>
        /// Creates the Azure client from the information provided via <see cref="ClientInfo"/>.
        ///</summary>
        private async Task HandleValidClientSubmitAsync()
        {
            if (_client != null)
            {
                await _client?.CloseAsync();
            }

            PrependStatus("Creating Service Client.");
            _client = ServiceClient.CreateFromConnectionString(_clientInfo.ConnectionString);
            _feedbackReceiver = _client.GetFeedbackReceiver();
            PrependStatus("Service Client created.");

            await StartEventHubStreamAsync();
        }

        ///<summary>
        /// Begins streaming messages from the Azure Event Hub. Prepends each message to the
        /// Activity Log and updates UI labels with readings where appropriate.
        ///</summary>
        private async Task StartEventHubStreamAsync()
        {
            if (_temperatureStreamActive
                || string.IsNullOrWhiteSpace(_clientInfo.EventHubConnectionString)
                || string.IsNullOrWhiteSpace(_clientInfo.EventHubName))
            {
                PrependStatus("Event Hub configuration not provided");
                return;
            }

            PrependStatus("Event Hub stream started");
            _cts?.Dispose();

            await using var deviceStream = new EventHubConsumerClient(EventHubConsumerClient.DefaultConsumerGroupName, _clientInfo.EventHubConnectionString, _clientInfo.EventHubName);
            _temperatureStreamActive = true;
            _cts = new CancellationTokenSource();
            try
            {
                await foreach (var partitionEvent in deviceStream.ReadEventsAsync(_cts.Token))
                {
                    var msg = Encoding.UTF8.GetString(partitionEvent.Data.Body.Span);

                    if (msg.Contains("Reading:"))
                    {
                        if (msg.Contains("XBee"))
                        {
                            _currentpHValue = msg.Substring(msg.IndexOf("Reading:") + 8).Replace("\"}", "").Trim();
                        }
                        else if (msg.Contains("RPi"))
                        {
                            _currentValue = msg.Substring(msg.IndexOf("Reading:") + 8).Replace("\"}", "").Trim();
                        }
                    }
                    PrependStatus(msg?.ToString());
                    StateHasChanged();
                }
            }
            catch (TaskCanceledException)
            { }
            PrependStatus("Event Hub stream stopped");
        }

        ///<summary>
        /// Reads the simulated pH data from the remote XBee device.
        ///</summary>
        private async Task ReadpHAsync()
        {
            string device = "XBee";
            string msg = $"{{client: '{device}', message:'request_PH_data'}}";
            PrependStatus("Reading current water pH");
            await InvokeGatewayMethodAsync(msg, device);
        }

        ///<summary>
        /// Starts the simulated temperature stream from the remote Raspberry Pi device.
        ///</summary>
        private async Task EnableTemperatureStreamAsync()
        {
            string device = "RPi";
            string msg = $"{{client: '{device}', message:'turnON'}}";
            PrependStatus("Enabling soil temperature stream");
            await InvokeGatewayMethodAsync(msg, device);
        }

        ///<summary>
        /// Stops the simulated temperature stream from the remote Raspberry Pi device.
        ///</summary>
        private async Task DisableTemperatureStreamAsync()
        {
            string device = "RPi";
            string msg = $"{{client: '{device}', message:'turnOFF'}}";
            PrependStatus("Disabling soil temperature stream");
            await InvokeGatewayMethodAsync(msg, device);
        }

        ///<summary>
        /// Turns on the simulated water pump connected to the remote ESP32 device.
        ///</summary>
        private async Task EnableWaterPumpAsync()
        {
            string device = "ESP32";
            string msg = $"{{client: '{device}', message:'ON'}}";
            PrependStatus("Enabling Water Pump");
            await InvokeGatewayMethodAsync(msg, device);
        }

        ///<summary>
        /// Turns off the simulated water pump connected to the remote ESP32 device.
        ///</summary>
        private async Task DisableWaterPumpAsync()
        {
            string device = "ESP32";
            string msg = $"{{client: '{device}', message:'OFF'}}";
            PrependStatus("Disabling Water Pump");
            await InvokeGatewayMethodAsync(msg, device);
        }

        ///<summary>
        /// Invokes a remote method on a remote device via the Azure IoT Hub client.
        ///</summary>
        private async Task InvokeGatewayMethodAsync(string message, string device)
        {
            if (_client == null)
            {
                return;
            }

            try
            {
                var method = new CloudToDeviceMethod("sendMessageToLocalDevice");
                method.SetPayloadJson(message);
                var result = await _client.InvokeDeviceMethodAsync("pocketBeagleGateway", method);
                PrependStatus($"Received {result.Status} from {device}: {result.GetPayloadAsJson()}");
            }
            catch (Exception e)
            {
                PrependStatus(e.Message);
            }
        }
    }
}
